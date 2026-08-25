import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, requireUser, serverError } from '@/lib/admin-auth';
import { clientIdsForUser } from '@/lib/agency/permissions';
import { buildSnapshot } from '@/lib/agency/reports';

const createReportSchema = z.object({ packageId: z.number().int().positive() });

const REPORT_LIST_SELECT = {
  id: true,
  packageId: true,
  createdAt: true,
  generatedBy: { select: { id: true, name: true } },
  package: {
    select: { id: true, month: true, client: { select: { id: true, name: true } } },
  },
} as const;

export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/agencia/reports - Request received');
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const rawClientId = request.nextUrl.searchParams.get('clientId');
    const clientId = rawClientId ? Number(rawClientId) : undefined;
    if (rawClientId && (!Number.isInteger(clientId) || (clientId ?? 0) <= 0)) {
      return badRequest('ID de cliente inválido');
    }

    const allowed = await clientIdsForUser(user);
    const reports = await prisma.report.findMany({
      where: {
        package: {
          ...(clientId ? { clientId } : {}),
          ...(allowed === 'all' ? {} : { clientId: { in: allowed } }),
        },
      },
      select: REPORT_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: reports, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/reports', error);
  }
}

/**
 * Genera el reporte del paquete. Es manual y a pedido: automatizarlo al cerrar
 * la última tarea congelaría los números el mismo día de la publicación, cuando
 * las piezas todavía no juntaron ni la mitad de su alcance.
 */
export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/reports - Request received');
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) return badRequest('Falta el paquete a reportar');

    const snapshot = await buildSnapshot(parsed.data.packageId);
    if (!snapshot) return notFound('Paquete no encontrado');

    const report = await prisma.report.create({
      data: {
        packageId: parsed.data.packageId,
        generatedById: user.id,
        snapshot: JSON.parse(JSON.stringify(snapshot)),
      },
      select: REPORT_LIST_SELECT,
    });

    console.log(`[POST] /api/admin/agencia/reports - Created report ${report.id}`);
    return NextResponse.json(
      { data: report, error: null, message: 'Reporte generado' },
      { status: 201 }
    );
  } catch (error) {
    return serverError('[POST] /api/admin/agencia/reports', error);
  }
}
