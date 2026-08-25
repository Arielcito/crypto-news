import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ClientsList } from '@/components/agencia/clients-list';

export const dynamic = 'force-dynamic';

export default async function AgenciaClientesPage() {
  const user = await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Clientes" />
      <ClientsList canManage={user.role === Role.ADMIN} />
    </div>
  );
}
