import { notFound } from 'next/navigation';
import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { ClientDetail } from '@/components/agencia/client-detail';
import { reportToken } from '@/lib/agency/report-link';

export const dynamic = 'force-dynamic';

export default async function AgenciaClienteDetailPage({ params }: { params: { id: string } }) {
  const user = await requirePageUser();
  const clientId = Number(params.id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  const canManage = user.role === Role.ADMIN;
  // El link expone métricas del cliente: sólo lo ven (y lo comparten) los admins.
  return (
    <ClientDetail
      clientId={clientId}
      canManage={canManage}
      reportPath={canManage ? `/reporte/${reportToken(clientId)}` : undefined}
    />
  );
}
