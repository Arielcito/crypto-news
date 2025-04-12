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

// Store selected domain in localStorage
const LOCAL_STORAGE_KEY = 'selected_domain';

export function getCurrentDomain(): Domain {
  if (typeof window === 'undefined') {
    console.log('getCurrentDomain: Running on server, returning localhost');
    return 'localhost';
  }
  
  console.log('getCurrentDomain: Hostname:', window.location.hostname);
  
  // Remove www. prefix if present
  const hostname = window.location.hostname.replace(/^www\./, '');
  console.log('getCurrentDomain: Cleaned hostname:', hostname);
  
  if (hostname === 'bitcoinarg.news') {
    console.log('getCurrentDomain: Matched bitcoinarg.news');
    return 'bitcoinarg.news';
  }
  if (hostname === 'tendenciascrypto.com' || hostname === 'tendenciascripto.com') {
    console.log('getCurrentDomain: Matched tendenciascrypto.com');
    return 'tendenciascrypto.com';
  }
  if (hostname === 'ultimahoracrypto.com' || hostname === 'ultimahoracripto.com') {
    console.log('getCurrentDomain: Matched ultimahoracrypto.com');
    return 'ultimahoracrypto.com';
  }
  
  console.log('getCurrentDomain: No match found, returning localhost');
  return 'localhost';
}

export const setSelectedDomain = (domain: Domain) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, domain);
  window.dispatchEvent(new Event('domain-changed'));
};

export function getCurrentPalette(domain: Domain = getCurrentDomain()) {
  console.log('getCurrentPalette: Domain:', domain);
  const palette = domainPalettes[domain];
  console.log('getCurrentPalette: Selected palette:', palette);
  return palette;
} 