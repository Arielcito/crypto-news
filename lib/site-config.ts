import { Domain } from './domain-colors';

interface SiteConfig {
  name: string;
  description: string;
  title: string;
  ogImage: string;
  twitterHandle: string;
  socialLinks: {
    twitter: string;
    telegram: string;
    discord: string;
  };
  categories: {
    key: string;
    label: string;
    href: string;
  }[];
}

export const siteConfigs: Record<Domain, SiteConfig> = {
  'bitcoinarg.news': {
    name: 'BITCOINARG.news',
    description: 'Noticias de Argentina y LATAM. Cobertura de eventos, regulaciones y adopción cripto en Argentina y Latinoamérica.',
    title: 'BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina',
    ogImage: '/og-bitcoinarg.jpg',
    twitterHandle: '@bitcoinargnews',
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
  },
  'tendenciascrypto.com': {
    name: 'TENDENCIASCRIPTO.com',
    description: 'Análisis profundo y tendencias del mercado de criptomonedas en Latinoamérica.',
    title: 'TENDENCIASCRIPTO.com | Análisis y Tendencias del Mercado Cripto',
    ogImage: '/og-tendenciascrypto.jpg',
    twitterHandle: '@tendenciascrypto',
    socialLinks: {
      twitter: 'https://twitter.com/tendenciascrypto',
      telegram: 'https://t.me/tendenciascrypto',
      discord: 'https://discord.gg/tendenciascrypto',
    },
    categories: [
      { key: 'blockchain', label: 'Blockchain', href: '/blockchain' },
      { key: 'defi', label: 'DeFi', href: '/defi' },
      { key: 'web3', label: 'Web3', href: '/web3' },
      { key: 'nfts', label: 'NFTs', href: '/nfts' },
      { key: 'ia', label: 'IA', href: '/ia' },
    ],
  },
  'tendenciascripto.com': {
    name: 'TENDENCIASCRIPTO.com',
    description: 'Análisis profundo y tendencias del mercado de criptomonedas en Latinoamérica.',
    title: 'TENDENCIASCRIPTO.com | Análisis y Tendencias del Mercado Cripto',
    ogImage: '/og-tendenciascrypto.jpg',
    twitterHandle: '@tendenciascrypto',
    socialLinks: {
      twitter: 'https://twitter.com/tendenciascrypto',
      telegram: 'https://t.me/tendenciascrypto',
      discord: 'https://discord.gg/tendenciascrypto',
    },
    categories: [
      { key: 'blockchain', label: 'Blockchain', href: '/blockchain' },
      { key: 'defi', label: 'DeFi', href: '/defi' },
      { key: 'web3', label: 'Web3', href: '/web3' },
      { key: 'nfts', label: 'NFTs', href: '/nfts' },
      { key: 'ia', label: 'IA', href: '/ia' },
    ],
  },
  'ultimahoracrypto.com': {
    name: 'ULTIMAHORACRIPTO.com',
    description: 'Noticias de última hora sobre criptomonedas y blockchain en Latinoamérica.',
    title: 'ULTIMAHORACRIPTO.com | Noticias Cripto en Tiempo Real',
    ogImage: '/og-ultimahoracrypto.jpg',
    twitterHandle: '@ultimahoracrypto',
    socialLinks: {
      twitter: 'https://twitter.com/ultimahoracrypto',
      telegram: 'https://t.me/ultimahoracrypto',
      discord: 'https://discord.gg/ultimahoracrypto',
    },
    categories: [
      { key: 'actualizaciones', label: 'Actualizaciones', href: '/actualizaciones' },
      { key: 'macroeconomia', label: 'Macroeconomía', href: '/macroeconomia' },
      { key: 'politica', label: 'Política', href: '/politica' },
      { key: 'redes', label: 'Redes', href: '/redes' },
    ],
  },
  'localhost': {
    name: 'BITCOINARG.news',
    description: 'Noticias de Argentina y LATAM. Cobertura de eventos, regulaciones y adopción cripto en Argentina y Latinoamérica.',
    title: 'BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina',
    ogImage: '/og-bitcoinarg.jpg',
    twitterHandle: '@bitcoinargnews',
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
  },
}; 