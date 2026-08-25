import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { requirePageUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * `/admin` no tiene contenido propio: manda a cada rol a donde puede trabajar.
 * Un empleado que entre acá no puede ver el panel de contenido.
 */
export default async function AdminIndexPage() {
  const user = await requirePageUser();
  redirect(user.role === Role.ADMIN ? '/admin/agencia' : '/admin/agencia/mis-tareas');
}
