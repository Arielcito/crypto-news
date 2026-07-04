import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <div className="admin-shell flex min-h-screen">
      <div
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{ backgroundColor: 'hsl(var(--admin-sidebar-bg))', color: 'hsl(var(--admin-sidebar-foreground))' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: 'hsl(var(--admin-accent))' }}
        />
        <span className="font-admin relative text-lg font-semibold tracking-tight">
          bitcoinarg<span style={{ color: 'hsl(var(--admin-accent))' }}>.admin</span>
        </span>
        <div className="relative">
          <p className="font-admin text-3xl font-medium leading-snug">
            Todo el contenido de bitcoinarg.news, en un solo lugar.
          </p>
          <p className="mt-4 max-w-sm text-sm" style={{ color: 'hsl(var(--admin-sidebar-muted))' }}>
            Notas, categorías y tags — publicá y editá sin salir del panel.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-admin text-lg font-semibold tracking-tight">
              bitcoinarg<span style={{ color: 'hsl(var(--admin-accent))' }}>.admin</span>
            </span>
          </div>
          <h1 className="font-admin text-2xl font-semibold tracking-tight">Ingresar</h1>
          <p className="mt-1 text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
            Usá tus credenciales de administrador.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
