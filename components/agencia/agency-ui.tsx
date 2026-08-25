'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import { SiFacebook, SiInstagram, SiTiktok, SiX, SiYoutube } from 'react-icons/si';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NETWORK_LABELS } from '@/lib/types/agency';
import type { Urgency } from '@/lib/agency/dates';
import type { SocialNetwork } from '@prisma/client';

export const ADMIN_SURFACE_STYLE: CSSProperties = {
  backgroundColor: 'hsl(var(--admin-surface))',
  borderColor: 'hsl(var(--admin-surface-border))',
  color: 'hsl(var(--admin-surface-foreground))',
};

export const MUTED_STYLE: CSSProperties = { color: 'hsl(var(--admin-muted-foreground))' };

interface AgencyCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function AgencyCard({ title, description, action, className, children }: AgencyCardProps) {
  return (
    <section className={cn('rounded-lg border p-4 sm:p-5', className)} style={ADMIN_SURFACE_STYLE}>
      {(title || action) && (
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="font-admin text-lg font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm" style={MUTED_STYLE}>
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-12 text-center"
      style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
    >
      <Icon className="h-8 w-8" style={MUTED_STYLE} />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-sm" style={MUTED_STYLE}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 3, height = 'h-12' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('w-full', height)}
          style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }}
        />
      ))}
    </div>
  );
}

export function ErrorNote({ error, resource }: { error: unknown; resource: string }) {
  return (
    <p className="text-sm text-destructive">
      Error al cargar {resource}: {error instanceof Error ? error.message : 'error desconocido'}
    </p>
  );
}

/*
 * Cada red con su logo y su color de marca. Es el único dato de la fila que se
 * reconoce de un vistazo: leer "INSTAGRAM" en texto plano en una tabla de 40
 * tareas obliga a frenar en cada renglón.
 *
 * Los tonos no son el hex oficial de cada marca: están corridos para que
 * contrasten sobre el fondo claro y el oscuro del panel sin cambiar de paleta.
 */
const NETWORK_STYLES: Record<SocialNetwork, { color: string; Icon: IconType }> = {
  INSTAGRAM: { color: '322 70% 50%', Icon: SiInstagram },
  FACEBOOK: { color: '221 60% 48%', Icon: SiFacebook },
  X: { color: '0 0% 35%', Icon: SiX },
  TIKTOK: { color: '183 70% 42%', Icon: SiTiktok },
  YOUTUBE: { color: '0 72% 48%', Icon: SiYoutube },
};

/** El logo solo, para cuando el nombre de la red ya está escrito al lado. */
export function NetworkIcon({
  network,
  className,
  style,
}: {
  network: SocialNetwork;
  className?: string;
  /** Se aplica después del color de marca, para pisarlo donde haga falta. */
  style?: CSSProperties;
}) {
  const { color, Icon } = NETWORK_STYLES[network];
  return (
    <Icon
      className={cn('shrink-0', className ?? 'h-4 w-4')}
      style={{ color: `hsl(${color})`, ...style }}
      aria-hidden
    />
  );
}

export function NetworkBadge({ network }: { network: SocialNetwork }) {
  const { color, Icon } = NETWORK_STYLES[network];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `hsl(${color} / 0.12)`, color: `hsl(${color})` }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {NETWORK_LABELS[network]}
    </span>
  );
}

/*
 * Los clientes no tienen logo cargado en la base, así que la marca se arma con
 * las iniciales sobre un color derivado del nombre: siempre el mismo para el
 * mismo cliente, que es lo que hace que sirva para reconocerlo en una lista.
 */
function hueOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  return hash;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const AVATAR_SIZES = {
  sm: 'h-8 w-8 text-[0.7rem]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-base',
} as const;

export function ClientAvatar({
  name,
  seed,
  size = 'md',
}: {
  name: string;
  /** El slug es estable aunque le cambien el nombre al cliente. */
  seed?: string;
  size?: keyof typeof AVATAR_SIZES;
}) {
  // El tono va por variable y no inline: el texto necesita otra luminosidad en
  // oscuro, y un `style` no sabe en qué tema está.
  const hue = hueOf(seed ?? name);
  return (
    <span
      className={cn(
        'admin-avatar grid shrink-0 place-items-center rounded-lg font-semibold tracking-wide',
        AVATAR_SIZES[size]
      )}
      style={{ '--avatar-hue': hue } as CSSProperties}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}

const URGENCY_STYLES: Record<Urgency, { bg: string; fg: string }> = {
  overdue: { bg: 'hsl(var(--admin-danger-bg))', fg: 'hsl(var(--admin-danger))' },
  today: { bg: 'hsl(var(--admin-warning-bg))', fg: 'hsl(var(--admin-warning))' },
  soon: { bg: 'hsl(var(--admin-warning-bg))', fg: 'hsl(var(--admin-warning))' },
  later: { bg: 'hsl(var(--admin-neutral-bg))', fg: 'hsl(var(--admin-neutral))' },
  done: { bg: 'hsl(var(--admin-positive-bg))', fg: 'hsl(var(--admin-positive))' },
};

export function UrgencyBadge({ urgency, label }: { urgency: Urgency; label: string }) {
  const style = URGENCY_STYLES[urgency];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.fg }} />
      {label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Cuando la métrica es de una red, se muestra su logo al lado del rótulo. */
  network?: SocialNetwork;
  /** `null` = la red no reporta el dato; se pinta apagado en vez de verde/rojo. */
  delta?: number | null;
}

export function StatCard({ label, value, hint, network, delta }: StatCardProps) {
  const deltaColor =
    delta === undefined || delta === null || delta === 0
      ? 'hsl(var(--admin-muted-foreground))'
      : delta > 0
        ? 'hsl(var(--admin-positive))'
        : 'hsl(var(--admin-danger))';

  return (
    <div className="rounded-lg border p-4" style={ADMIN_SURFACE_STYLE}>
      <p
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em]"
        style={MUTED_STYLE}
      >
        {network && <NetworkIcon network={network} className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="font-admin mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {delta !== undefined && (
        <p className="mt-1 text-xs font-medium" style={{ color: deltaColor }}>
          {delta === null
            ? 'Sin comparación en el rango'
            : `${delta > 0 ? '+' : ''}${new Intl.NumberFormat('es-AR').format(delta)} en el período`}
        </p>
      )}
      {hint && (
        <p className="mt-1 text-xs" style={MUTED_STYLE}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const complete = total > 0 && done >= total;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${done} de ${total} piezas`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: complete ? 'hsl(var(--admin-positive))' : 'hsl(var(--admin-accent))',
          }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums" style={MUTED_STYLE}>
        {done}/{total}
      </span>
    </div>
  );
}

/**
 * `<select>` nativo con los tokens del panel. En mobile abre el picker del
 * sistema, que se maneja mejor con el pulgar que un listbox custom.
 */
export const AGENCY_SELECT_CLASS =
  'h-10 w-full rounded-md border border-[hsl(var(--admin-surface-border))] bg-[hsl(var(--admin-surface))] px-3 text-sm text-[hsl(var(--admin-bg-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))] disabled:opacity-50';
