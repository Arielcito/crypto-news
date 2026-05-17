'use client';

import { useEffect, useState } from 'react';
import { Domain, getCurrentDomain, getCurrentPalette, setSelectedDomain } from './domain-colors';
import { useInitialDomain } from './initial-domain-context';

interface DomainConfig {
  domain: Domain;
  isBitcoinArg: boolean;
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

const bitcoinArgConfig: Omit<DomainConfig, 'domain' | 'colors'> = {
  isBitcoinArg: true,
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
      email: 'info@bitcoinarg.news',
      linkedin: 'https://www.linkedin.com/company/bitcoin-argentina-group/',
    },
    categories: [
      { key: 'bitcoin', label: 'Bitcoin', href: '/bitcoin' },
      { key: 'stablecoins', label: 'Stablecoins', href: '/stablecoins' },
      { key: 'regulacion', label: 'Regulación', href: '/regulacion' },
      { key: 'mercados', label: 'Mercados', href: '/mercados' },
      { key: 'adopcion', label: 'Adopción', href: '/adopcion' },
      { key: 'hackeo', label: 'Hackeo', href: '/hackeo' },
      { key: 'tokenizacion', label: 'Tokenización', href: '/tokenizacion' },
      { key: 'geopolitica', label: 'Geopolítica', href: '/geopolitica' },
    ],
  },
};

export const domainConfigs: Record<Domain, Omit<DomainConfig, 'domain' | 'colors'>> = {
  'bitcoinarg.news': bitcoinArgConfig,
  'localhost': {
    ...bitcoinArgConfig,
    site: { ...bitcoinArgConfig.site, domain: 'localhost' },
  },
};

export function useDomain() {
  const initialDomain = useInitialDomain();

  const [domain, setDomain] = useState<Domain>(() => {
    if (initialDomain) {
      return initialDomain;
    }

    if (typeof window === 'undefined') {
      return 'localhost';
    }

    const cookieDomain = document.cookie
      .split('; ')
      .find((row) => row.startsWith('selected_domain='))
      ?.split('=')[1] as Domain;

    if (cookieDomain === 'bitcoinarg.news' || cookieDomain === 'localhost') {
      return cookieDomain;
    }

    return getCurrentDomain();
  });

  const colors = getCurrentPalette(domain);
  const config = domainConfigs[domain];

  useEffect(() => {
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
      domain,
    },
  };
}
