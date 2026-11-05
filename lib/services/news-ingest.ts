/**
 * Ingesta de noticias de bitcoinarg.news. Reemplaza a Make (RSS → planilla →
 * publicador): la dispara cada hora `.github/workflows/ingest-news.yml` contra
 * `/api/cron/ingest-news`.
 *
 * Por cada nota nueva de los feeds: se reclama en `ingested_items`, Claude la
 * reescribe y le pone relevancia, y si pasa el corte se publica con
 * `createPost` (portada de Gemini y avisos a Discord, Telegram y X).
 */
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPost } from '@/lib/services/create-post';
import { FeedItem, articleText, parseFeed } from '@/lib/services/rss';

const DOMAIN = 'bitcoinarg.news';
const FEEDS = [
  { name: 'CriptoNoticias', url: 'https://www.criptonoticias.com/feed/' },
  { name: 'BeInCrypto', url: 'https://es.beincrypto.com/feed/' },
];
/** UA honesto: si un medio no nos deja leer, queda anotado y se respeta. */
const USER_AGENT = 'bitcoinarg.news-ingest/1.0 (+https://www.bitcoinarg.news)';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
/** El mismo corte que usaba el publicador de Make. */
const MIN_RELEVANCIA = 40;
/**
 * Pasado esto no se arranca otra nota. Una nota tarda hasta ~160 s (Claude 100
 * + portada 45 + avisos) y la función corta a los 300.
 */
const START_BUDGET_MS = 100_000;
/** Menos que esto es un copete, no una nota: Claude tendría que inventar. */
const MIN_TEXT_CHARS = 600;
const MAX_TEXT_CHARS = 9000;
const MODEL = 'claude-sonnet-5-5';
const CATEGORIES: Record<number, string> = {
  176: 'Adopción',
  174: 'Regulación',
  162: 'Stablecoins',
  163: 'Hackeo',
  173: 'Bitcoin',
  175: 'Mercados',
  80: 'Tokenización',
  177: 'Geopolítica',
};
const FALLBACK_CATEGORY = 173;

const SYSTEM = `Sos el editor de bitcoinarg.news, un medio argentino de noticias sobre Bitcoin y cripto. Recibís una noticia de una fuente externa y la reescribís para el sitio.

Reglas de redacción:
- Reescribí la noticia con tus palabras. Nunca copies frases textuales de la fuente.
- title: título propio en español rioplatense, 55-75 caracteres, sin clickbait y sin comillas.
- content: el cuerpo en Markdown, 350-550 palabras, con 3 a 5 subtítulos de nivel "## ". Agregá contexto para el lector argentino/LATAM cuando aplique. Cerrá con una línea final con este formato exacto: *Fuente: [nombre del medio](URL de la fuente).*
- excerpt: copete de 140-180 caracteres, una sola oración, sin punto final.
- category: UN solo id de este listado. ${Object.entries(CATEGORIES)
  .map(([id, name]) => `${id} ${name}`)
  .join(', ')}. Si dudás, usá ${FALLBACK_CATEGORY}.
- relevancia: entero de 0 a 100 según esta escala. 80-100: impacta directo al lector argentino (regulación o impuestos en Argentina, pesos y stablecoins en el país, exchanges locales, adopción local). 60-79: noticia global de peso que mueve al mercado (ETF, Fed, halving, movimientos fuertes de BTC o ETH, hackeos grandes, regulación de EE.UU. o la UE). 40-59: industria cripto de interés medio, sin impacto local claro. 20-39: altcoins menores, precio de corto plazo, noticias de otros mercados. 0-19: publicidad, promociones, contenido patrocinado o irrelevante. Usá toda la escala: si la noticia es global y relevante, ponele 60 o más.

No inventes datos, cifras ni declaraciones que no estén en el material recibido.`;

const RewriteSchema = z.object({
  title: z.string(),
  content: z.string(),
  excerpt: z.string(),
  category: z.number().int(),
  relevancia: z.number().int(),
});

type SourcedItem = FeedItem & { source: string; pubDate: Date };
type Outcome = 'published' | 'skipped' | 'errors' | 'retried';

export interface IngestSummary {
  published: number;
  skipped: number;
  /** Quedaron en `ingested_items` con status `error`: no se reintentan solas. */
  errors: number;
  /** Fallas pasajeras (red, Claude saturado): se reintentan en la próxima corrida. */
  retried: number;
  /** Notas nuevas que no entraron en el tiempo de esta corrida. */
  pending: number;
  feedErrors: string[];
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const fetchPage = (url: string) =>
  fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });

/** Red, timeouts, 408/409/429 y 5xx. Un 400/401/403/404 es nuestro y se repetiría en cada nota. */
const isTransient = (error: InstanceType<typeof Anthropic.APIError>) =>
  error.status === undefined || error.status >= 500 || [408, 409, 429].includes(error.status);

async function readFeeds(feedErrors: string[]): Promise<SourcedItem[]> {
  const perFeed = await Promise.all(
    FEEDS.map(async feed => {
      try {
        const response = await fetchPage(feed.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return parseFeed(await response.text()).flatMap(item =>
          item.pubDate ? [{ ...item, pubDate: item.pubDate, source: feed.name }] : []
        );
      } catch (error) {
        const message = `${feed.name}: ${errorMessage(error)}`;
        console.error('[ingest] No se pudo leer el feed', message);
        feedErrors.push(message);
        return [];
      }
    })
  );
  return perFeed.flat();
}

function userMessage(item: SourcedItem, text: string): string {
  return [
    `Título original: ${item.title}`,
    `Fecha: ${item.pubDate.toISOString()}`,
    `URL de la fuente: ${item.link}`,
    `Medio: ${item.source}`,
    '',
    `Resumen del feed: ${item.description}`,
    '',
    'Texto del artículo:',
    text.slice(0, MAX_TEXT_CHARS),
  ].join('\n');
}

// ponytail: si la función muere a mitad de una nota (timeout de Vercel), la fila queda en
// `claimed` y esa nota no se vuelve a intentar. Si pasa seguido, barrer `claimed` viejos al arrancar.
async function ingestItem(client: Anthropic, item: SourcedItem): Promise<Outcome | 'taken'> {
  try {
    await prisma.ingestedItem.create({ data: { link: item.link, title: item.title, status: 'claimed' } });
  } catch (error) {
    // Otra corrida la reclamó primero.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return 'taken';
    throw error;
  }

  const finish = (status: string, data: { relevancia?: number; postId?: number; detail?: string } = {}) =>
    prisma.ingestedItem.update({ where: { link: item.link }, data: { status, ...data } });
  const release = () => prisma.ingestedItem.delete({ where: { link: item.link } });

  console.log(`[ingest] Procesando (${item.source}):`, item.link);

  // El feed de BeInCrypto trae la nota entera; el de CriptoNoticias solo un copete.
  let text = item.content ?? '';
  if (text.length < MIN_TEXT_CHARS) {
    let response: Response;
    try {
      response = await fetchPage(item.link);
    } catch (error) {
      console.warn('[ingest] No se pudo bajar la nota, se reintenta:', errorMessage(error));
      await release();
      return 'retried';
    }
    if (!response.ok) {
      if (response.status >= 500 || response.status === 429) {
        await release();
        return 'retried';
      }
      // 403/404: el medio no deja leer la nota. Se anota y no se insiste cada hora.
      console.warn(`[ingest] La nota respondió HTTP ${response.status}, se saltea`);
      await finish('skipped', { detail: `nota HTTP ${response.status}` });
      return 'skipped';
    }
    text = articleText(await response.text());
  }
  if (text.length < MIN_TEXT_CHARS) {
    await finish('skipped', { detail: `texto corto (${text.length} caracteres)` });
    return 'skipped';
  }

  let rewrite: z.infer<typeof RewriteSchema>;
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage(item, text) }],
      output_config: { effort: 'medium', format: zodOutputFormat(RewriteSchema) },
    });
    if (response.stop_reason === 'refusal') {
      await finish('skipped', { detail: `Claude rechazó (${response.stop_details?.category ?? 'sin categoría'})` });
      return 'skipped';
    }
    if (!response.parsed_output) {
      await finish('error', { detail: `Claude no devolvió JSON (${response.stop_reason})` });
      return 'errors';
    }
    rewrite = response.parsed_output;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      await release();
      // Clave inválida, sin permiso o pedido mal armado: frena la corrida para que el workflow falle a la vista.
      if (!isTransient(error)) throw error;
      console.warn('[ingest] Claude falló, se reintenta en la próxima corrida:', errorMessage(error));
      return 'retried';
    }
    // JSON que no cumple el schema: reintentar costaría lo mismo y fallaría igual.
    await finish('error', { detail: `Claude: ${errorMessage(error)}`.slice(0, 500) });
    return 'errors';
  }

  const { relevancia } = rewrite;
  if (relevancia < MIN_RELEVANCIA) {
    console.log(`[ingest] Relevancia ${relevancia}, no se publica`);
    await finish('skipped', { relevancia, detail: 'relevancia baja' });
    return 'skipped';
  }

  const category = rewrite.category in CATEGORIES ? rewrite.category : FALLBACK_CATEGORY;
  try {
    const { post, cover } = await createPost({
      title: rewrite.title,
      content: rewrite.content,
      excerpt: rewrite.excerpt,
      domain: DOMAIN,
      status: 'publish',
      categories: [category],
    });
    console.log(`[ingest] Publicada (relevancia ${relevancia}): post ${post.id}`);
    await finish('published', { relevancia, postId: post.id, detail: `portada: ${cover}`.slice(0, 500) });
    return 'published';
  } catch (error) {
    console.error('[ingest] No se pudo publicar:', errorMessage(error));
    await finish('error', { relevancia, detail: errorMessage(error).slice(0, 500) });
    return 'errors';
  }
}

export async function runIngest(): Promise<IngestSummary> {
  const startedAt = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta ANTHROPIC_API_KEY');

  // Sin reintentos del SDK: la próxima corrida es el reintento, y así el tiempo no se va en esperas.
  const client = new Anthropic({ apiKey, timeout: 100_000, maxRetries: 0 });
  const summary: IngestSummary = { published: 0, skipped: 0, errors: 0, retried: 0, pending: 0, feedErrors: [] };

  const items = await readFeeds(summary.feedErrors);
  const fresh = items.filter(item => startedAt - item.pubDate.getTime() <= MAX_AGE_MS);
  const seen = new Set(
    (
      await prisma.ingestedItem.findMany({
        where: { link: { in: fresh.map(item => item.link) } },
        select: { link: true },
      })
    ).map(row => row.link)
  );
  // De la más vieja a la más nueva: el sitio las publica en el orden en que salieron.
  const queue = fresh
    .filter(item => !seen.has(item.link))
    .sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());

  console.log(`[ingest] ${items.length} notas en los feeds, ${queue.length} nuevas`);

  for (const [index, item] of Array.from(queue.entries())) {
    if (Date.now() - startedAt > START_BUDGET_MS) {
      summary.pending = queue.length - index;
      break;
    }
    const outcome = await ingestItem(client, item);
    if (outcome !== 'taken') summary[outcome]++;
  }

  console.log('[ingest] Fin:', JSON.stringify(summary));
  return summary;
}
