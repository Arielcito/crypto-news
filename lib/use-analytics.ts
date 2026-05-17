'use client';

import { useDomain } from './use-domain';

export function useAnalytics() {
  const { domain } = useDomain();
  const gaId = process.env.NEXT_PUBLIC_GA_ID_BITCOINARG || '';

  return {
    gaId,
    isConfigured: !!gaId,
    domain,
  };
}
