import { prisma } from '@/lib/prisma';
import { buildPostUrl, stripMarkdown, type NotifiablePost } from '@/lib/services/discord';

const POSTPROXY_API = 'https://api.postproxy.dev/api';
const API_KEY = process.env.POSTPROXY_API_KEY;
// @BitcoinArgOK conectada en PostProxy. Si se reconecta la cuenta el id puede
// cambiar: GET /api/profiles lo lista.
const X_PROFILE_ID = 'lmUevv';
const SEND_TIMEOUT_MS = 10000;

const TWEET_MAX = 280;

/**
 * Tweets (post + respuestas del hilo) que PostProxy deja publicar en X en 24 h
 * móviles con su app compartida: medido el 2026-11-13, el 21.º dio "24 hour
 * Twitter quota exceeded". Se sube pidiéndoselo a PostProxy o con claves propias (BYOK).
 */
const X_DAILY_QUOTA = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ProxyPost {
  created_at?: string;
  thread?: unknown[];
  platforms?: { platform?: string; status?: string }[];
}

/**
 * Cuota de X ya gastada: cada post a X no fallido creado en las últimas 24 h
 * cuenta 1 más su hilo. PostProxy reserva al crear (los "pending" ya cuentan) y
 * las respuestas de un post fallido quedan "pending" para siempre, por eso se
 * mira el estado del post y no el de cada respuesta.
 */
export function tweetsInLastDay(posts: ProxyPost[], now: number): number {
  let used = 0;
  for (const post of posts) {
    if (!(now - Date.parse(post.created_at ?? '') < DAY_MS)) continue;
    for (const platform of post.platforms ?? []) {
      if (platform.platform === 'twitter' && platform.status !== 'failed') used += 1 + (post.thread?.length ?? 0);
    }
  }
  return used;
}

// ponytail: una página de 100 posts de la cuenta (todas las redes) alcanza para
// cubrir 24 h; si algún día se publican más de 100 por día hay que paginar.
async function tweetsUsed(): Promise<number | null> {
  try {
    const response = await fetch(`${POSTPROXY_API}/posts?per_page=100`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[x] PostProxy respondió ${response.status} al leer la cuota`);
      return null;
    }
    const { data } = (await response.json()) as { data?: ProxyPost[] };
    return tweetsInLastDay(data ?? [], Date.now());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[x] no se pudo leer la cuota:', message);
    return null;
  }
}

/**
 * Título y bajada hasta los 280. PostProxy rechaza links en el cuerpo de un post
 * de X (422): se sacan las URLs sueltas de la bajada, el link va en la primera
 * respuesta del hilo, y la portada se sube en el post principal porque sin link
 * X no arma tarjeta.
 */
export function buildTweet(post: NotifiablePost) {
  const title =
    post.title.length <= TWEET_MAX ? post.title : `${post.title.slice(0, TWEET_MAX - 1)}…`;
  const room = TWEET_MAX - title.length - 2;
  const excerpt =
    room > 20 ? stripMarkdown((post.excerpt || post.content).replace(/https?:\/\/\S+/g, ''), room) : '';

  return {
    post: { body: excerpt ? `${title}\n\n${excerpt}` : title },
    profiles: [X_PROFILE_ID],
    ...(post.featuredMedia ? { media: [post.featuredMedia] } : {}),
    thread: [{ body: `Nota completa: ${buildPostUrl(post)}` }],
  };
}

/**
 * Publica el post en X vía PostProxy y marca `xPostedAt`. Mismo contrato que
 * Discord y Telegram: nunca lanza, y si falla el stamp queda en null para
 * reintentar al volver a guardar el post. Los cortes por dominio y status los
 * hace el caller.
 */
export async function notifyX(post: NotifiablePost): Promise<boolean> {
  if (!API_KEY) {
    console.warn('[x] POSTPROXY_API_KEY no configurada — se omite');
    return false;
  }

  if (post.xPostedAt) {
    console.log(`[x] post ${post.id} ya publicado el ${post.xPostedAt.toISOString()}`);
    return false;
  }

  // Sin cuota no se manda: PostProxy acepta igual (201) y X lo rechaza después,
  // con lo que la nota quedaba marcada como publicada sin haber salido.
  // ponytail: los lugares se reparten por orden de llegada, no por relevancia.
  const tweet = buildTweet(post);
  const used = await tweetsUsed();
  if (used === null) return false;
  if (used + 1 + tweet.thread.length > X_DAILY_QUOTA) {
    console.warn(`[x] cuota de X llena (${used}/${X_DAILY_QUOTA} tweets en 24 h) — se omite el post ${post.id}`);
    return false;
  }

  // ponytail: PostProxy publica async y el 201 llega con la red en "pending"; si X
  // rechaza después, acá no se ve. Se revisa en el panel de PostProxy.
  try {
    const response = await fetch(`${POSTPROXY_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify(tweet),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[x] PostProxy respondió ${response.status}: ${detail.slice(0, 200)}`);
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[x] fallo al enviar:', message);
    return false;
  }

  try {
    await prisma.post.update({ where: { id: post.id }, data: { xPostedAt: new Date() } });
    console.log(`[x] post ${post.id} publicado`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[x] no se pudo marcar xPostedAt en el post ${post.id}:`, message);
  }

  return true;
}
