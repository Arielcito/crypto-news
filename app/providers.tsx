'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { InitialDomainProvider } from '@/lib/initial-domain-context';
import type { Domain } from '@/lib/domain-colors';

export function Providers({
  children,
  initialDomain,
}: {
  children: ReactNode;
  initialDomain: Domain;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <InitialDomainProvider value={initialDomain}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </InitialDomainProvider>
  );
}
