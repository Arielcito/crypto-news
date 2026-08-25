import { NextRequest, NextResponse } from 'next/server';
import { badRequest, forbidden, requireUser, serverError } from '@/lib/admin-auth';
import { canAccessClient, clientIdsForUser } from '@/lib/agency/permissions';
import { organicMetrics } from '@/lib/agency/metrics';
import { metricsRangeSchema } from '@/lib/validations/admin';

export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/agencia/metrics - Request received');
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const search = request.nextUrl.searchParams;
    const rawClientId = search.get('clientId');
    const rawDays = search.get('days');

    const parsed = metricsRangeSchema.safeParse({
      clientId: rawClientId ? Number(rawClientId) : undefined,
      days: rawDays ? Number(rawDays) : undefined,
    });
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    if (parsed.data.clientId && !(await canAccessClient(user, parsed.data.clientId))) {
      return forbidden();
    }

    const metrics = await organicMetrics({
      clientId: parsed.data.clientId,
      allowedClientIds: await clientIdsForUser(user),
      days: parsed.data.days,
    });

    console.log(
      `[GET] /api/admin/agencia/metrics - ${metrics.accounts.length} cuentas, ${metrics.totals.pieces} piezas`
    );
    return NextResponse.json({ data: metrics, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/metrics', error);
  }
}
