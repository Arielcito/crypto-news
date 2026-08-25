import type { SocialNetwork } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { daysAgo } from '@/lib/agency/dates';
import { createPostProxyClient, type PostProxyClient } from '@/lib/agency/postproxy';

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

  // `skipDuplicates` sobre la única (socialPostId, recordedAt): re-sincronizar la
  // misma lectura es idempotente y no duplica la historia.
  const rows = readings
    .map((reading) => {
      const socialPostId = byKey.get(`${reading.postId}:${reading.network}`);
      if (!socialPostId) return null;
      return {
        socialPostId,
        recordedAt: reading.recordedAt,
        impressions: reading.impressions,
        reach: reading.reach,
        likes: reading.likes,
        comments: reading.comments,
        saves: reading.saves,
        shares: reading.shares,
        clicks: reading.clicks,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return 0;
  const result = await prisma.socialPostMetric.createMany({ data: rows, skipDuplicates: true });
  console.log(`[sync-social] ${result.count} lecturas de pieza nuevas`);
  return result.count;
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
    .map((reading) => {
      const clientProfileId = byProfile.get(reading.postproxyProfileId);
      if (!clientProfileId) return null;
      return {
        clientProfileId,
        recordedAt: reading.recordedAt,
        followers: reading.followers,
        posts: reading.posts,
        reach1d: reading.reach1d,
        reach7d: reading.reach7d,
        reach30d: reading.reach30d,
        profileViews7d: reading.profileViews7d,
        accountsEngaged7d: reading.accountsEngaged7d,
        interactions7d: reading.interactions7d,
        websiteClicks7d: reading.websiteClicks7d,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return 0;
  const result = await prisma.socialAccountMetric.createMany({ data: rows, skipDuplicates: true });
  console.log(`[sync-social] ${result.count} lecturas de cuenta nuevas`);
  return result.count;
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
