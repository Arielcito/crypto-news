'use client';

import { useDomain } from '@/lib/use-domain';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Domain } from '@/lib/domain-colors';

export function DomainSelector() {
  const { domain, setDomain } = useDomain();
  const router = useRouter();

  const handleDomainChange = (newDomain: string) => {
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
        variant={domain === 'tendenciascrypto.com' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleDomainChange('tendenciascrypto.com')}
      >
        Tendencias
      </Button>
      <Button
        variant={domain === 'ultimahoracrypto.com' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleDomainChange('ultimahoracrypto.com')}
      >
        Última Hora
      </Button>
    </div>
  );
} 