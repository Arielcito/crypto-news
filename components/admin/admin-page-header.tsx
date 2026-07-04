import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}

export function AdminPageHeader({ eyebrow, title, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p
          className="text-xs font-medium uppercase tracking-[0.14em]"
          style={{ color: 'hsl(var(--admin-accent))' }}
        >
          {eyebrow}
        </p>
        <h1 className="font-admin mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}
