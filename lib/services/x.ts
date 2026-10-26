import { prisma } from '@/lib/prisma';
import { buildPostUrl, type NotifiablePost } from '@/lib/services/discord';

const POSTPROXY_API = 'https://api.postproxy.dev/api';
const API_KEY = process.env.POSTPROXY_API_KEY;
// @BitcoinArgOK conectada en PostProxy. Si se reconecta la cuenta el id puede
// cambiar: GET /api/profiles lo lista.
const X_PROFILE_ID = 'lmUevv';
const SEND_TIMEOUT_MS = 10000;

const TWEET_MAX = 280;

/**
 * PostProxy rechaza links en el cuerpo de un post de X (422): el link va en la
 * primera respuesta del hilo, y la portada se sube en el post principal porque
 * sin link X no arma tarjeta.
 */
export function buildTweet(post: NotifiablePost) {
  const title =
    post.title.length <= TWEET_MAX ? post.title : `${post.title.slice(0, TWEET_MAX - 1)}…`;

  return {
    post: { body: title },
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

  // ponytail: PostProxy publica async y el 201 llega con la red en "pending"; si X
  // rechaza después, acá no se ve. Se revisa en el panel de PostProxy.
  try {
    const response = await fetch(`${POSTPROXY_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify(buildTweet(post)),
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
