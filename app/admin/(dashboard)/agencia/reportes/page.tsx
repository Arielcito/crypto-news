import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ReportsList } from '@/components/agencia/reports-list';

export const dynamic = 'force-dynamic';

export default async function AgenciaReportesPage() {
  const user = await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Reportes" />
      <ReportsList canManage={user.role === Role.ADMIN} />
    </div>
  );
}
