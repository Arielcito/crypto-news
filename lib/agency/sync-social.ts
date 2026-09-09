import { Prisma, type SocialNetwork } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { daysAgo } from '@/lib/agency/dates';
import { chunk, createPostProxyClient, type PostProxyClient } from '@/lib/agency/postproxy';

/**
 * Orquestación de la sincronización: le pide a PostProxy el catálogo y los
 * contadores y los deja en Postgres. El panel lee de la base y nunca toca
 * PostProxy en vivo — una pantalla no puede depender de la latencia ni del rate
 * limit de un tercero.
 *
 * Tres pasos independientes porque son tres llamadas independientes: si las
 * estadísticas de piezas mueren con un 429, el catálogo y el estado de las
 * cuentas ya quedaron guardados y el reintento no los re-baja.
 */

/** Cuántas piezas del catálogo se traen por corrida. */
const CATALOG_LIMIT = 500;

/**
 * Hasta cuántos días atrás se le piden contadores a una pieza. Más allá de eso
 * los números ya no se mueven —un post de Instagram junta casi todo su alcance
 * en las primeras 48 h— y seguir pidiéndolos haría que cada corrida fuera más
 * cara que la anterior, para siempre.
 */
const STATS_DAYS = 90;

/** Filas por INSERT. Postgres admite muchas más, pero el payload ya pesa. */
const UPSERT_CHUNK = 200;

type Cell = number | Date | null;

const quoted = (columns: string[]) => columns.map((column) => `"${column}"`).join(', ');

/**
 * Inserta lecturas y REPARA las que ya estaban.
 *
 * `createMany({ skipDuplicates: true })` era idempotente pero también amnésico:
 * si una lectura se guardó con nulls —porque el adapter buscaba la clave
 * equivocada, que es exactamente lo que pasó con TikTok y YouTube—, la fila
 * quedaba nula para siempre aunque PostProxy siguiera teniendo el número. El
 * `COALESCE(EXCLUDED.x, tabla.x)` pisa sólo lo que ahora sí viene y nunca
 * reemplaza un número guardado por un null nuevo.
 */
async function upsertReadings(
  table: string,
  keyColumns: [string, string],
  valueColumns: string[],
  rows: Cell[][]
): Promise<number> {
  let written = 0;

  for (const batch of chunk(rows, UPSERT_CHUNK)) {
    const values = Prisma.join(batch.map((row) => Prisma.sql`(${Prisma.join(row)})`));
    const updates = Prisma.join(
      valueColumns.map((column) =>
        Prisma.raw(`"${column}" = COALESCE(EXCLUDED."${column}", "${table}"."${column}")`)
      )
    );

    written += await prisma.$executeRaw`
      INSERT INTO ${Prisma.raw(`"${table}"`)} (${Prisma.raw(quoted([...keyColumns, ...valueColumns]))})
      VALUES ${values}
      ON CONFLICT (${Prisma.raw(quoted(keyColumns))}) DO UPDATE SET ${updates}
    `;
  }

  return written;
}

export interface SyncResult {
  posts: number;
  postReadings: number;
  accountReadings: number;
  /** `true` si se llegó al tope del catálogo: hay piezas viejas sin traer. */
  truncated: boolean;
}

function client(): PostProxyClient {
  return createPostProxyClient(process.env.POSTPROXY_API_KEY);
}

/** `postproxy_profile_id` → id local. Nuestra base manda sobre el agregador. */
async function profileMap(): Promise<Map<string, { id: number; network: SocialNetwork }>> {
  const profiles = await prisma.clientProfile.findMany({
    where: { isActive: true },
    select: { id: true, postproxyProfileId: true, network: true },
  });
  return new Map(profiles.map((p) => [p.postproxyProfileId, { id: p.id, network: p.network }]));
}

/** Baja el catálogo de piezas y lo ata al perfil local que le corresponde. */
export async function syncCatalog(api: PostProxyClient = client()): Promise<{
  posts: number;
  truncated: boolean;
}> {
  const [raw, profiles] = await Promise.all([api.listPosts(CATALOG_LIMIT), profileMap()]);

  let saved = 0;
  for (const post of raw) {
    const profile = post.postproxyProfileId ? profiles.get(post.postproxyProfileId) : undefined;
    const data = {
      clientProfileId: profile?.id ?? null,
      permalink: post.permalink,
      body: post.body,
      origin: post.origin,
      publishedAt: post.publishedAt,
    };

    await prisma.socialPost.upsert({
      where: { postproxyPostId_network: { postproxyPostId: post.postId, network: post.network } },
      create: { postproxyPostId: post.postId, network: post.network, ...data },
      update: data,
    });
    saved += 1;
  }

  console.log(`[sync-social] catálogo: ${saved} piezas guardadas`);
  return { posts: saved, truncated: raw.length >= CATALOG_LIMIT };
}

/** Baja la historia de contadores de las piezas recientes. */
export async function syncPostStats(api: PostProxyClient = client()): Promise<number> {
  const since = daysAgo(STATS_DAYS);
  const posts = await prisma.socialPost.findMany({
    where: { OR: [{ publishedAt: { gte: since } }, { publishedAt: null, createdAt: { gte: since } }] },
    select: { id: true, postproxyPostId: true, network: true },
  });
  if (posts.length === 0) {
    console.log('[sync-social] no hay piezas recientes para pedir stats');
    return 0;
  }

  const byKey = new Map(posts.map((p) => [`${p.postproxyPostId}:${p.network}`, p.id]));
  const readings = await api.postStats(posts.map((p) => p.postproxyPostId));

  const rows = readings
    .map((reading): Cell[] | null => {
      const socialPostId = byKey.get(`${reading.postId}:${reading.network}`);
      if (!socialPostId) return null;
      return [
        socialPostId,
        reading.recordedAt,
        reading.impressions,
        reading.reach,
        reading.likes,
        reading.comments,
        reading.saves,
        reading.shares,
        reading.clicks,
      ];
    })
    .filter((row): row is Cell[] => row !== null);

  if (rows.length === 0) return 0;
  const count = await upsertReadings(
    'social_post_metrics',
    ['social_post_id', 'recorded_at'],
    ['impressions', 'reach', 'likes', 'comments', 'saves', 'shares', 'clicks'],
    rows
  );
  console.log(`[sync-social] ${count} lecturas de pieza guardadas`);
  return count;
}

/** Baja seguidores y alcance de cada cuenta conectada. */
export async function syncAccountStats(api: PostProxyClient = client()): Promise<number> {
  const profiles = await prisma.clientProfile.findMany({
    where: { isActive: true },
    select: { id: true, postproxyProfileId: true, network: true },
  });
  if (profiles.length === 0) {
    console.log('[sync-social] no hay cuentas conectadas');
    return 0;
  }

  const byProfile = new Map(profiles.map((p) => [p.postproxyProfileId, p.id]));
  const readings = await api.accountStats(profiles);

  const rows = readings
    .map((reading): Cell[] | null => {
      const clientProfileId = byProfile.get(reading.postproxyProfileId);
      if (!clientProfileId) return null;
      return [
        clientProfileId,
        reading.recordedAt,
        reading.followers,
        reading.posts,
        reading.reach1d,
        reading.reach7d,
        reading.reach30d,
        reading.profileViews7d,
        reading.accountsEngaged7d,
        reading.interactions7d,
        reading.websiteClicks7d,
      ];
    })
    .filter((row): row is Cell[] => row !== null);

  if (rows.length === 0) return 0;
  const count = await upsertReadings(
    'social_account_metrics',
    ['client_profile_id', 'recorded_at'],
    [
      'followers',
      'posts',
      'reach_1d',
      'reach_7d',
      'reach_30d',
      'profile_views_7d',
      'accounts_engaged_7d',
      'interactions_7d',
      'website_clicks_7d',
    ],
    rows
  );
  console.log(`[sync-social] ${count} lecturas de cuenta guardadas`);
  return count;
}

/** Corrida completa. La usan el cron y el botón de sincronizar del panel. */
export async function syncSocial(api: PostProxyClient = client()): Promise<SyncResult> {
  const catalog = await syncCatalog(api);
  const postReadings = await syncPostStats(api);
  const accountReadings = await syncAccountStats(api);

  return {
    posts: catalog.posts,
    postReadings,
    accountReadings,
    truncated: catalog.truncated,
  };
}
