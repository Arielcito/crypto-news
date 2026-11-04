'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ADMIN_SURFACE_STYLE,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
  NetworkBadge,
  ProgressBar,
  StatCard,
} from '@/components/agencia/agency-ui';
import { useAgencyReport } from '@/lib/use-agency-reports';
import { formatDateAr, formatDateTimeAr, formatMonthLabel } from '@/lib/agency/dates';
import { formatMetric, formatPercent } from '@/lib/types/agency';
import type { ReportSnapshot } from '@/lib/types/agency';

export function ReportView({ reportId }: { reportId: number }) {
  const { data: report, isLoading, isError, error } = useAgencyReport(reportId);

  if (isLoading) return <ListSkeleton rows={4} height="h-24" />;
  if (isError) return <ErrorNote error={error} resource="el reporte" />;
  if (!report) return <ErrorNote error={new Error('Reporte no encontrado')} resource="el reporte" />;

  const snapshot = report.snapshot;

  return (
    <div className="print-sheet space-y-5">
      <div className="print-hide flex items-center justify-between">
        <Link
          href="/admin/agencia/reportes"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={MUTED_STYLE}
        >
          <ArrowLeft className="h-4 w-4" />
          Reportes
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <ReportSheet
        snapshot={snapshot}
        eyebrow="Reporte interno"
        note={`Números congelados al ${formatDateTimeAr(snapshot.generatedAt)}${
          report.generatedBy ? ` · ${report.generatedBy.name}` : ''
        }. No cambian aunque las piezas sigan sumando vistas.`}
      />
    </div>
  );
}

const UNMATCHED_NOTE = (permalink: string | null) =>
  permalink ? 'La pieza todavía no apareció en el catálogo del agregador' : 'Sin link cargado: no se pudo medir';

function PieceTitle({ task }: { task: ReportSnapshot['tasks'][number] }) {
  return task.permalink ? (
    <a href={task.permalink} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
      {task.title}
    </a>
  ) : (
    <span className="font-medium">{task.title}</span>
  );
}

/** Cuerpo del reporte: lo comparten el reporte congelado (admin) y el link público en vivo. */
export function ReportSheet({
  snapshot,
  eyebrow,
  note,
}: {
  snapshot: ReportSnapshot;
  eyebrow: string;
  note: string;
}) {
  return (
    <>
      <header>
        <p
          className="text-xs font-medium uppercase tracking-[0.14em]"
          style={{ color: 'hsl(var(--admin-accent))' }}
        >
          {eyebrow}
        </p>
        <h1 className="font-admin mt-1 text-3xl font-semibold tracking-tight">
          {snapshot.client.name} · <span className="capitalize">{formatMonthLabel(snapshot.month)}</span>
        </h1>
        <p className="mt-1 text-sm" style={MUTED_STYLE}>
          {note}
        </p>
      </header>

      <div className="rounded-lg border p-4" style={ADMIN_SURFACE_STYLE}>
        <p className="text-sm font-medium">
          {snapshot.deliveredPieces} de {snapshot.committedPieces} piezas entregadas
        </p>
        <div className="mt-2">
          <ProgressBar done={snapshot.deliveredPieces} total={snapshot.committedPieces} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Piezas medidas" value={String(snapshot.totals.pieces)} />
        <StatCard label="Impresiones" value={formatMetric(snapshot.totals.impressions)} />
        <StatCard label="Interacciones" value={formatMetric(snapshot.totals.interactions)} />
        <StatCard label="Engagement" value={formatPercent(snapshot.totals.engagement)} />
      </div>

      {/* Mobile: tarjetas. Seis columnas en 360 px obligan a scrollear de costado. */}
      <ul className="space-y-2 md:hidden print:hidden">
        {snapshot.tasks.map((task, index) => (
          <li key={`${task.title}-${index}`} className="rounded-lg border p-3" style={ADMIN_SURFACE_STYLE}>
            <PieceTitle task={task} />
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm" style={MUTED_STYLE}>
              <NetworkBadge network={task.network} />
              <span>{task.format}</span>
              <span>· {task.completedAt ? formatDateAr(task.completedAt) : 'Sin entregar'}</span>
            </div>
            {task.metrics.matched ? (
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                {(
                  [
                    ['Impresiones', task.metrics.impressions],
                    ['Alcance', task.metrics.reach],
                    ['Interacciones', task.metrics.interactions],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs" style={MUTED_STYLE}>
                      {label}
                    </dt>
                    <dd className="font-medium tabular-nums">{formatMetric(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-xs" style={MUTED_STYLE}>
                {UNMATCHED_NOTE(task.permalink)}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border md:block print:block" style={ADMIN_SURFACE_STYLE}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pieza</TableHead>
              <TableHead>Red / formato</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="text-right">Impresiones</TableHead>
              <TableHead className="text-right">Alcance</TableHead>
              <TableHead className="text-right">Interacciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.tasks.map((task, index) => (
              <TableRow key={`${task.title}-${index}`}>
                <TableCell className="max-w-[260px]">
                  <p className="truncate">
                    <PieceTitle task={task} />
                  </p>
                  {task.assignee && (
                    <p className="text-xs" style={MUTED_STYLE}>
                      {task.assignee}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <NetworkBadge network={task.network} />
                    <span className="text-sm" style={MUTED_STYLE}>
                      {task.format}
                    </span>
                  </div>
                </TableCell>
                <TableCell style={MUTED_STYLE}>
                  {task.completedAt ? formatDateAr(task.completedAt) : 'Sin entregar'}
                </TableCell>
                {task.metrics.matched ? (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {formatMetric(task.metrics.impressions)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMetric(task.metrics.reach)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMetric(task.metrics.interactions)}
                    </TableCell>
                  </>
                ) : (
                  <TableCell colSpan={3} className="text-right text-xs" style={MUTED_STYLE}>
                    {UNMATCHED_NOTE(task.permalink)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
