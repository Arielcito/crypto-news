import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { put } from '@vercel/blob';

/**
 * Espeja una imagen remota en Vercel Blob.
 *
 * La ingesta automática (Make) manda la `og:image` del artículo original. Si la
 * guardáramos tal cual, el post queda atado a un servidor ajeno: el día que la
 * fuente rota la URL o borra el archivo, la portada se rompe hacia atrás. Los
 * 2.529 posts de bitcoinarg.news tienen imagen y los listados no tienen
 * fallback, así que la copia propia no es un lujo.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/**
 * Rangos que jamás deberían salir de un fetch server-side: loopback, redes
 * privadas, link-local y el metadata endpoint de los cloud providers
 * (169.254.169.254). Sin esto, `featured_media` sería un SSRF con credenciales
 * válidas.
 */
function isPrivateAddress(address: string, family: number): boolean {
  if (family === 6) {
    const ip = address.toLowerCase();
    if (ip === '::' || ip === '::1') return true;
    if (ip.startsWith('fe80') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
    // IPv4 mapeada (::ffff:10.0.0.1) — se valida como IPv4.
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1], 4);
    return false;
  }

  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local + metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast + reservados

  return false;
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('URL inválida');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Protocolo no permitido: ${url.protocol}`);
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');
  const literal = isIP(host);
  const addresses = literal
    ? [{ address: host, family: literal }]
    : await lookup(host, { all: true });

  if (addresses.length === 0) throw new Error('El host no resuelve');
  for (const { address, family } of addresses) {
    if (isPrivateAddress(address, family)) {
      throw new Error('El host resuelve a una dirección de red interna');
    }
  }

  return url;
}

/** Sigue los redirects a mano para revalidar cada salto contra SSRF. */
async function fetchImage(rawUrl: string): Promise<Response> {
  let current = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'bitcoinarg.news media mirror', Accept: 'image/*' },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`Redirect ${response.status} sin Location`);
      current = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) throw new Error(`El origen respondió ${response.status}`);
    return response;
  }

  throw new Error('Demasiados redirects');
}

export function isMirroredUrl(url: string): boolean {
  return /^https:\/\/[^/]+\.(public\.)?blob\.vercel-storage\.com\//.test(url);
}

/**
 * Descarga la imagen y la sube a Blob. Lanza si la URL no es segura, el tipo no
 * es una imagen soportada o pesa más de 8MB; el llamador decide qué hacer con
 * eso.
 */
export async function mirrorRemoteImage(rawUrl: string, slug: string): Promise<string> {
  const response = await fetchImage(rawUrl);

  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) throw new Error(`Tipo no soportado: ${contentType || 'desconocido'}`);

  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength && declaredLength > MAX_BYTES) {
    throw new Error(`La imagen pesa ${declaredLength} bytes (máximo ${MAX_BYTES})`);
  }

  // El content-length puede faltar o mentir, así que el tamaño real se corta acá.
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`La imagen pesa ${buffer.byteLength} bytes (máximo ${MAX_BYTES})`);
  }
  if (buffer.byteLength === 0) throw new Error('La imagen vino vacía');

  const safeSlug = slug.slice(0, 60) || 'post';
  const blob = await put(`posts/${Date.now()}-${safeSlug}.${extension}`, buffer, {
    access: 'public',
    contentType,
  });

  return blob.url;
}
