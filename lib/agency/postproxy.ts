import type { SocialNetwork } from '@prisma/client';

/**
 * Adapter de PostProxy. Portado casi textual del que ya corre en IMPERIA
 * (`src/metricas/adapters/postproxy-social.ts`), extendido a TikTok y YouTube.
 * `fetch` nativo, sin SDK, la API key sale del entorno en cada llamada —puede
 * rotar sin reiniciar— y nunca se loguea.
 *
 * Tres endpoints:
 *   - `GET /posts` (paginado, arranca en page=0)  → catálogo de piezas.
 *   - `GET /posts/stats?post_ids=…` (≤50 ids)     → historia de contadores.
 *   - `GET /profiles/:id/stats`                   → historia del estado de la cuenta.
 *
 * ASIMETRÍA DE PLATAFORMAS, y es de la red, no nuestra: Instagram entrega
 * impresiones, alcance, likes, comentarios, guardados y compartidos. Facebook
 * entrega SÓLO likes y clics — su `impressions` llega en 0 en todos los posts de
 * página porque Meta no expone ese insight, así que se mapea a `null` y no a 0.
 * Guardar el 0 diría "nadie lo vio", una afirmación distinta —y falsa— frente a
 * "la red no lo informa".
 */

const POSTPROXY_API = 'https://api.postproxy.dev/api';

/** Red de contención contra una cuenta con miles de piezas. */
const MAX_PAGES = 10;
const PER_PAGE = 50;

/** Tope de ids por llamada a `/posts/stats` que acepta el agregador. */
export const STATS_BATCH = 50;

const NETWORKS: Record<string, SocialNetwork> = {
  instagram: 'INSTAGRAM',
  facebook: 'FACEBOOK',
  x: 'X',
  twitter: 'X',
  tiktok: 'TIKTOK',
  youtube: 'YOUTUBE',
};

export class PostProxyNotConfigured extends Error {
  constructor() {
    super('Falta POSTPROXY_API_KEY: no hay con qué pedirle métricas al agregador');
    this.name = 'PostProxyNotConfigured';
  }
}

export interface RawPost {
  postId: string;
  network: SocialNetwork;
  postproxyProfileId: string | null;
  origin: 'POSTPROXY' | 'NATIVE';
  permalink: string | null;
  body: string | null;
  publishedAt: Date | null;
}

export interface PostReading {
  postId: string;
  network: SocialNetwork;
  recordedAt: Date;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  clicks: number | null;
}

export interface AccountReading {
  postproxyProfileId: string;
  network: SocialNetwork;
  recordedAt: Date;
  followers: number | null;
  posts: number | null;
  reach1d: number | null;
  reach7d: number | null;
  reach30d: number | null;
  profileViews7d: number | null;
  accountsEngaged7d: number | null;
  interactions7d: number | null;
  websiteClicks7d: number | null;
}

interface PlatformPost {
  platform?: string;
  profile_id?: string;
  status?: string;
  permalink?: string;
}

interface PostResponse {
  id?: string;
  body?: string;
  source?: string;
  created_at?: string;
  platforms?: PlatformPost[];
}

/** Los contadores llegan en dos capas: `stats` normalizada y `raw_stats` de la red. */
interface StatsRecord {
  stats?: Record<string, number | Record<string, number>>;
  raw_stats?: Record<string, number | Record<string, number>>;
  recorded_at?: string;
}

interface PostsResponse {
  total?: number;
  data?: PostResponse[];
}

interface PostStatsResponse {
  data?: Record<string, { platforms?: { platform?: string; records?: StatsRecord[] }[] }>;
}

interface PlacementsResponse {
  data?: { id?: string }[];
}

interface ProfileStatsResponse {
  data?: { platform?: string; records?: StatsRecord[] };
}

function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function textOrNull(raw: string | undefined): string | null {
  const clean = raw?.trim();
  return clean ? clean : null;
}

/**
 * Lee una métrica del bolsón de stats. Devuelve `null` —no 0— cuando la clave no
 * vino: es la diferencia entre "la red no lo informa" y "dio cero", que es todo
 * el punto del dashboard.
 */
function metric(
  bag: Record<string, number | Record<string, number>> | undefined,
  key: string
): number | null {
  const value = bag?.[key];
  return typeof value === 'number' ? value : null;
}

export function networkOf(platform: string | undefined): SocialNetwork | null {
  return NETWORKS[platform?.toLowerCase() ?? ''] ?? null;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/**
 * Normaliza una lectura de contadores según la red. Es el único lugar del sistema
 * que sabe qué reporta cada plataforma; de acá para arriba todo son
 * `number | null` sin casos especiales.
 */
function normalizePostReading(
  postId: string,
  network: SocialNetwork,
  record: StatsRecord
): PostReading | null {
  const recordedAt = parseDate(record.recorded_at);
  if (!recordedAt) return null;

  const s = record.stats;
  const raw = record.raw_stats;

  if (network === 'FACEBOOK') {
    return {
      postId,
      network,
      recordedAt,
      // Meta no expone impresiones ni alcance de posts de página: null, no 0.
      impressions: null,
      reach: null,
      likes: metric(s, 'likes'),
      comments: null,
      saves: null,
      shares: null,
      clicks: metric(s, 'clicks'),
    };
  }

  if (network === 'YOUTUBE') {
    return {
      postId,
      network,
      recordedAt,
      impressions: metric(s, 'views') ?? metric(raw, 'viewCount'),
      reach: null,
      likes: metric(s, 'likes') ?? metric(raw, 'likeCount'),
      comments: metric(s, 'comments') ?? metric(raw, 'commentCount'),
      saves: null,
      shares: null,
      clicks: null,
    };
  }

  if (network === 'TIKTOK') {
    return {
      postId,
      network,
      recordedAt,
      impressions: metric(s, 'views') ?? metric(raw, 'video_views'),
      reach: metric(raw, 'reach'),
      likes: metric(s, 'likes'),
      comments: metric(s, 'comments'),
      saves: metric(raw, 'saved'),
      shares: metric(s, 'shares') ?? metric(raw, 'shares'),
      clicks: null,
    };
  }

  return {
    postId,
    network,
    recordedAt,
    impressions: metric(s, 'impressions'),
    // El alcance (cuentas únicas) sólo viene en el crudo de la red.
    reach: metric(raw, 'reach'),
    likes: metric(s, 'likes'),
    comments: metric(s, 'comments'),
    saves: metric(s, 'saved'),
    shares: metric(raw, 'shares'),
    clicks: null,
  };
}

/** Estado de la cuenta. Facebook sólo reporta seguidores; el resto queda en null. */
function normalizeAccountReading(
  postproxyProfileId: string,
  network: SocialNetwork,
  record: StatsRecord
): AccountReading | null {
  const recordedAt = parseDate(record.recorded_at);
  if (!recordedAt) return null;

  const s = record.stats;
  return {
    postproxyProfileId,
    network,
    recordedAt,
    followers:
      metric(s, 'followers_count') ?? metric(s, 'fan_count') ?? metric(s, 'subscriber_count'),
    posts: metric(s, 'media_count') ?? metric(s, 'video_count'),
    reach1d: metric(s, 'reach_1d'),
    reach7d: metric(s, 'reach_7d'),
    reach30d: metric(s, 'reach_30d'),
    profileViews7d: metric(s, 'profile_views_7d'),
    accountsEngaged7d: metric(s, 'accounts_engaged_7d'),
    interactions7d: metric(s, 'total_interactions_7d'),
    websiteClicks7d: metric(s, 'website_clicks_7d'),
  };
}

export interface PostProxyClient {
  listPosts(limit: number): Promise<RawPost[]>;
  postStats(postIds: string[]): Promise<PostReading[]>;
  accountStats(
    profiles: { postproxyProfileId: string; network: SocialNetwork }[]
  ): Promise<AccountReading[]>;
}

export function createPostProxyClient(apiKey: string | undefined): PostProxyClient {
  async function request<T>(path: string): Promise<T> {
    if (!apiKey) throw new PostProxyNotConfigured();

    const res = await fetch(`${POSTPROXY_API}${path}`, {
      headers: { authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const detail = await res.text();
      // Se loguea la ruta sin query: los ids no aportan y la key nunca viaja acá.
      console.error(
        `[postproxy] HTTP ${res.status} en ${path.split('?')[0]}: ${detail.slice(0, 200)}`
      );
      throw new Error(`PostProxy respondió HTTP ${res.status}`);
    }

    return (await res.json()) as T;
  }

  return {
    async listPosts(limit: number): Promise<RawPost[]> {
      const posts: RawPost[] = [];

      for (let page = 0; page < MAX_PAGES; page++) {
        const data = await request<PostsResponse>(`/posts?page=${page}&per_page=${PER_PAGE}`);
        const items = data.data ?? [];

        for (const post of items) {
          if (!post.id) continue;
          // Una pieza apunta a una sola red en la práctica, pero el contrato es
          // una lista: se abre en una fila por red para no perder ninguna.
          for (const platform of post.platforms ?? []) {
            const network = networkOf(platform.platform);
            if (!network) continue;
            posts.push({
              postId: post.id,
              network,
              postproxyProfileId: textOrNull(platform.profile_id),
              // `imported` = lo subió el cliente a mano y el agregador lo trajo.
              origin: post.source === 'postproxy' ? 'POSTPROXY' : 'NATIVE',
              permalink: textOrNull(platform.permalink),
              body: textOrNull(post.body),
              publishedAt: parseDate(post.created_at),
            });
          }
        }

        if (items.length < PER_PAGE || posts.length >= limit) break;
      }

      console.log(`[postproxy] catálogo: ${posts.length} piezas (tope ${limit})`);
      return posts.slice(0, limit);
    },

    async postStats(postIds: string[]): Promise<PostReading[]> {
      const readings: PostReading[] = [];

      for (const batch of chunk(postIds, STATS_BATCH)) {
        const data = await request<PostStatsResponse>(`/posts/stats?post_ids=${batch.join(',')}`);
        for (const [postId, value] of Object.entries(data.data ?? {})) {
          for (const platform of value.platforms ?? []) {
            const network = networkOf(platform.platform);
            if (!network) continue;
            for (const record of platform.records ?? []) {
              const reading = normalizePostReading(postId, network, record);
              if (reading) readings.push(reading);
            }
          }
        }
      }

      console.log(`[postproxy] ${readings.length} lecturas de ${postIds.length} piezas`);
      return readings;
    },

    async accountStats(
      profiles: { postproxyProfileId: string; network: SocialNetwork }[]
    ): Promise<AccountReading[]> {
      const readings: AccountReading[] = [];

      for (const profile of profiles) {
        // Facebook mide por PÁGINA, no por perfil: sin `placement_id` el endpoint
        // responde 400. Instagram, en cambio, lo rechaza.
        let query = '';
        if (profile.network === 'FACEBOOK') {
          const places = await request<PlacementsResponse>(
            `/profiles/${profile.postproxyProfileId}/placements`
          );
          const pageId = places.data?.[0]?.id;
          if (!pageId) {
            console.warn(`[postproxy] ${profile.postproxyProfileId}: sin página, se saltea`);
            continue;
          }
          query = `?placement_id=${pageId}`;
        }

        const data = await request<ProfileStatsResponse>(
          `/profiles/${profile.postproxyProfileId}/stats${query}`
        );
        for (const record of data.data?.records ?? []) {
          const reading = normalizeAccountReading(
            profile.postproxyProfileId,
            profile.network,
            record
          );
          if (reading) readings.push(reading);
        }
      }

      console.log(`[postproxy] ${readings.length} lecturas de cuenta`);
      return readings;
    },
  };
}
