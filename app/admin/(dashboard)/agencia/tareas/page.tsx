import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TasksBoard } from '@/components/agencia/tasks-board';

export const dynamic = 'force-dynamic';

/** `?packageId=` llega desde la ficha del cliente para ver un mes en concreto. */
export default async function AgenciaTareasPage({
  searchParams,
}: {
  searchParams: { packageId?: string };
}) {
  const user = await requirePageUser();
  const packageId = Number(searchParams.packageId);

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Tareas" />
      <TasksBoard
        canManage={user.role === Role.ADMIN}
        initialPackageId={Number.isInteger(packageId) && packageId > 0 ? packageId : undefined}
      />
    </div>
  );
}
