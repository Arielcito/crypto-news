'use client';

import { ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ADMIN_SURFACE_STYLE,
  MUTED_STYLE,
  NetworkBadge,
} from '@/components/agencia/agency-ui';
import { formatDateAr } from '@/lib/agency/dates';
import { formatMetric, formatPercent } from '@/lib/types/agency';
import type { PieceRow } from '@/lib/types/agency';

/**
 * El rendimiento de una pieza es su ÚLTIMA lectura de contadores, no una suma
 * del período: los contadores de las redes son acumulados desde que se publicó.
 */
export function PiecesTable({ rows }: { rows: PieceRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={MUTED_STYLE}>
        No hay piezas medidas en este rango.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.socialPostId}
            className="rounded-lg border p-3"
            style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-sm font-medium">{row.excerpt}</p>
              <NetworkBadge network={row.network} />
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt style={MUTED_STYLE}>Impresiones</dt>
                <dd className="font-medium tabular-nums">{formatMetric(row.impressions)}</dd>
              </div>
              <div>
                <dt style={MUTED_STYLE}>Interacciones</dt>
                <dd className="font-medium tabular-nums">{formatMetric(row.interactions)}</dd>
              </div>
              <div>
                <dt style={MUTED_STYLE}>Engagement</dt>
                <dd className="font-medium tabular-nums">{formatPercent(row.engagement)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border lg:block" style={ADMIN_SURFACE_STYLE}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pieza</TableHead>
              <TableHead>Red</TableHead>
              <TableHead className="text-right">Impresiones</TableHead>
              <TableHead className="text-right">Alcance</TableHead>
              <TableHead className="text-right">Interacciones</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.socialPostId}>
                <TableCell className="max-w-[280px]">
                  <p className="truncate font-medium">{row.excerpt}</p>
                  {row.publishedAt && (
                    <p className="text-xs" style={MUTED_STYLE}>
                      {formatDateAr(row.publishedAt)}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <NetworkBadge network={row.network} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMetric(row.impressions)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMetric(row.reach)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMetric(row.interactions)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(row.engagement)}</TableCell>
                <TableCell className="text-right">
                  {row.permalink && (
                    <a
                      href={row.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex p-2"
                      style={MUTED_STYLE}
                      aria-label="Abrir la pieza"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
