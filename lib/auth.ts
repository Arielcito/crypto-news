import { NextRequest } from 'next/server';

export function checkBasicAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  const [type, credentials] = authHeader.split(' ');
  
  if (type !== 'Basic') {
    return false;
  }

  const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // Verificar contra las credenciales de WordPress
  return username === process.env.WORDPRESS_USERNAME && 
         password === process.env.WORDPRESS_PASSWORD;
} 