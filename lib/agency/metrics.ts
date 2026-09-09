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
  type TrendPoint,
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Acumulado de impresiones día por día. Arrastra la última lectura conocida de
 * cada pieza: una pieza que no se midió hoy sigue valiendo lo que valía ayer,
 * porque sus vistas no se borraron.
 */
async function trendOfImpressions(
  socialPostIds: number[],
  from: Date,
  to: Date
): Promise<TrendPoint[]> {
  if (socialPostIds.length === 0) return [];

  const readings = await prisma.socialPostMetric.findMany({
    where: { socialPostId: { in: socialPostIds }, impressions: { not: null } },
    select: { socialPostId: true, recordedAt: true, impressions: true },
    orderBy: { recordedAt: 'asc' },
  });
  if (readings.length === 0) return [];

  const days: string[] = [];
  for (let time = from.getTime(); time <= to.getTime(); time += MS_PER_DAY) {
    const key = dayKey(new Date(time));
    if (days.at(-1) !== key) days.push(key);
  }
  const today = dayKey(to);
  if (days.at(-1) !== today) days.push(today);

  const lastByPost = new Map<number, number>();
  const points: TrendPoint[] = [];
  let cursor = 0;

  for (const day of days) {
    while (cursor < readings.length && dayKey(readings[cursor].recordedAt) <= day) {
      const reading = readings[cursor];
      if (reading.impressions !== null) lastByPost.set(reading.socialPostId, reading.impressions);
      cursor += 1;
    }
    // Los días anteriores a la primera lectura no valen 0: no se midieron. La
    // curva arranca cuando hay algo medido, en vez de dibujar una recta al piso
    // que diría que en esas semanas no vio la pieza nadie.
    if (lastByPost.size === 0) continue;

    let total = 0;
    for (const value of lastByPost.values()) total += value;
    points.push({ date: day, value: total });
  }

  return points;
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
    impressionsTrend: [],
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

  /*
   * Serie de seguidores. Dos cosas que parecen detalles y no lo son:
   *
   * 1. El cron corre varias veces por día, así que de cada cuenta se toma la
   *    ÚLTIMA lectura del día. Sumar todas las del día multiplicaba el total por
   *    la cantidad de corridas y dibujaba una cuenta tres veces más grande.
   * 2. Una lectura sin seguidores (`null`) se saltea. Contarla como 0 hunde la
   *    línea al piso y afirma que la cuenta no tiene seguidores, cuando lo que
   *    pasa es que esa lectura no los trajo.
   */
  const networkOfProfile = new Map(profiles.map((profile) => [profile.id, profile.network]));
  const lastPerDay = new Map<string, number>();
  for (const row of accountRows) {
    if (row.recordedAt < from) continue;
    if (row.followers === null) continue;
    // Vienen ordenadas por fecha: la última que pisa la clave es la del día.
    lastPerDay.set(`${dayKey(row.recordedAt)}|${row.clientProfileId}`, row.followers);
  }

  const perDay = new Map<string, Partial<Record<SocialNetwork, number | null>>>();
  for (const [key, followers] of lastPerDay) {
    const [date, profileId] = key.split('|');
    const network = networkOfProfile.get(Number(profileId));
    if (!network) continue;
    const bucket = perDay.get(date) ?? {};
    // Varias cuentas de la misma red suman: es el total de la agencia o del cliente.
    bucket[network] = (bucket[network] ?? 0) + followers;
    perDay.set(date, bucket);
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

  /*
   * Tendencia de impresiones. Los contadores son acumulados, así que el total de
   * un día es la suma de la última lectura de cada pieza HASTA ese día: la curva
   * sube a medida que las piezas juntan vistas y su punto final coincide, por
   * construcción, con la tarjeta de impresiones. Sumar las lecturas de cada día
   * daría un número inventado — la misma vista contada una vez por corrida.
   */
  const impressionsTrend = await trendOfImpressions(
    posts.map((post) => post.id),
    from,
    now
  );

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
    impressionsTrend,
    top: ranked.slice(0, PIECES_LIMIT),
    worst: measured.slice(-PIECES_LIMIT).reverse(),
    totals: summarize(pieces),
  };
}
