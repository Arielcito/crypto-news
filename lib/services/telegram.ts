import { prisma } from '@/lib/prisma';
import { buildPostUrl, stripMarkdown, type NotifiablePost } from '@/lib/services/discord';

// El token va en el path de la URL: nunca loguear la URL armada.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// `@usuario` del canal/grupo público o su id numérico. El bot tiene que ser admin.
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SEND_TIMEOUT_MS = 5000;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Título en negrita, bajada y link. La portada la dibuja Telegram desde el og:image. */
export function buildTelegramMessage(post: NotifiablePost) {
  const url = buildPostUrl(post);
  const excerpt = stripMarkdown(post.excerpt || post.content);

  return {
    chat_id: CHAT_ID,
    parse_mode: 'HTML',
    text: [`<b>${escapeHtml(post.title)}</b>`, excerpt && escapeHtml(excerpt), url]
      .filter(Boolean)
      .join('\n\n'),
    link_preview_options: { url, prefer_large_media: true, show_above_text: true },
  };
}

/**
 * Publica el post en Telegram y marca `telegramPostedAt`. Mismo contrato que
 * Discord: nunca lanza, y si falla el stamp queda en null para reintentar al
 * volver a guardar el post. Los cortes por dominio y status los hace el caller.
 */
export async function notifyTelegram(post: NotifiablePost): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID no configuradas — se omite');
    return false;
  }

  if (post.telegramPostedAt) {
    console.log(`[telegram] post ${post.id} ya notificado el ${post.telegramPostedAt.toISOString()}`);
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildTelegramMessage(post)),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { description?: string } | null;
      console.error(`[telegram] sendMessage respondió ${response.status}: ${body?.description ?? ''}`);
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[telegram] fallo al enviar:', message);
    return false;
  }

  try {
    await prisma.post.update({ where: { id: post.id }, data: { telegramPostedAt: new Date() } });
    console.log(`[telegram] post ${post.id} publicado`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[telegram] no se pudo marcar telegramPostedAt en el post ${post.id}:`, message);
  }

  return true;
}
