import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of allowed domains
const allowedDomains = [
  'www.bitcoinarg.news',
  'bitcoinarg.news',
  'www.tendenciascripto.com',
  'tendenciascripto.com',
  'www.ultimahoracripto.com',
  'ultimahoracripto.com',
  'localhost:3000',
  'localhost'
]

// Domain mapping for clean detection
const domainMapping: Record<string, string> = {
  'www.bitcoinarg.news': 'bitcoinarg.news',
  'bitcoinarg.news': 'bitcoinarg.news',
  'www.tendenciascripto.com': 'tendenciascripto.com',
  'tendenciascripto.com': 'tendenciascripto.com',
  'www.ultimahoracripto.com': 'ultimahoracripto.com',
  'ultimahoracripto.com': 'ultimahoracripto.com',
  'localhost:3000': 'localhost',
  'localhost': 'localhost'
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const origin = request.headers.get('origin') || ''
  
  // Log domain information for debugging
  console.log('🔍 Middleware processing request:', {
    host,
    origin,
    pathname: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
  
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Create the response
    const response = NextResponse.next()
    
    // Detect the clean domain
    const cleanDomain = domainMapping[host] || domainMapping[origin] || 'localhost'
    
    // Add domain information to response headers for debugging
    response.headers.set('X-Detected-Domain', cleanDomain)
    response.headers.set('X-Request-Host', host)
    
    // Check if the origin is in our allowed domains
    if (allowedDomains.some(domain => origin.includes(domain.replace('www.', '')))) {
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    console.log('✅ API response with domain:', cleanDomain);
    return response
  }
  
  // For non-API routes, add domain detection headers
  const response = NextResponse.next()
  const cleanDomain = domainMapping[host] || 'localhost'
  
  // Add headers that can be read by the app
  response.headers.set('X-Detected-Domain', cleanDomain)
  response.headers.set('X-Request-Host', host)
  
  console.log('🌐 Page request processed for domain:', cleanDomain);
  return response
}

// Configure the middleware to run on all routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 