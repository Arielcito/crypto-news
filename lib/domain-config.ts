import { Domain, getCurrentDomain } from './domain-colors';

export function getDomainConfig() {
  const domain = getCurrentDomain();
  return {
    domain,
    site: {
      domain: domain,
      name: 'BITCOINARG.news',
      description: 'Noticias de Argentina y LATAM. Cobertura de eventos, regulaciones y adopción cripto en Argentina y Latinoamérica.',
      title: 'BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina',
      ogImage: '/og-bitcoinarg.jpg',
      twitterHandle: '@bitcoinargnews',
      logo: '/bitcoinarg/logo.png',
      socialLinks: {
        twitter: 'https://twitter.com/bitcoinargnews',
        telegram: 'https://t.me/bitcoinargnews',
        discord: 'https://discord.gg/bitcoinarg',
      },
      categories: [
        { key: 'regulaciones', label: 'Regulaciones', href: '/regulaciones' },
        { key: 'adopcion', label: 'Adopción', href: '/adopcion' },
        { key: 'empresas', label: 'Empresas', href: '/empresas' },
        { key: 'fraudes', label: 'Fraudes', href: '/fraudes' },
      ],
    }
  };
} 