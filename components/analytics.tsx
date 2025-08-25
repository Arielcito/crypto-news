'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useAnalytics } from '@/lib/use-analytics'

export function Analytics() {
  const { gaId, isConfigured, domain } = useAnalytics()
  
  // Solo renderizar en producción y si está configurado
  if (process.env.NODE_ENV !== 'production' || !isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Analytics disabled:', {
        env: process.env.NODE_ENV,
        configured: isConfigured,
        domain
      })
    }
    return null
  }
  
  console.log('📊 Loading Google Analytics for domain:', domain)
  
  return <GoogleAnalytics gaId={gaId} />
}