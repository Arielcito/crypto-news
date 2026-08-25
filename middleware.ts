import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import { sessionOptions, type AdminSessionData } from '@/lib/session';

const domainMapping: Record<string, string> = {
  'www.bitcoinarg.news': 'bitcoinarg.news',
  'bitcoinarg.news': 'bitcoinarg.news',
  'localhost:3000': 'localhost',
  'localhost': 'localhost',
};

/**
 * Orígenes completos, comparados por igualdad exacta. Antes esto era
 * `origin.includes('bitcoinarg.news')`, que también matchea
 * `https://bitcoinarg.news.attacker.com` — y como la respuesta lleva
 * `Access-Control-Allow-Credentials: true`, cualquier dominio así construido
 * podía leer la API con la cookie de sesión de la víctima.
 */
const allowedOrigins = new Set([
  'https://bitcoinarg.news',
  'https://www.bitcoinarg.news',
  'https://bitcoinarg-news.localhost',
  'http://localhost:3000',
  'http://localhost:4456',
]);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;
  // Vercel arma un host distinto por deploy; sólo se acepta el del proyecto.
  const vercelUrl = process.env.VERCEL_URL;
  return Boolean(vercelUrl) && origin === `https://${vercelUrl}`;
}

/** Rutas del panel a las que un empleado no tiene por qué entrar. */
const adminOnlyPrefixes = ['/admin/posts', '/admin/categories', '/admin/tags', '/admin/agencia/equipo'];

const publicAdminPaths = ['/admin/login', '/admin/cambiar-password'];

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin') || '';
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !publicAdminPaths.includes(pathname)) {
    const cookie = request.cookies.get(sessionOptions.cookieName)?.value;
    let session: AdminSessionData | null = null;

    if (cookie) {
      try {
        session = await unsealData<AdminSessionData>(cookie, {
          password: sessionOptions.password,
        });
      } catch {
        session = null;
      }
    }

    if (!session?.isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Con la contraseña temporal sin cambiar no se entra a ninguna otra
    // pantalla: `/admin/cambiar-password` está en `publicAdminPaths`, así que
    // el redirect no cicla.
    if (session.mustChangePassword) {
      return NextResponse.redirect(new URL('/admin/cambiar-password', request.url));
    }

    // Gate barato de UI. La autorización real la hace cada route handler
    // releyendo el usuario de la base (ver lib/admin-auth.ts): el middleware
    // corre en el edge y no puede consultar Postgres.
    if (session.role !== 'ADMIN' && adminOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.redirect(new URL('/admin/agencia/mis-tareas', request.url));
    }
  }

  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    const cleanDomain = domainMapping[host] || domainMapping[origin] || 'localhost';

    response.headers.set('X-Detected-Domain', cleanDomain);
    response.headers.set('X-Request-Host', host);

    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
    }

    return response;
  }

  const response = NextResponse.next();
  const cleanDomain = domainMapping[host] || 'localhost';

  response.headers.set('X-Detected-Domain', cleanDomain);
  response.headers.set('X-Request-Host', host);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
