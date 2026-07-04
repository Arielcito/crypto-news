'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, FolderTree, LogOut, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
    <aside className="flex h-full w-full flex-col justify-between border-r bg-background p-4 md:w-56">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" className="justify-start gap-3" onClick={handleLogout} disabled={isPending}>
        <LogOut className="h-4 w-4" />
        {isPending ? 'Saliendo...' : 'Cerrar sesión'}
      </Button>
    </aside>
  );
}
