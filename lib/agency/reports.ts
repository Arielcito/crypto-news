import { prisma } from '@/lib/prisma';
import { formatMonthKey } from '@/lib/agency/dates';
import { summarize } from '@/lib/agency/metrics';
import {
  engagementRate,
  interactionsOf,
  type PieceRow,
  type ReportSnapshot,
} from '@/lib/types/agency';

/**
 * Arma la foto de un paquete terminado. El resultado se congela en `Report.snapshot`
 * y no se vuelve a calcular: un reporte de octubre tiene que decir lo mismo en
 * diciembre, aunque después se hayan editado tareas o llegado más lecturas.
 *
 * El cruce tarea↔pieza es por permalink y en tiempo de lectura, no por FK: la
 * pieza puede tardar horas en aparecer en el catálogo del agregador, y una FK
 * obligaría a esperar a que exista para poder marcar la tarea como hecha.
 */
export async function buildSnapshot(packageId: number): Promise<ReportSnapshot | null> {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: {
      client: { select: { id: true, name: true } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { dueDate: 'asc' },
      },
    },
  });
  if (!pkg) return null;

  const permalinks = pkg.tasks
    .map((task) => task.permalink)
    .filter((link): link is string => Boolean(link));

  const posts =
    permalinks.length === 0
      ? []
      : await prisma.socialPost.findMany({
          where: { permalink: { in: permalinks } },
          include: { metrics: { orderBy: { recordedAt: 'desc' }, take: 1 } },
        });

  const byPermalink = new Map(posts.map((post) => [post.permalink ?? '', post]));

  const pieces: PieceRow[] = [];
  const tasks: ReportSnapshot['tasks'] = pkg.tasks.map((task) => {
    const post = task.permalink ? byPermalink.get(task.permalink) : undefined;
    const last = post?.metrics[0];

    if (post && last) {
      const interactions = interactionsOf(last);
      pieces.push({
        socialPostId: post.id,
        network: post.network,
        permalink: post.permalink,
        excerpt: task.title,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        impressions: last.impressions,
        reach: last.reach,
        likes: last.likes,
        comments: last.comments,
        saves: last.saves,
        shares: last.shares,
        interactions,
        engagement: engagementRate(interactions, last.impressions),
      });
    }

    return {
      title: task.title,
      network: task.network,
      format: task.format,
      dueDate: task.dueDate.toISOString(),
      completedAt: task.completedAt?.toISOString() ?? null,
      assignee: task.assignee?.name ?? null,
      permalink: task.permalink,
      metrics: {
        impressions: last?.impressions ?? null,
        reach: last?.reach ?? null,
        likes: last?.likes ?? null,
        comments: last?.comments ?? null,
        interactions: last ? interactionsOf(last) : null,
        // `false` = la pieza todavía no apareció en el catálogo del agregador. Se
        // dice en el reporte en vez de mostrar ceros que parecerían un fracaso.
        matched: Boolean(post && last),
      },
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    client: pkg.client,
    month: formatMonthKey(pkg.month),
    committedPieces: pkg.committedPieces,
    deliveredPieces: pkg.tasks.filter((task) => task.status === 'DONE').length,
    tasks,
    totals: summarize(pieces),
  };
}
