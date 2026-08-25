import { NextResponse } from 'next/server';
import { requireAdmin, serverError } from '@/lib/admin-auth';
import { PostProxyNotConfigured } from '@/lib/agency/postproxy';
import { syncSocial } from '@/lib/agency/sync-social';

export const maxDuration = 300;

/** Sincronización a pedido desde el panel. Misma lógica que el cron. */
export async function POST() {
  console.log('[POST] /api/admin/agencia/sync - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await syncSocial();
    console.log('[POST] /api/admin/agencia/sync - Done:', JSON.stringify(result));
    return NextResponse.json({
      data: result,
      error: null,
      message: `${result.posts} piezas, ${result.postReadings} lecturas nuevas`,
    });
  } catch (error) {
    if (error instanceof PostProxyNotConfigured) {
      return NextResponse.json(
        { data: null, error: 'Not configured', message: error.message },
        { status: 503 }
      );
    }
    return serverError('[POST] /api/admin/agencia/sync', error);
  }
}
