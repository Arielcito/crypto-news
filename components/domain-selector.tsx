'use client';

import { useDomain } from '@/lib/use-domain';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Domain } from '@/lib/domain-colors';

export function DomainSelector() {
  const { domain, setDomain } = useDomain();
  const router = useRouter();

  const handleDomainChange = (newDomain: string) => {
    if (newDomain === domain) return;
    
    setDomain(newDomain as Domain);
    router.refresh();
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <Button
        variant={domain === 'bitcoinarg.news' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleDomainChange('bitcoinarg.news')}
      >
        BitcoinArg
      </Button>
      <Button
        variant={domain === 'tendenciascripto.com' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleDomainChange('tendenciascripto.com')}
      >
        Tendencias
      </Button>
      <Button
        variant={domain === 'ultimahoracripto.com' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleDomainChange('ultimahoracripto.com')}
      >
        Última Hora
      </Button>
    </div>
  );
} 