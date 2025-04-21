import { Domain } from './domain-colors';

export const domainConfigs = {
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
        { key: 'criptomonedas', label: 'Criptomonedas', href: '/criptomonedas' },
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
        { key: 'criptomonedas', label: 'Criptomonedas', href: '/criptomonedas' },
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
} as const;

export function getDomainConfig() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN as Domain || 'localhost';
  console.log('getDomainConfig: Environment domain:', process.env.NEXT_PUBLIC_DOMAIN);
  console.log('getDomainConfig: Selected domain:', domain);
  const config = domainConfigs[domain];
  console.log('getDomainConfig: Selected config:', config);
  return config;
} 