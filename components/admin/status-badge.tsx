interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isPublished = status === 'publish';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: isPublished ? 'hsl(var(--admin-positive-bg))' : 'hsl(var(--admin-neutral-bg))',
        color: isPublished ? 'hsl(var(--admin-positive))' : 'hsl(var(--admin-neutral))',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isPublished ? 'hsl(var(--admin-positive))' : 'hsl(var(--admin-neutral))' }}
      />
      {isPublished ? 'Publicado' : 'Borrador'}
    </span>
  );
}
