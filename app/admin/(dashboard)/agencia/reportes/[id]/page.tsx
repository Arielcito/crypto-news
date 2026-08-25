import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/admin-auth';
import { ReportView } from '@/components/agencia/report-view';

export const dynamic = 'force-dynamic';

export default async function AgenciaReporteDetailPage({ params }: { params: { id: string } }) {
  await requirePageUser();
  const reportId = Number(params.id);
  if (!Number.isInteger(reportId) || reportId <= 0) notFound();

  return <ReportView reportId={reportId} />;
}
