import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OrganicDashboard } from '@/components/agencia/organic-dashboard';

export const dynamic = 'force-dynamic';

/** `?clientId=` llega desde la ficha del cliente. */
export default async function AgenciaOrganicoPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const user = await requirePageUser();
  const clientId = Number(searchParams.clientId);

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Contenido orgánico" />
      <OrganicDashboard
        canManage={user.role === Role.ADMIN}
        initialClientId={Number.isInteger(clientId) && clientId > 0 ? clientId : undefined}
      />
    </div>
  );
}
