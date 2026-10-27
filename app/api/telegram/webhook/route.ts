import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { escapeHtml, sendTelegramMessage } from '@/lib/services/telegram';

export const dynamic = 'force-dynamic';

/** Sólo lo que se usa del Update; Telegram manda mucho más y se ignora. */
const updateSchema = z.object({
  message: z
    .object({
      chat: z.object({ id: z.number(), type: z.string() }),
      from: z.object({ username: z.string().optional() }).optional(),
      text: z.string().optional(),
    })
    .optional(),
});

// Con cualquier otro status Telegram reintenta el mismo update en loop.
const ok = () => NextResponse.json({ ok: true });

/**
 * Webhook del bot. Su único trabajo es el /start: cruza el @ de quien lo manda
 * con `User.telegramUsername` y guarda el chat privado para el digest diario.
 * Telegram firma cada pedido con el `secret_token` que se le pasó en setWebhook.
 */
export async function POST(request: NextRequest) {
  console.log('[POST] /api/telegram/webhook - Request received');

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json(
      { data: null, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  const message = parsed.success ? parsed.data.message : undefined;
  if (!message || message.chat.type !== 'private' || !message.text?.startsWith('/start')) return ok();

  const chatId = String(message.chat.id);
  const username = message.from?.username?.toLowerCase();

  try {
    const user = username
      ? await prisma.user.findFirst({
          where: { telegramUsername: username, isActive: true },
          select: { id: true, name: true },
        })
      : null;

    if (!user) {
      console.log(`[POST] /api/telegram/webhook - /start sin usuario para @${username ?? '(sin @)'}`);
      await sendTelegramMessage(
        chatId,
        username
          ? `No encontré a @${username} en el panel. Pedile a un admin que lo cargue en Equipo y volvé a mandar /start.`
          : 'Tu cuenta de Telegram no tiene nombre de usuario. Creá uno en Ajustes, pasáselo a un admin y volvé a mandar /start.'
      );
      return ok();
    }

    // Si el chat quedó en otra persona (cambió de @), se libera antes por el unique.
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { telegramChatId: chatId, id: { not: user.id } },
        data: { telegramChatId: null },
      }),
      prisma.user.update({ where: { id: user.id }, data: { telegramChatId: chatId } }),
    ]);

    console.log(`[POST] /api/telegram/webhook - Usuario ${user.id} vinculado`);
    await sendTelegramMessage(
      chatId,
      `Listo, ${escapeHtml(user.name.split(' ')[0])}. Todos los días a las 9 te llegan acá tus tareas vencidas y las que están por vencer.`
    );
  } catch (error) {
    console.error(
      '[POST] /api/telegram/webhook - Error:',
      error instanceof Error ? error.message : error
    );
  }

  return ok();
}
