import { prisma } from '@/lib/prisma';
import { ADMIN_DOMAIN } from '@/lib/constants';
import { NETWORK_LABELS } from '@/lib/types/agency';
import { countdownLabel, formatDateAr } from '@/lib/agency/dates';

const WEBHOOK_URL = process.env.DISCORD_TASKS_WEBHOOK_URL;

// Discord/Cloudflare rechaza con 403 los pedidos sin User-Agent.
const USER_AGENT = `CryptonewsBot (https://${ADMIN_DOMAIN}, 1.0)`;

const SEND_TIMEOUT_MS = 5000;
const OVERDUE_COLOR = 0xd32f2f;
const SOON_COLOR = 0xf7931a;

/** Cuántos días hacia adelante entran en el aviso. */
const HORIZON_DAYS = 3;

/** Tope de líneas por embed: Discord corta los mensajes largos. */
const MAX_LINES = 15;

export interface TaskAlertResult {
  overdue: number;
  upcoming: number;
  sent: boolean;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
}

/**
 * Aviso diario de vencimientos. Es un DIGEST SIN ESTADO: cada corrida vuelve a
 * mirar la base y manda lo que hay. No se guarda "ya avisé de esta tarea" a
 * propósito — una tarea vencida tiene que seguir molestando todos los días hasta
 * que alguien la cierre, y un flag de "notificada" la silenciaría para siempre.
 */
export async function sendTaskAlerts(now = new Date()): Promise<TaskAlertResult> {
  const horizon = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: { status: 'PENDING', dueDate: { lte: horizon } },
    include: {
      assignee: { select: { name: true } },
      package: { select: { client: { select: { name: true } } } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const overdue = tasks.filter((task) => task.dueDate < now);
  const upcoming = tasks.filter((task) => task.dueDate >= now);

  if (tasks.length === 0) {
    console.log('[discord-tasks] sin vencimientos: no se manda nada');
    return { overdue: 0, upcoming: 0, sent: false };
  }

  const line = (task: (typeof tasks)[number]): string => {
    const who = task.assignee?.name ?? 'sin responsable';
    const client = task.package.client.name;
    const network = NETWORK_LABELS[task.network];
    return `• **${client}** — ${task.title} (${network}) · ${who} · ${formatDateAr(
      task.dueDate
    )} · ${countdownLabel(task.dueDate, now)}`;
  };

  const block = (rows: typeof tasks): string => {
    const shown = rows.slice(0, MAX_LINES).map(line).join('\n');
    const rest = rows.length - MAX_LINES;
    // Si se corta, se dice: un listado truncado en silencio parece completo.
    return rest > 0 ? `${shown}\n… y ${rest} más` : shown;
  };

  const embeds: DiscordEmbed[] = [];
  if (overdue.length > 0) {
    embeds.push({
      title: `⚠️ ${overdue.length} tarea${overdue.length === 1 ? '' : 's'} vencida${
        overdue.length === 1 ? '' : 's'
      }`,
      description: block(overdue),
      color: OVERDUE_COLOR,
    });
  }
  if (upcoming.length > 0) {
    embeds.push({
      title: `⏳ Vencen en los próximos ${HORIZON_DAYS} días`,
      description: block(upcoming),
      color: SOON_COLOR,
    });
  }

  const sent = await send(embeds);
  return { overdue: overdue.length, upcoming: upcoming.length, sent };
}

async function send(embeds: DiscordEmbed[]): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[discord-tasks] DISCORD_TASKS_WEBHOOK_URL no configurada — se omite el aviso');
    return false;
  }

  try {
    const response = await fetch(`${WEBHOOK_URL}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      // allowed_mentions vacío: ningún título de tarea puede disparar un @everyone.
      body: JSON.stringify({ embeds, allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[discord-tasks] webhook respondió ${response.status}`);
      return false;
    }

    console.log(`[discord-tasks] aviso enviado (${embeds.length} bloques)`);
    return true;
  } catch (error) {
    console.error(
      '[discord-tasks] fallo al enviar el webhook:',
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
