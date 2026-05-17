import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin') || '';

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
