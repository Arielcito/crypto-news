'use client';

import { useEffect, useState, useTransition, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CheckSquare,
  FileBarChart,
  FileText,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminWordmark } from '@/components/admin/admin-wordmark';
import { useAdminLogout, useCurrentUser } from '@/lib/use-admin-auth';
import { ROLE_LABELS } from '@/lib/types/agency';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** El resumen vive en el prefijo de todas las demás: sólo marca si coincide entero. */
  exact?: boolean;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Agencia',
    items: [
      { href: '/admin/agencia', label: 'Resumen', icon: LayoutDashboard, exact: true },
      { href: '/admin/agencia/mis-tareas', label: 'Mis tareas', icon: CheckSquare },
      { href: '/admin/agencia/tareas', label: 'Tareas', icon: ListChecks },
      { href: '/admin/agencia/clientes', label: 'Clientes', icon: Building2 },
      { href: '/admin/agencia/organico', label: 'Orgánico', icon: BarChart3 },
      { href: '/admin/agencia/reportes', label: 'Reportes', icon: FileBarChart },
      { href: '/admin/agencia/equipo', label: 'Equipo', icon: Users, adminOnly: true },
    ],
  },
  {
    label: 'Contenido',
    adminOnly: true,
    items: [
      { href: '/admin/posts', label: 'Notas', icon: FileText },
      { href: '/admin/categories', label: 'Categorías', icon: FolderTree },
      { href: '/admin/tags', label: 'Tags', icon: Tags },
    ],
  },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/**
 * El menú se arma con el rol que devuelve el servidor, no con el de la cookie.
 * Esconder un link no autoriza nada — el middleware y cada endpoint vuelven a
 * chequear —, pero evita mostrarle a un empleado puertas que no puede abrir.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout, isPending } = useAdminLogout();
  /*
   * El menú se pinta contra el destino, no contra la URL actual: las páginas son
   * `force-dynamic` y hasta que el servidor no contesta el RSC, `usePathname()`
   * sigue devolviendo la anterior. Sin esto el click no se ve hasta que carga.
   */
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const { data: me } = useCurrentUser();
  const user = me?.data ?? null;
  const isAdmin = user?.role === 'ADMIN';

  // Llegamos: se suelta el destino optimista y manda la URL real.
  useEffect(() => setPendingHref(null), [pathname]);

  const targetPath = pendingHref ?? pathname;

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    // Cmd/Ctrl/Shift o botón del medio: es "abrir en otra pestaña", no navegar.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (href === pathname) return;
    setPendingHref(href);
    startNavigation(() => router.push(href));
  };

  const groups = NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || isAdmin),
  }));

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success('Sesión cerrada');
        router.push('/admin/login');
        router.refresh();
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al cerrar sesión'),
    });
  };

  return (
    <>
      {/* Desktop: fixed vertical panel */}
      <aside
        className="admin-sidebar-scroll print-hide sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between overflow-y-auto md:flex"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          color: 'hsl(var(--admin-sidebar-foreground))',
          borderRight: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        <div>
          <div className="px-6 pb-6 pt-8">
            <AdminWordmark onSidebar />
            <p className="mt-1 text-xs" style={{ color: 'hsl(var(--admin-sidebar-muted))' }}>
              {user ? `${user.name} · ${ROLE_LABELS[user.role]}` : 'Panel interno'}
            </p>
          </div>

          <nav className="space-y-6 px-3">
            {groups.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <p
                  className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
                >
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const active = isActive(targetPath, item);
                  const loading = isNavigating && pendingHref === item.href;
                  const Icon = loading ? Loader2 : item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(event) => navigate(event, item.href)}
                      aria-current={active ? 'page' : undefined}
                      aria-busy={loading || undefined}
                      className="flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        borderColor: active ? 'hsl(var(--admin-accent))' : 'transparent',
                        backgroundColor: active ? 'hsl(var(--admin-sidebar-active-bg))' : 'transparent',
                        color: active
                          ? 'hsl(var(--admin-sidebar-foreground))'
                          : 'hsl(var(--admin-sidebar-muted))',
                      }}
                    >
                      <Icon
                        className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                        strokeWidth={2}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="px-3 pb-6" style={{ borderTop: '1px solid hsl(var(--admin-sidebar-border))' }}>
          <Link
            href="/admin/cambiar-password"
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
          >
            <KeyRound className="h-4 w-4" />
            Contraseña
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Mobile: slim top bar */}
      <header
        className="print-hide sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          color: 'hsl(var(--admin-sidebar-foreground))',
          borderBottom: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        <AdminWordmark size="sm" onSidebar />
        <div className="flex items-center gap-1">
          <Link
            href="/admin/cambiar-password"
            className="rounded-md p-2"
            style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
            aria-label="Cambiar contraseña"
          >
            <KeyRound className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="rounded-md p-2 disabled:opacity-50"
            style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <nav
        className="print-hide sticky top-[49px] z-20 flex gap-1 overflow-x-auto px-3 py-2 md:hidden"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          borderBottom: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        {groups.flatMap((group) => group.items).map((item) => {
          const active = isActive(targetPath, item);
          const loading = isNavigating && pendingHref === item.href;
          const Icon = loading ? Loader2 : item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => navigate(event, item.href)}
              aria-current={active ? 'page' : undefined}
              aria-busy={loading || undefined}
              className="flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: active ? 'hsl(var(--admin-accent) / 0.15)' : 'transparent',
                color: active ? 'hsl(var(--admin-accent))' : 'hsl(var(--admin-sidebar-muted))',
              }}
            >
              <Icon className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
