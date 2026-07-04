import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import { sessionOptions, type AdminSessionData } from '@/lib/session';

const allowedDomains = [
  'www.bitcoinarg.news',
  'bitcoinarg.news',
  'localhost:3000',
  'localhost',
];

const domainMapping: Record<string, string> = {
  'www.bitcoinarg.news': 'bitcoinarg.news',
  'bitcoinarg.news': 'bitcoinarg.news',
  'localhost:3000': 'localhost',
  'localhost': 'localhost',
};

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin') || '';
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get(sessionOptions.cookieName)?.value;
    let isLoggedIn = false;

    if (cookie) {
      try {
        const session = await unsealData<AdminSessionData>(cookie, {
          password: sessionOptions.password,
        });
        isLoggedIn = session.isLoggedIn === true;
      } catch {
        isLoggedIn = false;
      }
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    const cleanDomain = domainMapping[host] || domainMapping[origin] || 'localhost';

    response.headers.set('X-Detected-Domain', cleanDomain);
    response.headers.set('X-Request-Host', host);

    if (allowedDomains.some((domain) => origin.includes(domain.replace('www.', '')))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
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
