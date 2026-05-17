import { cleanDomain } from "./api/posts";

export type Domain = 'bitcoinarg.news' | 'localhost';

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

export const domainPalettes: Record<Domain, ColorPalette> = {
  'bitcoinarg.news': {
    primary: '#F7931A', // Naranja Bitcoin
    secondary: '#03A9F4', // Celeste
    tertiary: '#ECEFF1', // Gris Claro
  },
  'localhost': {
    primary: '#F7931A',
    secondary: '#03A9F4',
    tertiary: '#ECEFF1',
  },
};

const COOKIE_KEY = 'selected_domain';

export function getCurrentDomain(): Domain {
  if (typeof window === 'undefined') {
    return 'localhost';
  }

  const cookieDomain = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_KEY}=`))
    ?.split('=')[1] as Domain;

  if (cookieDomain === 'bitcoinarg.news' || cookieDomain === 'localhost') {
    return cookieDomain;
  }

  const hostname = window.location.hostname.replace(/^www\./, '');
  const cleanHostname = cleanDomain(hostname);

  if (cleanHostname === 'bitcoinarg.news') {
    return 'bitcoinarg.news';
  }

  return 'localhost';
}

export const setSelectedDomain = (domain: Domain) => {
  if (typeof window === 'undefined') return;

  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${domain}; expires=${date.toUTCString()}; path=/`;

  window.dispatchEvent(new Event('domain-changed'));
};

export function getCurrentPalette(domain: Domain = getCurrentDomain()) {
  return domainPalettes[domain];
}
