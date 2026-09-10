import { requirePageUser } from '@/lib/admin-auth';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ExpensesDashboard } from '@/components/agencia/expenses-dashboard';

export const dynamic = 'force-dynamic';

/** Sólo admins: el middleware ya bloquea esta ruta para empleados. */
export default async function AgenciaGastosPage() {
  await requirePageUser();

  return (
    <div>
      <AdminPageHeader eyebrow="Agencia" title="Gastos de IA" />
      <ExpensesDashboard />
    </div>
  );
}
