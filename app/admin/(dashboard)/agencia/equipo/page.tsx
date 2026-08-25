import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TeamList } from '@/components/agencia/team-list';

export const dynamic = 'force-dynamic';

/** Sólo admins: el middleware ya bloquea esta ruta para empleados. */
export default async function AgenciaEquipoPage() {
  const user = await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Equipo" />
      <TeamList currentUserId={user.id} />
    </div>
  );
}
