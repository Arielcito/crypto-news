import { Domain } from './domain-colors';
import { headers } from 'next/headers';

const bitcoinArgConfig = {
  isBitcoinArg: true,
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
      telegram: 'https://t.me/bitcoinargentinacomunidad',
      twitter: 'https://twitter.com/bitcoinargnews',
      instagram: 'https://instagram.com/bitcoinargnews',
      tiktok: 'https://tiktok.com/@bitcoinargnews',
      youtube: 'https://youtube.com/@bitcoinargnews',
    },
    categories: [
      { key: 'bitcoin-finanzas', label: 'Bitcoin y Finanzas Personales', href: '/bitcoin-finanzas' },
      { key: 'economia-crisis', label: 'Economía y Crisis', href: '/economia-crisis' },
      { key: 'regulacion-politicas', label: 'Regulación y Políticas Cripto', href: '/regulacion-politicas' },
      { key: 'mercado-volatilidad', label: 'Mercado y Volatilidad', href: '/mercado-volatilidad' },
      { key: 'tecnologia-mineria', label: 'Tecnología y Minería', href: '/tecnologia-mineria' },
      { key: 'pagos-servicios', label: 'Pagos y Servicios en Cripto', href: '/pagos-servicios' },
      { key: 'geopolitica-actualidad', label: 'Geopolítica y Actualidad', href: '/geopolitica-actualidad' },
      { key: 'adopcion-comunidad', label: 'Adopción y Comunidad', href: '/adopcion-comunidad' },
    ],
  },
} as const;

export const domainConfigs = {
  'bitcoinarg.news': bitcoinArgConfig,
  'localhost': { ...bitcoinArgConfig, site: { ...bitcoinArgConfig.site, domain: 'localhost' } },
} as const;

function detectDomainFromHeaders(): string | null {
  try {
    const headersList = headers();
    const host = headersList.get('host');
    const forwardedHost = headersList.get('x-forwarded-host');
    const detectedDomain = headersList.get('x-detected-domain');
    return detectedDomain || forwardedHost || host;
  } catch {
    return null;
  }
}

export function getDomainConfig() {
  const envDomain = process.env.NEXT_PUBLIC_DOMAIN as Domain;
  const headerDomain = detectDomainFromHeaders();

  let domain: Domain = 'bitcoinarg.news';

  if (envDomain && domainConfigs[envDomain]) {
    domain = envDomain;
  } else if (headerDomain) {
    const cleaned = headerDomain.replace(/^www\./, '').split(':')[0];
    if (cleaned === 'bitcoinarg.news') {
      domain = 'bitcoinarg.news';
    } else if (cleaned === 'localhost') {
      domain = 'localhost';
    }
  }

  return domainConfigs[domain];
}
