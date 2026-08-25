import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AgencyOverview } from '@/components/agencia/agency-overview';

export const dynamic = 'force-dynamic';

export default async function AgenciaPage() {
  const user = await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title={`Hola, ${user.name.split(' ')[0]}`} />
      <AgencyOverview />
    </div>
  );
}
