import type {
  Brief,
  Client,
  ClientProfile,
  Package,
  Report,
  SocialNetwork,
  Task,
  User,
} from '@prisma/client';
import type { z } from 'zod';
import type {
  changePasswordSchema,
  completeTaskSchema,
  createClientProfileSchema,
  createClientSchema,
  createPackageSchema,
  createTaskSchema,
  createUserSchema,
  updateClientProfileSchema,
  updateClientSchema,
  updatePackageSchema,
  updateTaskSchema,
  updateUserSchema,
} from '@/lib/validations/admin';

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateClientProfileInput = z.infer<typeof createClientProfileSchema>;
export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

/** Nunca sale el hash. Este es el shape que ve el cliente HTTP. */
export type AgencyUser = Pick<
  User,
  'id' | 'email' | 'name' | 'role' | 'isActive' | 'mustChangePassword' | 'createdAt'
>;

/** Lo único que necesita el select de responsable. */
export type AgencyUserOption = Pick<User, 'id' | 'name' | 'role'>;

/** Sólo en la respuesta del alta: la temporal se muestra una vez y no se guarda. */
export interface CreatedUser extends AgencyUser {
  temporaryPassword: string;
}

export type AgencyClientProfile = ClientProfile;

export interface AgencyClient extends Client {
  profiles: AgencyClientProfile[];
  _count?: { packages: number; briefs: number };
}

/** Sin `blobUrl`: el link crudo del Blob nunca sale del servidor. */
export interface AgencyBrief extends Omit<Brief, 'blobUrl'> {
  uploadedBy: Pick<User, 'id' | 'name'> | null;
}

/** La ficha completa. El listado no trae briefs ni paquetes: pesan y no se ven. */
export interface AgencyClientDetail extends Client {
  profiles: AgencyClientProfile[];
  briefs: AgencyBrief[];
  packages: (Package & { _count: { tasks: number } })[];
}

export interface AgencyTask extends Task {
  assignee: Pick<User, 'id' | 'name'> | null;
  package: Pick<Package, 'id' | 'month' | 'clientId'> & {
    client: Pick<Client, 'id' | 'name' | 'slug'>;
  };
}

export interface AgencyPackage extends Package {
  client: Pick<Client, 'id' | 'name' | 'slug'>;
  /** Derivado: hechas sobre comprometidas. */
  progress: { done: number; total: number; committed: number };
  reports: Pick<Report, 'id' | 'createdAt'>[];
}

export const NETWORK_LABELS: Record<SocialNetwork, string> = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  X: 'X',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
};

export const ROLE_LABELS: Record<'ADMIN' | 'EMPLOYEE', string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Empleado',
};

export const CLIENT_STATUS_LABELS: Record<'ACTIVE' | 'PAUSED' | 'CHURNED', string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CHURNED: 'Baja',
};

// ── Métricas ────────────────────────────────────────────────────────────────
// Doctrina heredada de IMPERIA, y es la razón de que estos tipos no reusen los
// de las tablas: los contadores son ACUMULADOS desde que se publicó la pieza. El
// rendimiento de una pieza es su ÚLTIMA lectura; el crecimiento de una cuenta es
// la RESTA entre dos lecturas. Nada se suma a lo largo del tiempo.
//
// Un `null` significa "esta red no reporta esta métrica", NO cero. Facebook
// devuelve `impressions: 0` en todos los posts de página porque Meta no expone
// ese insight: mostrarlo como cero diría que nadie lo vio, que es falso.

/** Foto de una cuenta en un instante. Las ventanas (1d/7d/30d) las calcula la red. */
export interface AccountSnapshot {
  network: SocialNetwork;
  recordedAt: string;
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

export interface AccountSummary {
  profileId: number;
  network: SocialNetwork;
  handle: string | null;
  expiresAt: string | null;
  current: AccountSnapshot | null;
  /** Lectura más vieja DENTRO del rango. `null` si se empezó a medir después. */
  previous: AccountSnapshot | null;
  /** `current.followers - previous.followers`. `null` si falta alguna punta. */
  followersGained: number | null;
}

/** Un punto de la serie de seguidores. `null` = no hubo lectura ese día. */
export interface FollowersPoint {
  date: string;
  values: Partial<Record<SocialNetwork, number | null>>;
}

/** Rendimiento final de una pieza: su última lectura de contadores. */
export interface PieceRow {
  socialPostId: number;
  network: SocialNetwork;
  permalink: string | null;
  excerpt: string;
  publishedAt: string | null;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  interactions: number;
  /** Interacciones / impresiones. `null` cuando la red no da impresiones. */
  engagement: number | null;
}

export interface PiecesSummary {
  pieces: number;
  impressions: number;
  interactions: number;
  engagement: number | null;
  interactionsPerPiece: number | null;
}

export interface OrganicMetrics {
  /** `false` = el cliente no tiene cuentas conectadas todavía. */
  configured: boolean;
  /** `false` = hay cuentas pero nunca se sincronizó: no hay nada que graficar. */
  hasData: boolean;
  from: string;
  to: string;
  syncedAt: string | null;
  accounts: AccountSummary[];
  series: FollowersPoint[];
  top: PieceRow[];
  worst: PieceRow[];
  totals: PiecesSummary;
}

/** Cuántas filas trae cada ranking. Más que esto es cola larga que nadie lee. */
export const PIECES_LIMIT = 10;

export const VALID_RANGES = [7, 28, 90] as const;
export type MetricsRange = (typeof VALID_RANGES)[number];

/**
 * Interacciones de una pieza: todo lo que alguien hizo con ella más allá de
 * verla. Se suma sólo lo que la red reportó — un `null` no aporta, pero tampoco
 * invalida al resto.
 */
export function interactionsOf(row: {
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
}): number {
  return (row.likes ?? 0) + (row.comments ?? 0) + (row.saves ?? 0) + (row.shares ?? 0);
}

/**
 * Tasa de engagement. `null` cuando no hay impresiones medibles: devolver 0
 * haría parecer que nadie interactuó, que es una afirmación distinta y falsa.
 */
export function engagementRate(interactions: number, impressions: number | null): number | null {
  if (impressions === null || impressions === 0) return null;
  return interactions / impressions;
}

/** Formato de métrica para la UI: `null` se muestra como "—", nunca como 0. */
export function formatMetric(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('es-AR').format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

// ── Reportes ────────────────────────────────────────────────────────────────

/** Foto congelada. Un reporte de octubre no cambia si se abre en diciembre. */
export interface ReportSnapshot {
  generatedAt: string;
  client: { id: number; name: string };
  month: string;
  committedPieces: number;
  deliveredPieces: number;
  tasks: {
    title: string;
    network: SocialNetwork;
    format: string;
    dueDate: string;
    completedAt: string | null;
    assignee: string | null;
    permalink: string | null;
    metrics: {
      impressions: number | null;
      reach: number | null;
      likes: number | null;
      comments: number | null;
      interactions: number | null;
      /** `false` = la pieza todavía no apareció en el catálogo del agregador. */
      matched: boolean;
    };
  }[];
  totals: PiecesSummary;
}

/** Lo que trae el listado: sin el snapshot, que pesa y no se usa hasta abrirlo. */
export interface AgencyReportSummary {
  id: number;
  packageId: number;
  createdAt: Date;
  generatedBy: Pick<User, 'id' | 'name'> | null;
  package: Pick<Package, 'id' | 'month'> & { client: Pick<Client, 'id' | 'name'> };
}

export interface AgencyReport extends Omit<Report, 'snapshot'> {
  snapshot: ReportSnapshot;
  package: Pick<Package, 'id' | 'month'> & { client: Pick<Client, 'id' | 'name'> };
  generatedBy: Pick<User, 'id' | 'name'> | null;
}
