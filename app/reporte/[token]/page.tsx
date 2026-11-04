import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { buildSnapshot } from '@/lib/agency/reports';
import { verifyReportToken } from '@/lib/agency/report-link';
import { formatDateTimeAr, formatMonthKey, formatMonthLabel } from '@/lib/agency/dates';
import { ReportSheet } from '@/components/agencia/report-view';

export const dynamic = 'force-dynamic';

/**
 * Reporte en vivo de un cliente, sin login: el token firmado es la credencial.
 * A diferencia del reporte interno, se recalcula en cada visita.
 */
export default async function ReportePublicoPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { mes?: string };
}) {
  const clientId = verifyReportToken(params.token);
  if (!clientId) {
    console.warn('[reporte-publico] token inválido');
    notFound();
  }

  const packages = await prisma.package.findMany({
    // Un cliente archivado (isActive=false) deja de tener link: el reporte cae con él.
    where: { clientId, client: { isActive: true } },
    select: { id: true, month: true },
    orderBy: { month: 'desc' },
  });
  if (packages.length === 0) notFound();

  const requested = /^\d{4}-\d{2}$/.test(searchParams.mes ?? '') ? searchParams.mes : undefined;
  const pkg = packages.find((entry) => formatMonthKey(entry.month) === requested) ?? packages[0];

  const snapshot = await buildSnapshot(pkg.id);
  if (!snapshot) notFound();
  console.info('[reporte-publico] servido', { clientId, month: snapshot.month });

  // Los responsables son internos de la agencia: el cliente no los ve.
  const shared = { ...snapshot, tasks: snapshot.tasks.map((task) => ({ ...task, assignee: null })) };

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 md:px-10 md:py-12">
      {packages.length > 1 && (
        <nav aria-label="Meses" className="flex flex-wrap gap-2">
          {packages.map((entry) => {
            const key = formatMonthKey(entry.month);
            const active = entry.id === pkg.id;
            return (
              <Link
                key={entry.id}
                href={`?mes=${key}`}
                aria-current={active ? 'page' : undefined}
                className="rounded-full border px-3 py-1.5 text-sm capitalize transition-colors duration-150 ease-out"
                style={
                  active
                    ? { backgroundColor: 'hsl(var(--admin-accent))', borderColor: 'transparent', color: 'white' }
                    : { borderColor: 'hsl(var(--admin-surface-border))' }
                }
              >
                {formatMonthLabel(entry.month)}
              </Link>
            );
          })}
        </nav>
      )}
      <ReportSheet
        snapshot={shared}
        eyebrow="Reporte en vivo"
        note={`Actualizado al ${formatDateTimeAr(snapshot.generatedAt)}. Los números siguen sumando mientras las piezas circulan.`}
      />
    </main>
  );
}
