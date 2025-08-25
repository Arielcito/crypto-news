'use client'

import { useDomain } from './use-domain'
import { Domain } from './domain-colors'

// IDs de Google Analytics para cada dominio
const GA_IDS: Record<Domain, string> = {
  'bitcoinarg.news': process.env.NEXT_PUBLIC_GA_ID_BITCOINARG || '',
  'tendenciascripto.com': process.env.NEXT_PUBLIC_GA_ID_TENDENCIAS || '',
  'ultimahoracripto.com': process.env.NEXT_PUBLIC_GA_ID_ULTIMAHORA || '',
  'localhost': process.env.NEXT_PUBLIC_GA_ID_BITCOINARG || '', // Fallback para desarrollo
}

export function useAnalytics() {
  const { domain } = useDomain()
  
  const gaId = GA_IDS[domain] || GA_IDS['localhost']
  
  console.log('📊 Analytics configuration:', {
    domain,
    gaId: gaId ? `${gaId.substring(0, 6)}...` : 'not configured',
    timestamp: new Date().toISOString()
  })
  
  return {
    gaId,
    isConfigured: !!gaId,
    domain
  }
}