import type { SocialAccountMetric, SocialNetwork, SocialPostMetric } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AR_TIMEZONE, daysAgo } from '@/lib/agency/dates';
import {
  PIECES_LIMIT,
  engagementRate,
  interactionsOf,
  type AccountSnapshot,
  type AccountSummary,
  type FollowersPoint,
  type OrganicMetrics,
  type PieceRow,
  type PiecesSummary,
} from '@/lib/types/agency';

/**
 * Agregación de las métricas orgánicas. Toda la doctrina de IMPERIA vive acá:
 * los contadores son ACUMULADOS, así que el rendimiento de una pieza es su
 * ÚLTIMA lectura y el crecimiento de una cuenta es la RESTA entre dos lecturas.
 * Nada se suma a lo largo del tiempo, y un `null` nunca se convierte en 0.
 */

const EXCERPT_LENGTH = 90;

function toSnapshot(network: SocialNetwork, row: SocialAccountMetric): AccountSnapshot {
  return {
    network,
    recordedAt: row.recordedAt.toISOString(),
    followers: row.followers,
    posts: row.posts,
    reach1d: row.reach1d,
    reach7d: row.reach7d,
    reach30d: row.reach30d,
    profileViews7d: row.profileViews7d,
    accountsEngaged7d: row.accountsEngaged7d,
    interactions7d: row.interactions7d,
    websiteClicks7d: row.websiteClicks7d,
  };
}

/** `YYYY-MM-DD` en hora argentina: la serie se dibuja en días locales. */
function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: AR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function excerptOf(body: string | null, permalink: string | null): string {
  const text = body?.trim();
  if (text) {
    return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text;
  }
  return permalink ?? 'Pieza sin texto';
}

/** Totales de un conjunto de piezas. Suma de ÚLTIMAS lecturas: cada pieza una vez. */
export function summarize(rows: PieceRow[]): PiecesSummary {
  const impressions = rows.reduce((total, row) => total + (row.impressions ?? 0), 0);
  const interactions = rows.reduce((total, row) => total + row.interactions, 0);
  return {
    pieces: rows.length,
    impressions,
    interactions,
    engagement: engagementRate(interactions, impressions === 0 ? null : impressions),
    interactionsPerPiece: rows.length === 0 ? null : interactions / rows.length,
  };
}

export interface MetricsQuery {
  /** `undefined` = todas las cuentas a las que llega quien pregunta. */
  clientId?: number;
  /** Ids de cliente permitidos, o `'all'` para el admin. */
  allowedClientIds: number[] | 'all';
  days: number;
  now?: Date;
}

export async function organicMetrics(query: MetricsQuery): Promise<OrganicMetrics> {
  const now = query.now ?? new Date();
  const from = daysAgo(query.days, now);

  const profiles = await prisma.clientProfile.findMany({
    where: {
      isActive: true,
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(query.allowedClientIds === 'all' ? {} : { clientId: { in: query.allowedClientIds } }),
    },
    select: { id: true, network: true, handle: true, expiresAt: true },
  });

  const empty: OrganicMetrics = {
    configured: profiles.length > 0,
    hasData: false,
    from: from.toISOString(),
    to: now.toISOString(),
    syncedAt: null,
    accounts: [],
    series: [],
    top: [],
    worst: [],
    totals: summarize([]),
  };

  if (profiles.length === 0) return empty;

  const profileIds = profiles.map((profile) => profile.id);

  const accountRows = await prisma.socialAccountMetric.findMany({
    where: { clientProfileId: { in: profileIds } },
    orderBy: { recordedAt: 'asc' },
  });

  const byProfile = new Map<number, SocialAccountMetric[]>();
  for (const row of accountRows) {
    const list = byProfile.get(row.clientProfileId);
    if (list) list.push(row);
    else byProfile.set(row.clientProfileId, [row]);
  }

  const accounts: AccountSummary[] = profiles.map((profile) => {
    const rows = byProfile.get(profile.id) ?? [];
    const current = rows.at(-1) ?? null;
    // La lectura más vieja DENTRO del rango es la base de comparación: si la
    // cuenta se empezó a medir después, no hay contra qué restar y va `null`.
    const previous = rows.find((row) => row.recordedAt >= from) ?? null;
    const gained =
      current && previous && current.followers !== null && previous.followers !== null
        ? current.followers - previous.followers
        : null;

    return {
      profileId: profile.id,
      network: profile.network,
      handle: profile.handle,
      expiresAt: profile.expiresAt?.toISOString() ?? null,
      current: current ? toSnapshot(profile.network, current) : null,
      previous: previous && previous !== current ? toSnapshot(profile.network, previous) : null,
      followersGained: previous === current ? null : gained,
    };
  });

  // Serie de seguidores: una lectura por día y red, la última del día. Cuando no
  // hubo lectura ese día el valor queda ausente y el gráfico corta, en vez de
  // inventar una línea recta entre dos puntos que nadie midió.
  const perDay = new Map<string, Partial<Record<SocialNetwork, number | null>>>();
  for (const row of accountRows) {
    if (row.recordedAt < from) continue;
    const network = profiles.find((profile) => profile.id === row.clientProfileId)?.network;
    if (!network) continue;
    const key = dayKey(row.recordedAt);
    const bucket = perDay.get(key) ?? {};
    const previous = bucket[network];
    // Varias cuentas de la misma red suman: es el total de la agencia o del cliente.
    bucket[network] = (previous ?? 0) + (row.followers ?? 0);
    perDay.set(key, bucket);
  }

  const series: FollowersPoint[] = Array.from(perDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, values }));

  const posts = await prisma.socialPost.findMany({
    where: { clientProfileId: { in: profileIds }, publishedAt: { gte: from, lte: now } },
    include: {
      metrics: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
  });

  const pieces: PieceRow[] = posts.map((post) => {
    const last: SocialPostMetric | undefined = post.metrics[0];
    const interactions = interactionsOf({
      likes: last?.likes ?? null,
      comments: last?.comments ?? null,
      saves: last?.saves ?? null,
      shares: last?.shares ?? null,
    });

    return {
      socialPostId: post.id,
      network: post.network,
      permalink: post.permalink,
      excerpt: excerptOf(post.body, post.permalink),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      impressions: last?.impressions ?? null,
      reach: last?.reach ?? null,
      likes: last?.likes ?? null,
      comments: last?.comments ?? null,
      saves: last?.saves ?? null,
      shares: last?.shares ?? null,
      interactions,
      engagement: engagementRate(interactions, last?.impressions ?? null),
    };
  });

  const ranked = [...pieces].sort((a, b) => b.interactions - a.interactions);
  // Las peores se cuentan sólo entre las que tienen alguna lectura: una pieza que
  // el agregador todavía no midió no es "la peor", es una pieza sin datos.
  const measured = ranked.filter((piece) => piece.impressions !== null || piece.interactions > 0);

  const syncedAt =
    accountRows.at(-1)?.recordedAt ??
    posts.flatMap((post) => post.metrics).at(0)?.recordedAt ??
    null;

  return {
    configured: true,
    hasData: accountRows.length > 0 || pieces.length > 0,
    from: from.toISOString(),
    to: now.toISOString(),
    syncedAt: syncedAt?.toISOString() ?? null,
    accounts,
    series,
    top: ranked.slice(0, PIECES_LIMIT),
    worst: measured.slice(-PIECES_LIMIT).reverse(),
    totals: summarize(pieces),
  };
}
