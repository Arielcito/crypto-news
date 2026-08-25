import { AdminWordmark } from '@/components/admin/admin-wordmark';
import { ChangePasswordForm } from '@/components/admin/change-password-form';
import { requirePageUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * La ruta está fuera del gate del middleware para que una sesión con
 * `mustChangePassword` no rebote en loop. Eso no la vuelve pública: sin sesión
 * se va al login igual, acá y en el endpoint.
 */
export default async function ChangePasswordPage() {
  // La única página que se puede ver con la temporal todavía vigente.
  await requirePageUser({ allowPendingPassword: true });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <AdminWordmark />
        <h1 className="font-admin mt-8 text-2xl font-semibold tracking-tight">Cambiar contraseña</h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
          Elegí una nueva de al menos 8 caracteres. La temporal deja de servir.
        </p>
        <div className="mt-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
