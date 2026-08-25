import Image from 'next/image';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { logo: 22, text: 'text-base' },
  md: { logo: 28, text: 'text-lg' },
} as const;

/**
 * Marca del panel. El isotipo es el mismo archivo que usa el sitio público:
 * si mañana cambia el logo, cambia en los dos lados a la vez.
 */
export function AdminWordmark({
  size = 'md',
  className,
  onSidebar = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  /** En el sidebar oscuro el texto va con su propia variable, no con la del panel. */
  onSidebar?: boolean;
}) {
  const { logo, text } = SIZES[size];

  return (
    <span className={cn('font-admin flex items-center gap-2 font-semibold tracking-tight', text, className)}>
      <Image
        src="/bitcoinarg/logo.png"
        alt=""
        width={logo}
        height={logo}
        className="shrink-0"
        priority
      />
      <span style={onSidebar ? { color: 'hsl(var(--admin-sidebar-foreground))' } : undefined}>
        bitcoinarg
      </span>
      <span className="-ml-2" style={{ color: 'hsl(var(--admin-accent))' }}>
        .admin
      </span>
    </span>
  );
}
