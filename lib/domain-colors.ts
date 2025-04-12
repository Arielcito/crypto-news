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

export const getCurrentDomain = (): Domain => {
  if (typeof window === 'undefined') return 'bitcoinarg.news';
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    const storedDomain = localStorage.getItem(LOCAL_STORAGE_KEY);
    return (storedDomain as Domain) || 'bitcoinarg.news';
  }
  
  return hostname as Domain;
};

export const setSelectedDomain = (domain: Domain) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, domain);
  window.dispatchEvent(new Event('domain-changed'));
};

export const getCurrentPalette = (): ColorPalette => {
  const domain = getCurrentDomain();
  return domainPalettes[domain];
}; 