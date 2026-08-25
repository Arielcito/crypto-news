import { NextRequest, NextResponse } from 'next/server';
import { PostProxyNotConfigured } from '@/lib/agency/postproxy';
import { syncSocial } from '@/lib/agency/sync-social';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Autoriza al cron. Vercel manda `Authorization: Bearer $CRON_SECRET`; sin el
 * secreto configurado la ruta queda cerrada en vez de abierta — un endpoint que
 * "por las dudas" deja pasar es un endpoint público.
 */
function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  console.log('[GET] /api/cron/sync-social - Request received');

  if (!authorize(request)) {
    return NextResponse.json(
      { data: null, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const result = await syncSocial();
    console.log('[GET] /api/cron/sync-social - Done:', JSON.stringify(result));
    return NextResponse.json({ data: result, error: null, message: null });
  } catch (error) {
    if (error instanceof PostProxyNotConfigured) {
      // Falla ruidosa a propósito: un cron que "no hace nada en silencio" es un
      // cron que nadie arregla.
      console.error('[GET] /api/cron/sync-social - POSTPROXY_API_KEY sin configurar');
      return NextResponse.json(
        { data: null, error: 'Not configured', message: error.message },
        { status: 503 }
      );
    }
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[GET] /api/cron/sync-social - Error:', detail);
    return NextResponse.json(
      { data: null, error: 'Internal server error', message: 'Falló la sincronización' },
      { status: 500 }
    );
  }
}
