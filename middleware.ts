import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of allowed domains
const allowedDomains = [
  'www.bitcoinarg.news',
  'bitcoinarg.news',
  'www.tendenciascrypto.com',
  'tendenciascrypto.com',
  'www.tendenciascripto.com',
  'tendenciascripto.com',
  'www.ultimahoracrypto.com',
  'ultimahoracrypto.com',
  'www.ultimahoracripto.com',
  'ultimahoracripto.com'
]

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || ''
  
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Create the response
    const response = NextResponse.next()
    
    // Check if the origin is in our allowed domains
    if (allowedDomains.includes(origin)) {
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    return response
  }
  
  return NextResponse.next()
}

// Configure the middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
} 