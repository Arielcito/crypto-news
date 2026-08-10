import { prisma } from '@/lib/prisma';
import { ADMIN_DOMAIN } from '@/lib/constants';
import type { Post, DomainCategories } from '@prisma/client';

const WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL;

// Discord/Cloudflare rechaza con 403 los pedidos sin User-Agent.
const USER_AGENT = `CryptonewsBot (https://${ADMIN_DOMAIN}, 1.0)`;

const EMBED_COLOR = 0xf7931a; // primary de bitcoinarg.news
const DESCRIPTION_MAX = 300;
const SEND_TIMEOUT_MS = 5000;

export type NotifiablePost = Pick<
  Post,
  'id' | 'title' | 'slug' | 'excerpt' | 'content' | 'featuredMedia' | 'status' | 'domain' | 'discordPostedAt'
> & {
  categories: Pick<DomainCategories, 'name' | 'slug'>[];
};

type DiscordEmbed = {
  title: string;
  url: string;
  description?: string;
  color: number;
  timestamp: string;
  author?: { name: string };
  image?: { url: string };
  footer: { text: string };
};

function stripMarkdown(text: string, max = DESCRIPTION_MAX): string {
  const stripped = text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max - 1)}…`;
}

function buildPostUrl(post: NotifiablePost): string {
  // En dev el post queda con domain "localhost"; el link tiene que apuntar al sitio público igual.
  const host = post.domain === ADMIN_DOMAIN ? post.domain : ADMIN_DOMAIN;
  const categorySlug = post.categories[0]?.slug;
  return categorySlug
    ? `https://${host}/${categorySlug}/${post.slug}`
    : `https://${host}/${post.slug}`;
}

export function buildEmbed(post: NotifiablePost): DiscordEmbed {
  const description = stripMarkdown(post.excerpt || post.content);
  const category = post.categories[0]?.name;

  return {
    title: post.title.slice(0, 256),
    url: buildPostUrl(post),
    ...(description ? { description } : {}),
    color: EMBED_COLOR,
    timestamp: new Date().toISOString(),
    ...(category ? { author: { name: category } } : {}),
    ...(post.featuredMedia ? { image: { url: post.featuredMedia } } : {}),
    footer: { text: ADMIN_DOMAIN },
  };
}

async function send(embed: DiscordEmbed, attempt = 1): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[discord] DISCORD_NEWS_WEBHOOK_URL no configurada — se omite la notificación');
    return false;
  }

  try {
    const response = await fetch(`${WEBHOOK_URL}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      // allowed_mentions vacío: garantiza que ningún @everyone o @rol dentro del
      // título o del excerpt dispare una notificación.
      body: JSON.stringify({ embeds: [embed], allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (response.status === 429 && attempt === 1) {
      const body = (await response.json().catch(() => null)) as { retry_after?: number } | null;
      const waitMs = Math.min((body?.retry_after ?? 1) * 1000, SEND_TIMEOUT_MS);
      console.warn(`[discord] rate limited, reintentando en ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return send(embed, 2);
    }

    if (!response.ok) {
      console.error(`[discord] webhook respondió ${response.status}: ${await response.text().catch(() => '')}`);
      return false;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[discord] fallo al enviar el webhook:', message);
    return false;
  }
}

/**
 * Publica el post en el canal #noticias de Discord y marca `discordPostedAt`.
 *
 * Fire-and-forget por diseño: nunca lanza. Si Discord falla, el post ya quedó
 * creado y `discordPostedAt` sigue en null, así que un reintento posterior
 * (volver a guardar el post) lo vuelve a intentar.
 */
export async function notifyPostPublished(post: NotifiablePost): Promise<boolean> {
  // /api/wp/v2/posts acepta cualquier `domain` (incluso "default"), y el link del
  // embed siempre apunta a ADMIN_DOMAIN. Sin este corte publicaríamos en #noticias
  // notas de otro sitio con una URL que no existe.
  if (post.domain !== ADMIN_DOMAIN) {
    console.log(`[discord] post ${post.id} del dominio "${post.domain}" — no se notifica`);
    return false;
  }

  if (post.status !== 'publish') {
    console.log(`[discord] post ${post.id} en estado "${post.status}" — no se notifica`);
    return false;
  }

  if (post.discordPostedAt) {
    console.log(`[discord] post ${post.id} ya notificado el ${post.discordPostedAt.toISOString()}`);
    return false;
  }

  console.log(`[discord] notificando post ${post.id} "${post.title}"`);
  const sent = await send(buildEmbed(post));

  if (!sent) return false;

  try {
    await prisma.post.update({ where: { id: post.id }, data: { discordPostedAt: new Date() } });
    console.log(`[discord] post ${post.id} publicado en #noticias`);
  } catch (error) {
    // El mensaje ya salió; si el stamp falla lo peor que pasa es un duplicado
    // en el próximo guardado. Se registra y no se propaga.
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[discord] no se pudo marcar discordPostedAt en el post ${post.id}:`, message);
  }

  return true;
}
