import type { Post } from '@prisma/client';
import { ADMIN_DOMAIN } from '@/lib/constants';
import { notifyDiscord, type NotifiablePost } from '@/lib/services/discord';
import { notifyTelegram } from '@/lib/services/telegram';
import { notifyX } from '@/lib/services/x';

const RETRY_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Al editar un post: avisa si pasa draft → publish, o si ya estaba publicado y
 * es reciente (reintento de un canal que falló). Sin el corte, re-guardar
 * cualquier nota vieja la anunciaba, porque su stamp de X/Telegram nunca se llenó.
 */
export function shouldNotifyOnUpdate(
  before: Pick<Post, 'status' | 'date'>,
  now: number = Date.now()
): boolean {
  return before.status !== 'publish' || now - before.date.getTime() < RETRY_WINDOW_MS;
}

/**
 * Avisa un post publicado en todos los canales (Discord, Telegram y X). Nunca
 * lanza: cada canal tiene su propio stamp, así que si uno falla el otro no se
 * duplica al reintentar.
 */
export async function notifyPostPublished(post: NotifiablePost): Promise<void> {
  // /api/wp/v2/posts acepta cualquier `domain` (incluso "default"), y los links
  // siempre apuntan a ADMIN_DOMAIN. Sin este corte avisaríamos notas de otro
  // sitio con una URL que no existe.
  if (post.domain !== ADMIN_DOMAIN) {
    console.log(`[notify] post ${post.id} del dominio "${post.domain}" — no se notifica`);
    return;
  }

  if (post.status !== 'publish') {
    console.log(`[notify] post ${post.id} en estado "${post.status}" — no se notifica`);
    return;
  }

  await Promise.all([notifyDiscord(post), notifyTelegram(post), notifyX(post)]);
}
