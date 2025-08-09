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
      email?: string;
      linkedin?: string;
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
      name: 'BITCOIN ARGENTINA',
      description: 'Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.',
      title: 'BITCOIN ARGENTINA | Noticias de Bitcoin y Criptomonedas en Argentina',
      ogImage: '/bitcoinarg/og-image.jpg',
      twitterHandle: '@bitcoinargnews',
      logo: '/bitcoinarg/logo.png',
      logoDark: '/bitcoinarg/logo.png',
      socialLinks: {
        telegram: 'https://t.me/bitcoinargentinacomunidad',
        instagram: 'https://instagram.com/bitcoin_argentina',
        tiktok: 'https://tiktok.com/@bitcoin_argentina',
        youtube: 'https://www.youtube.com/@bitcoinargentinaoficial',
        email: 'info@bitcoinargentinagroup.com',
        linkedin: 'https://www.linkedin.com/company/bitcoin-argentina-group/'
      },
      categories: [
        { key: 'bitcoin', label: 'Bitcoin', href: '/bitcoin' },
        { key: 'stablecoins', label: 'Stablecoins', href: '/stablecoins' },
        { key: 'regulacion', label: 'Regulación', href: '/regulacion' },
        { key: 'mercados', label: 'Mercados', href: '/mercados' },
        { key: 'adopcion', label: 'Adopción', href: '/adopcion' },
        { key: 'hackeo', label: 'Hackeo', href: '/hackeo' },
        { key: 'tokenizacion', label: 'Tokenización', href: '/tokenizacion' },
        { key: 'geopolitica', label: 'Geopolítica', href: '/geopolitica' }
      ]
    }
  },
  'tendenciascripto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: true,
    isUltimaHoraCrypto: false,
    site: {
      domain: 'tendenciascrypto.com',
      name: 'TENDENCIAS CRIPTO',
      description: 'Análisis profundo y tendencias del mercado de criptomonedas en Latinoamérica.',
      title: 'TENDENCIAS CRIPTO | Análisis y Tendencias del Mercado Cripto',
      ogImage: '/tendenciascrypto/og-image.jpg',
      twitterHandle: '@tendenciascrypto',
      logo: '/tendenciascrypto/logo.png',
      logoDark: '/tendenciascrypto/logo.png',
      socialLinks: {
        telegram: 'https://t.me/bitcoinargentinacomunidad',
        linkedin: 'https://www.linkedin.com/company/bitcoin-argentina-group/',
        email: 'info@bitcoinargentinagroup.com'
      },
      categories: [
        { key: 'ethereum', label: 'Ethereum', href: '/ethereum' },
        { key: 'solana', label: 'Solana', href: '/solana' },
        { key: 'defi', label: 'DeFi', href: '/defi' },
        { key: 'tokenizacion', label: 'Tokenización', href: '/tokenizacion' },
        { key: 'nft', label: 'NFT', href: '/nft' },
        { key: 'regulacion', label: 'Regulación', href: '/regulacion' },
        { key: 'innovacion', label: 'Innovación', href: '/innovacion' },
        { key: 'adopcion', label: 'Adopción', href: '/adopcion' }
      ]
    }
  },
  'ultimahoracripto.com': {
    isBitcoinArg: false,
    isTendenciasCrypto: false,
    isUltimaHoraCrypto: true,
    site: {
      domain: 'ultimahoracripto.com',
      name: 'ULTIMA HORA CRIPTO',
      description: 'Noticias de última hora sobre criptomonedas y blockchain en Latinoamérica.',
      title: 'ULTIMA HORA CRIPTO | Noticias Cripto en Tiempo Real',
      ogImage: '/ultimahoracrypto/og-image.jpg',
      twitterHandle: '@ultimahoracrypto',
      logo: '/ultimahoracrypto/logo.png',
      logoDark: '/ultimahoracrypto/logo-dark.png',
      socialLinks: {
        telegram: 'https://t.me/bitcoinargentinacomunidad',
        linkedin: 'https://www.linkedin.com/company/bitcoin-argentina-group/',
        email: 'info@bitcoinargentinagroup.com'
      },
      categories: [
        { key: 'bitcoin', label: 'Bitcoin', href: '/bitcoin' },
        { key: 'altcoins', label: 'Altcoins', href: '/altcoins' },
        { key: 'regulacion', label: 'Regulación', href: '/regulacion' },
        { key: 'politica', label: 'Política', href: '/politica' },
        { key: 'crimen', label: 'Crimen', href: '/crimen' },
        { key: 'mercados', label: 'Mercados', href: '/mercados' },
        { key: 'economia', label: 'Economía', href: '/economia' },
        { key: 'empresas', label: 'Empresas', href: '/empresas' }
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
        telegram: 'https://t.me/bitcoinargentinacomunidad',
        instagram: 'https://instagram.com/bitcoin_argentina',
        tiktok: 'https://tiktok.com/@bitcoin_argentina',
        youtube: 'https://www.youtube.com/@bitcoinargentinaoficial',
        email: 'info@bitcoinargentinagroup.com',
        linkedin: 'https://www.linkedin.com/company/bitcoin-argentina-group/'
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