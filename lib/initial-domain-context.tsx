'use client';

import { createContext, useContext } from 'react';
import type { Domain } from './domain-colors';

const InitialDomainContext = createContext<Domain | null>(null);

export function InitialDomainProvider({
  value,
  children,
}: {
  value: Domain;
  children: React.ReactNode;
}) {
  return (
    <InitialDomainContext.Provider value={value}>
      {children}
    </InitialDomainContext.Provider>
  );
}

export function useInitialDomain(): Domain | null {
  return useContext(InitialDomainContext);
}
