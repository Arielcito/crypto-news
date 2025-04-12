export type Domain = 'bitcoinarg.news' | 'tendenciascrypto.com' | 'ultimahoracrypto.com' | 'localhost';

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
  'ultimahoracrypto.com': {
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

// Store selected domain in localStorage
const LOCAL_STORAGE_KEY = 'selected_domain';

export function getCurrentDomain(): Domain {
  if (typeof window === 'undefined') {
    return 'localhost';
  }

  const hostname = window.location.hostname;
  if (hostname === 'bitcoinarg.news') return 'bitcoinarg.news';
  if (hostname === 'tendenciascrypto.com') return 'tendenciascrypto.com';
  if (hostname === 'ultimahoracrypto.com') return 'ultimahoracrypto.com';
  return 'localhost';
}

export const setSelectedDomain = (domain: Domain) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, domain);
  window.dispatchEvent(new Event('domain-changed'));
};

export function getCurrentPalette(domain: Domain = getCurrentDomain()) {
  switch (domain) {
    case 'bitcoinarg.news':
      return {
        primary: 'hsl(24, 100%, 50%)',
        secondary: 'hsl(0, 0%, 100%)',
        tertiary: 'hsl(0, 0%, 0%)'
      };
    case 'tendenciascrypto.com':
      return {
        primary: 'hsl(210, 100%, 50%)',
        secondary: 'hsl(0, 0%, 100%)',
        tertiary: 'hsl(0, 0%, 0%)'
      };
    case 'ultimahoracrypto.com':
      return {
        primary: 'hsl(120, 100%, 50%)',
        secondary: 'hsl(0, 0%, 100%)',
        tertiary: 'hsl(0, 0%, 0%)'
      };
    default:
      return {
        primary: 'hsl(24, 100%, 50%)',
        secondary: 'hsl(0, 0%, 100%)',
        tertiary: 'hsl(0, 0%, 0%)'
      };
  }
} 