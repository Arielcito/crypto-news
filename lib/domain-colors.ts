import { cleanDomain } from "./api/posts";

export type Domain = 'bitcoinarg.news' | 'tendenciascrypto.com' | 'tendenciascripto.com' | 'ultimahoracrypto.com' | 'ultimahoracripto.com' | 'localhost';

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
  'tendenciascrypto.com': {
    primary: '#2979FF', // Azul Eléctrico
    secondary: '#673AB7', // Púrpura
    tertiary: '#37474F', // Gris Oscuro
  },
  'tendenciascripto.com': {
    primary: '#2979FF', // Azul Eléctrico
    secondary: '#673AB7', // Púrpura
    tertiary: '#37474F', // Gris Oscuro
  },
  'ultimahoracrypto.com': {
    primary: '#D32F2F', // Rojo
    secondary: '#FAFAFA', // Negro
    tertiary: '#FAFAFA', // Blanco
  },
  'ultimahoracripto.com': {
    primary: '#D32F2F', // Rojo
    secondary: '#FAFAFA', // Negro
    tertiary: '#FAFAFA', // Blanco
  },
  'localhost': {
    primary: '#F7931A', // Default to BitcoinArg colors
    secondary: '#03A9F4',
    tertiary: '#ECEFF1',
  },
};

const COOKIE_KEY = 'selected_domain';

export function getCurrentDomain(): Domain {
  if (typeof window === 'undefined') {
    return 'localhost';
  }

  // Check cookie first
  const cookieDomain = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_KEY}=`))
    ?.split('=')[1] as Domain;

  if (cookieDomain) {
    return cookieDomain;
  }

  const hostname = window.location.hostname.replace(/^www\./, '');

  const cleanHostname = cleanDomain(hostname);

  if (cleanHostname === 'bitcoinarg.news') {
    return 'bitcoinarg.news';
  }
  if (cleanHostname === 'tendenciascrypto.com' || cleanHostname === 'tendenciascripto.com') {
    return 'tendenciascrypto.com';
  }
  if (cleanHostname === 'ultimahoracrypto.com' || cleanHostname === 'ultimahoracripto.com') {
    return hostname as Domain;
  }
  
  return 'localhost';
}

export const setSelectedDomain = (domain: Domain) => {
  if (typeof window === 'undefined') return;
  
  // Set cookie with 1 year expiration
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${domain}; expires=${date.toUTCString()}; path=/`;
  
  window.dispatchEvent(new Event('domain-changed'));
};

export function getCurrentPalette(domain: Domain = getCurrentDomain()) {
  return domainPalettes[domain];
} 