'use client';

import { useEffect, useState } from 'react';
import { Domain, getCurrentDomain, getCurrentPalette, setSelectedDomain } from './domain-colors';

interface DomainConfig {
  domain: Domain;
  isBitcoinArg: boolean;
  isTendenciasCrypto: boolean;
  isUltimaHoraCrypto: boolean;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  site: {
    domain: string; 
    name: string;
    description: string;
    title: string;
    ogImage: string;
    twitterHandle: string;
    logo: string;
    logoDark: string;
    socialLinks: {
      telegram: string;
      twitter?: string;
      discord?: string;
      instagram?: string;
      tiktok?: string;
      youtube?: string;
    };
    categories: {
      key: string;
      label: string;
      href: string;
    }[];
  };
}

export const domainConfigs: Record<Domain, Omit<DomainConfig, 'domain' | 'colors'>> = {
  'bitcoinarg.news': {
    isBitcoinArg: true,
    isTendenciasCrypto: false,
    isUltimaHoraCrypto: false,
    site: {
      domain: 'bitcoinarg.news',
      name: 'BITCOINARG.news',
      description: 'Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.',
      title: 'BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina',
      ogImage: '/bitcoinarg/og-image.jpg',
      twitterHandle: '@bitcoinargnews',
      logo: '/bitcoinarg/logo.png',
      logoDark: '/bitcoinarg/logo.png',
      socialLinks: {
        telegram: 'https://t.me/bitcoinargnews',
        twitter: 'https://twitter.com/bitcoinargnews',
        instagram: 'https://instagram.com/bitcoinargnews',
        tiktok: 'https://tiktok.com/@bitcoinargnews',
        youtube: 'https://youtube.com/@bitcoinargnews'
      },
      categories: [
        { key: 'noticias', label: 'Noticias', href: '/noticias' },
        { key: 'analisis', label: 'Análisis', href: '/analisis' },
        { key: 'educacion', label: 'Educación', href: '/educacion' }
      ]
    }
  },
  'tendenciascrypto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: true,
    isUltimaHoraCrypto: false,
    site: {
      domain: 'tendenciascrypto.com',
      name: 'TENDENCIASCRIPTO',
      description: 'Análisis profundo y tendencias del mercado de criptomonedas en Latinoamérica.',
      title: 'TENDENCIASCRIPTO.com | Análisis y Tendencias del Mercado Cripto',
      ogImage: '/tendenciascrypto/og-image.jpg',
      twitterHandle: '@tendenciascrypto',
      logo: '/tendenciascrypto/logo.png',
      logoDark: '/tendenciascrypto/logo.png',
      socialLinks: {
        telegram: 'https://t.me/tendenciascrypto'
      },
      categories: [
        { key: 'tendencias', label: 'Tendencias', href: '/tendencias' },
        { key: 'analisis', label: 'Análisis', href: '/analisis' },
        { key: 'mercado', label: 'Mercado', href: '/mercado' }
      ]
    }
  },
  'tendenciascripto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: true,
    isUltimaHoraCrypto: false,
    site: {
      domain: 'tendenciascrypto.com',
      name: 'TENDENCIASCRIPTO',
      description: 'Análisis profundo y tendencias del mercado de criptomonedas en Latinoamérica.',
      title: 'TENDENCIASCRIPTO.com | Análisis y Tendencias del Mercado Cripto',
      ogImage: '/tendenciascrypto/og-image.jpg',
      twitterHandle: '@tendenciascrypto',
      logo: '/tendenciascrypto/logo.png',
      logoDark: '/tendenciascrypto/logo.png',
      socialLinks: {
        telegram: 'https://t.me/tendenciascrypto'
      },
      categories: [
        { key: 'tendencias', label: 'Tendencias', href: '/tendencias' },
        { key: 'analisis', label: 'Análisis', href: '/analisis' },
        { key: 'mercado', label: 'Mercado', href: '/mercado' }
      ]
    }
  },
  'ultimahoracrypto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: false,
    isUltimaHoraCrypto: true,
    site: {
      domain: 'ultimahoracrypto.com',
      name: 'Ultima Hora Cripto',
      description: 'Noticias de última hora sobre criptomonedas y blockchain en Latinoamérica.',
      title: 'ULTIMAHORACRIPTO.com | Noticias Cripto en Tiempo Real',
      ogImage: '/ultimahoracrypto/og-image.jpg',
      twitterHandle: '@ultimahoracrypto',
      logo: '/ultimahoracrypto/logo.png',
      logoDark: '/ultimahoracrypto/logo-dark.png',
      socialLinks: {
        telegram: 'https://t.me/ultimahoracrypto'
      },
      categories: [
        { key: 'ultimahora', label: 'Última Hora', href: '/ultimahora' },
        { key: 'noticias', label: 'Noticias', href: '/noticias' },
        { key: 'alertas', label: 'Alertas', href: '/alertas' }
      ]
    }
  },
  'ultimahoracripto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: false,
    isUltimaHoraCrypto: true,
    site: {
      domain: 'ultimahoracripto.com',
      name: 'ULTIMAHORACRIPTO',
      description: 'Noticias de última hora sobre criptomonedas y blockchain en Latinoamérica.',
      title: 'ULTIMAHORACRIPTO.com | Noticias Cripto en Tiempo Real',
      ogImage: '/ultimahoracrypto/og-image.jpg',
      twitterHandle: '@ultimahoracrypto',
      logo: '/ultimahoracrypto/logo.png',
      logoDark: '/ultimahoracrypto/logo-dark.png',
      socialLinks: {
        telegram: 'https://t.me/ultimahoracrypto'
      },
      categories: [
        { key: 'ultimahora', label: 'Última Hora', href: '/ultimahora' },
        { key: 'noticias', label: 'Noticias', href: '/noticias' },
        { key: 'alertas', label: 'Alertas', href: '/alertas' }
      ]
    }
  },
  'localhost': {
    isBitcoinArg: true,
    isTendenciasCrypto: false,
    isUltimaHoraCrypto: false,
    site: {
      domain: 'localhost',      
      name: 'BITCOINARG',
      description: 'Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.',
      title: 'BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina',
      ogImage: '/bitcoinarg/og-image.jpg',
      twitterHandle: '@bitcoinargnews',
      logo: '/bitcoinarg/logo.png',
      logoDark: '/bitcoinarg/logo.png',
      socialLinks: {
        telegram: 'https://t.me/bitcoinargnews',
        twitter: 'https://twitter.com/bitcoinargnews',
        instagram: 'https://instagram.com/bitcoinargnews',
        tiktok: 'https://tiktok.com/@bitcoinargnews',
        youtube: 'https://youtube.com/@bitcoinargnews'
      },
      categories: [
        { key: 'noticias', label: 'Noticias', href: '/noticias' },
        { key: 'analisis', label: 'Análisis', href: '/analisis' },
        { key: 'educacion', label: 'Educación', href: '/educacion' }
      ]
    }
  }
};

export function useDomain() {
  const [domain, setDomain] = useState<Domain>(() => {
    // Check cookie first
    const cookieDomain = document.cookie
      .split('; ')
      .find(row => row.startsWith('selected_domain='))
      ?.split('=')[1] as Domain;

    if (cookieDomain) {
      return cookieDomain;
    }

    // In development, always start with localhost
    if (process.env.NODE_ENV === 'development') {
      return 'localhost';
    }

    return getCurrentDomain();
  });

  const colors = getCurrentPalette(domain);
  const config = domainConfigs[domain];

  useEffect(() => {
    // Listen for domain changes from other components
    const handleDomainChange = () => {
      const newDomain = getCurrentDomain();
      if (newDomain !== domain) {
        setDomain(newDomain);
      }
    };

    window.addEventListener('domain-changed', handleDomainChange);
    return () => window.removeEventListener('domain-changed', handleDomainChange);
  }, [domain]);

  const handleSetDomain = (newDomain: Domain) => {
    if (newDomain === domain) return;
    
    setDomain(newDomain);
    setSelectedDomain(newDomain);
    window.dispatchEvent(new Event('domain-changed'));
  };

  return {
    domain,
    setDomain: handleSetDomain,
    ...config,
    colors,
    site: {
      ...config.site,
      domain
    }
  };
} 