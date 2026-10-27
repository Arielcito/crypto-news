import type { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ADMIN_DOMAIN } from '@/lib/constants';
import { NETWORK_LABELS } from '@/lib/types/agency';
import { countdownLabel, formatDateAr } from '@/lib/agency/dates';
import { HORIZON_DAYS } from '@/lib/services/discord-tasks';
import { escapeHtml, sendTelegramMessage } from '@/lib/services/telegram';

/** Telegram corta a los 4096 caracteres: 10 por bloque deja margen para títulos largos. */
const MAX_LINES = 10;

const taskArgs = {
  include: {
    assignee: { select: { name: true } },
    coAssignee: { select: { name: true } },
    package: { select: { client: { select: { name: true } } } },
  },
} satisfies Prisma.TaskDefaultArgs;

export type DigestTask = Prisma.TaskGetPayload<typeof taskArgs>;

export interface TelegramTaskAlertResult {
  linked: number;
  sent: number;
}

/**
 * El mensaje de la mañana para una persona. El admin ve todo el equipo con el
 * responsable de cada línea; el resto, sólo lo suyo. Sin tareas no hay mensaje:
 * un "no tenés nada" diario se aprende a ignorar y arrastra al que sí importa.
 */
export function buildTaskDigest(
  user: { name: string; role: Role },
  tasks: DigestTask[],
  now = new Date()
): string | null {
  if (tasks.length === 0) return null;

  const isAdmin = user.role === 'ADMIN';
  const overdue = tasks.filter((task) => task.dueDate < now);
  const upcoming = tasks.filter((task) => task.dueDate >= now);

  const line = (task: DigestTask): string => {
    const who =
      [task.assignee?.name, task.coAssignee?.name].filter(Boolean).join(' y ') || 'sin responsable';
    const parts = [
      `• <b>${escapeHtml(task.package.client.name)}</b> — ${escapeHtml(task.title)} (${NETWORK_LABELS[task.network]})`,
      formatDateAr(task.dueDate),
      countdownLabel(task.dueDate, now),
      ...(isAdmin ? [escapeHtml(who)] : []),
    ];
    return parts.join(' · ');
  };

  const block = (title: string, rows: DigestTask[]): string => {
    const shown = rows.slice(0, MAX_LINES).map(line).join('\n');
    const rest = rows.length - MAX_LINES;
    // Si se corta, se dice: un listado truncado en silencio parece completo.
    return `<b>${title} (${rows.length})</b>\n${rest > 0 ? `${shown}\n… y ${rest} más` : shown}`;
  };

  const firstName = escapeHtml(user.name.split(' ')[0]);
  const path = isAdmin ? '/admin/agencia/tareas' : '/admin/agencia/mis-tareas';

  return [
    isAdmin ? `<b>Buen día, ${firstName}. Así viene el equipo:</b>` : `<b>Buen día, ${firstName}. Tus tareas:</b>`,
    overdue.length > 0 && block('⚠️ Vencidas', overdue),
    upcoming.length > 0 && block(`⏳ Vencen en los próximos ${HORIZON_DAYS} días`, upcoming),
    `<a href="https://${ADMIN_DOMAIN}${path}">Abrir el panel</a>`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Digest por privado a cada usuario que hizo /start en el bot. Igual que el de
 * Discord, sin estado: lo vencido sigue llegando todos los días hasta que se cierre.
 */
export async function sendTelegramTaskAlerts(now = new Date()): Promise<TelegramTaskAlertResult> {
  const users = await prisma.user.findMany({
    where: { isActive: true, telegramChatId: { not: null } },
    select: { id: true, name: true, role: true, telegramChatId: true },
  });

  if (users.length === 0) {
    console.log('[telegram-tasks] nadie vinculado al bot: no se manda nada');
    return { linked: 0, sent: 0 };
  }

  const horizon = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const tasks = await prisma.task.findMany({
    where: { status: 'PENDING', dueDate: { lte: horizon } },
    ...taskArgs,
    orderBy: { dueDate: 'asc' },
  });

  let sent = 0;
  for (const user of users) {
    const own =
      user.role === 'ADMIN'
        ? tasks
        : tasks.filter((task) => task.assigneeId === user.id || task.coAssigneeId === user.id);
    const text = buildTaskDigest(user, own, now);
    if (text && user.telegramChatId && (await sendTelegramMessage(user.telegramChatId, text))) sent++;
  }

  console.log(`[telegram-tasks] ${sent} de ${users.length} vinculados recibieron el digest`);
  return { linked: users.length, sent };
}
