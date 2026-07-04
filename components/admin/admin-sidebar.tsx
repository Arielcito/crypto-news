'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, FolderTree, LogOut, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAdminLogout } from '@/lib/use-admin-auth';

const navItems = [
  { href: '/admin/posts', label: 'Notas', icon: FileText },
  { href: '/admin/categories', label: 'Categorías', icon: FolderTree },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout, isPending } = useAdminLogout();

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
        className="admin-sidebar-scroll sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between overflow-y-auto md:flex"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          color: 'hsl(var(--admin-sidebar-foreground))',
          borderRight: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        <div>
          <div className="px-6 pb-6 pt-8">
            <div className="flex items-center gap-2">
              <Image src="/bitcoinarg/logo.png" alt="bitcoinarg" width={28} height={28} className="shrink-0" />
              <span
                className="font-admin text-lg font-semibold tracking-tight"
                style={{ color: 'hsl(var(--admin-sidebar-foreground))' }}
              >
                bitcoinarg
              </span>
              <span className="text-lg font-semibold" style={{ color: 'hsl(var(--admin-accent))' }}>
                .admin
              </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'hsl(var(--admin-sidebar-muted))' }}>
              Panel de contenido
            </p>
          </div>

          <nav className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    borderColor: isActive ? 'hsl(var(--admin-accent))' : 'transparent',
                    backgroundColor: isActive ? 'hsl(var(--admin-sidebar-active-bg))' : 'transparent',
                    color: isActive
                      ? 'hsl(var(--admin-sidebar-foreground))'
                      : 'hsl(var(--admin-sidebar-muted))',
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 pb-6" style={{ borderTop: '1px solid hsl(var(--admin-sidebar-border))' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{ color: 'hsl(var(--admin-sidebar-muted))' }}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Mobile: slim top bar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          color: 'hsl(var(--admin-sidebar-foreground))',
          borderBottom: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        <span className="flex items-center gap-2 font-admin text-base font-semibold">
          <Image src="/bitcoinarg/logo.png" alt="bitcoinarg" width={22} height={22} className="shrink-0" />
          bitcoinarg<span style={{ color: 'hsl(var(--admin-accent))' }}>.admin</span>
        </span>
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
      </header>
      <nav
        className="sticky top-[49px] z-20 flex gap-1 overflow-x-auto px-3 py-2 md:hidden"
        style={{
          backgroundColor: 'hsl(var(--admin-sidebar-bg))',
          borderBottom: '1px solid hsl(var(--admin-sidebar-border))',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors'
              )}
              style={{
                backgroundColor: isActive ? 'hsl(var(--admin-accent) / 0.15)' : 'transparent',
                color: isActive ? 'hsl(var(--admin-accent))' : 'hsl(var(--admin-sidebar-muted))',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
