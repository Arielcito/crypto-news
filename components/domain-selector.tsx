'use client';

import { useDomain } from '@/lib/use-domain';
import { setSelectedDomain, Domain } from '@/lib/domain-colors';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DomainSelector() {
  const { domain } = useDomain();

  if (typeof window === 'undefined' || window.location.hostname !== 'localhost') {
    return null;
  }

  const domains = [
    { id: 'bitcoinarg.news', label: 'BitcoinArg' },
    { id: 'tendenciascrypto.com', label: 'TendenciasCrypto' },
    { id: 'ultimahoracrypto.com', label: 'UltimaHoraCrypto' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-background p-2 rounded-lg shadow-lg border">
      {domains.map(({ id, label }) => (
        <Button
          key={id}
          variant={domain === id ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDomain(id as Domain)}
          className={cn(
            'transition-colors',
            domain === id && 'bg-primary text-primary-foreground'
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
} 