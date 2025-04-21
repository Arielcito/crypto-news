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
        { key: 'bitcoin-finanzas', label: 'Bitcoin y Finanzas Personales', href: '/bitcoin-finanzas' },
        { key: 'economia-crisis', label: 'Economía y Crisis', href: '/economia-crisis' },
        { key: 'regulacion-politicas', label: 'Regulación y Políticas Cripto', href: '/regulacion-politicas' },
        { key: 'mercado-volatilidad', label: 'Mercado y Volatilidad', href: '/mercado-volatilidad' },
        { key: 'tecnologia-mineria', label: 'Tecnología y Minería', href: '/tecnologia-mineria' },
        { key: 'pagos-servicios', label: 'Pagos y Servicios en Cripto', href: '/pagos-servicios' },
        { key: 'geopolitica-actualidad', label: 'Geopolítica y Actualidad', href: '/geopolitica-actualidad' },
        { key: 'adopcion-comunidad', label: 'Adopción y Comunidad', href: '/adopcion-comunidad' }
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
        { key: 'innovacion-tecnologia', label: 'Innovación y Tecnología', href: '/innovacion-tecnologia' },
        { key: 'trading-inversiones', label: 'Trading e Inversiones', href: '/trading-inversiones' },
        { key: 'criptomonedas-blockchain', label: 'Criptomonedas y Blockchain', href: '/criptomonedas-blockchain' },
        { key: 'regulacion-politica', label: 'Regulación y Política Cripto', href: '/regulacion-politica' },
        { key: 'adopcion-comunidad', label: 'Adopción y Comunidad', href: '/adopcion-comunidad' },
        { key: 'descentralizacion-proyectos', label: 'Descentralización y Proyectos', href: '/descentralizacion-proyectos' },
        { key: 'crisis-riesgos', label: 'Crisis y Riesgos', href: '/crisis-riesgos' },
        { key: 'tendencias-globales', label: 'Tendencias Globales', href: '/tendencias-globales' }
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
        { key: 'mercados', label: 'Mercados', href: '/mercados' },
        { key: 'regulacion', label: 'Regulación', href: '/regulacion' },
        { key: 'tecnologia-blockchain', label: 'Tecnología Blockchain', href: '/tecnologia-blockchain' },
        { key: 'inversion-estrategia', label: 'Inversión y Estrategia', href: '/inversion-estrategia' },
        { key: 'economia-global', label: 'Economía Global', href: '/economia-global' },
        { key: 'mineria-seguridad', label: 'Minería y Seguridad', href: '/mineria-seguridad' },
        { key: 'tendencias-crisis', label: 'Tendencias y Crisis', href: '/tendencias-crisis' }
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
        { key: 'bitcoin-finanzas', label: 'Bitcoin y Finanzas Personales', href: '/bitcoin-finanzas' },
        { key: 'economia-crisis', label: 'Economía y Crisis', href: '/economia-crisis' },
        { key: 'regulacion-politicas', label: 'Regulación y Políticas Cripto', href: '/regulacion-politicas' },
        { key: 'mercado-volatilidad', label: 'Mercado y Volatilidad', href: '/mercado-volatilidad' },
        { key: 'tecnologia-mineria', label: 'Tecnología y Minería', href: '/tecnologia-mineria' },
        { key: 'pagos-servicios', label: 'Pagos y Servicios en Cripto', href: '/pagos-servicios' },
        { key: 'geopolitica-actualidad', label: 'Geopolítica y Actualidad', href: '/geopolitica-actualidad' },
        { key: 'adopcion-comunidad', label: 'Adopción y Comunidad', href: '/adopcion-comunidad' }
      ]
    }
  }
};

export function useDomain() {
  const [domain, setDomain] = useState<Domain>(() => {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV === 'development' ? 'localhost' : getCurrentDomain();
    }

    const cookieDomain = document.cookie
      .split('; ')
      .find(row => row.startsWith('selected_domain='))
      ?.split('=')[1] as Domain;

    if (cookieDomain) {
      return cookieDomain;
    }

    return process.env.NODE_ENV === 'development' ? 'localhost' : getCurrentDomain();
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