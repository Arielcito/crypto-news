import { NextRequest, NextResponse } from 'next/server';
import { runIngest } from '@/lib/services/news-ingest';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * La llama cada hora `.github/workflows/ingest-news.yml`: el plan Hobby de
 * Vercel solo admite crons diarios. Un 500 hace fallar el workflow, y GitHub
 * avisa por mail.
 */
export async function GET(request: NextRequest) {
  console.log('[GET] /api/cron/ingest-news - Request received');

  if (!authorize(request)) {
    return NextResponse.json(
      { data: null, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const summary = await runIngest();
    return NextResponse.json({ data: summary, error: null, message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[GET] /api/cron/ingest-news - Error:', message);
    return NextResponse.json(
      { data: null, error: 'Internal server error', message: `Falló la ingesta: ${message}` },
      { status: 500 }
    );
  }
}
