'use client';

import { motion } from 'framer-motion';
import { NETWORK_LABELS } from '@/lib/types/agency';
import { MUTED_STYLE, NetworkIcon } from '@/components/agencia/agency-ui';
import type { FollowersPoint } from '@/lib/types/agency';
import type { SocialNetwork } from '@prisma/client';

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 24, left: 16 };

const LINE_COLORS: Record<SocialNetwork, string> = {
  INSTAGRAM: '322 70% 50%',
  FACEBOOK: '221 60% 48%',
  X: '0 0% 45%',
  TIKTOK: '183 70% 42%',
  YOUTUBE: '0 72% 48%',
};

interface Line {
  network: SocialNetwork;
  path: string;
  last: { x: number; y: number; value: number } | null;
}

/**
 * Sparkline hecho a mano en SVG. No hay librería de gráficos en el proyecto y
 * traer una entera para dibujar tres polilíneas serían ~50 kB de JS por una
 * pantalla que se mira una vez por semana.
 *
 * Los `null` de la serie son "ese día no hubo lectura", no cero: se saltean y
 * la línea sigue de largo en vez de caer al piso y mentir una baja de cuenta.
 */
export function FollowersChart({ series }: { series: FollowersPoint[] }) {
  const networks = Array.from(
    new Set(series.flatMap((point) => Object.keys(point.values) as SocialNetwork[]))
  );

  const values = series.flatMap((point) =>
    Object.values(point.values).filter((value): value is number => value !== null && value !== undefined)
  );

  if (series.length < 2 || values.length === 0) {
    return (
      <p className="py-8 text-center text-sm" style={MUTED_STYLE}>
        Todavía no hay suficientes lecturas para dibujar la evolución. Hacen falta al menos dos días
        sincronizados.
      </p>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  // Una cuenta que ganó 3 seguidores en el mes no tiene que verse como un
  // cohete: si el rango es plano se fuerza una banda mínima.
  const span = Math.max(max - min, Math.max(1, Math.round(max * 0.02)));
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xOf = (index: number) =>
    PADDING.left + (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth);
  const yOf = (value: number) => PADDING.top + innerHeight - ((value - min) / span) * innerHeight;

  const lines: Line[] = networks.map((network) => {
    const points = series
      .map((point, index) => ({ index, value: point.values[network] ?? null }))
      .filter((point): point is { index: number; value: number } => point.value !== null);

    const path = points
      .map((point, order) => `${order === 0 ? 'M' : 'L'}${xOf(point.index)},${yOf(point.value)}`)
      .join(' ');

    const lastPoint = points.at(-1);
    return {
      network,
      path,
      last: lastPoint
        ? { x: xOf(lastPoint.index), y: yOf(lastPoint.value), value: lastPoint.value }
        : null,
    };
  });

  const formatDay = (date: string) => date.slice(5).split('-').reverse().join('/');

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Evolución de seguidores por red"
      >
        <line
          x1={PADDING.left}
          y1={PADDING.top + innerHeight}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + innerHeight}
          stroke="hsl(var(--admin-surface-border))"
          strokeWidth={1}
        />
        {lines.map((line) => (
          <g key={line.network}>
            <motion.path
              d={line.path}
              fill="none"
              stroke={`hsl(${LINE_COLORS[line.network]})`}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            {line.last && (
              <circle
                cx={line.last.x}
                cy={line.last.y}
                r={3}
                fill={`hsl(${LINE_COLORS[line.network]})`}
              />
            )}
          </g>
        ))}
        <text
          x={PADDING.left}
          y={HEIGHT - 6}
          fontSize={11}
          fill="hsl(var(--admin-muted-foreground))"
        >
          {formatDay(series[0].date)}
        </text>
        <text
          x={WIDTH - PADDING.right}
          y={HEIGHT - 6}
          fontSize={11}
          textAnchor="end"
          fill="hsl(var(--admin-muted-foreground))"
        >
          {formatDay(series[series.length - 1].date)}
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {lines.map((line) => (
          <span key={line.network} className="flex items-center gap-2 text-xs">
            <NetworkIcon
              network={line.network}
              className="h-3.5 w-3.5"
              style={{ color: `hsl(${LINE_COLORS[line.network]})` }}
            />
            <span className="font-medium">{NETWORK_LABELS[line.network]}</span>
            <span style={MUTED_STYLE}>
              {line.last ? new Intl.NumberFormat('es-AR').format(line.last.value) : '—'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
