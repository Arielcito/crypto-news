import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { MyTasks } from '@/components/agencia/my-tasks';

export const dynamic = 'force-dynamic';

export default async function AgenciaMisTareasPage() {
  const user = await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Mis tareas" />
      <MyTasks userId={user.id} />
    </div>
  );
}
