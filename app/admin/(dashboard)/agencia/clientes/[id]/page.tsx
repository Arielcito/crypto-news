import { notFound } from 'next/navigation';
import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { ClientDetail } from '@/components/agencia/client-detail';

export const dynamic = 'force-dynamic';

export default async function AgenciaClienteDetailPage({ params }: { params: { id: string } }) {
  const user = await requirePageUser();
  const clientId = Number(params.id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  return <ClientDetail clientId={clientId} canManage={user.role === Role.ADMIN} />;
}
