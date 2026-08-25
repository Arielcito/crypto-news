import { NextRequest, NextResponse } from 'next/server';
import { sendTaskAlerts } from '@/lib/services/discord-tasks';

export const dynamic = 'force-dynamic';

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/** Corre 12:00 UTC = 9:00 en Argentina, al arrancar el día. */
export async function GET(request: NextRequest) {
  console.log('[GET] /api/cron/task-alerts - Request received');

  if (!authorize(request)) {
    return NextResponse.json(
      { data: null, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const result = await sendTaskAlerts();
    console.log('[GET] /api/cron/task-alerts - Done:', JSON.stringify(result));
    return NextResponse.json({ data: result, error: null, message: null });
  } catch (error) {
    console.error(
      '[GET] /api/cron/task-alerts - Error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { data: null, error: 'Internal server error', message: 'Falló el aviso de vencimientos' },
      { status: 500 }
    );
  }
}
