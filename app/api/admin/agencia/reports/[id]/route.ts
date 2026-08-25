import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  badRequest,
  forbidden,
  notFound,
  requireAdmin,
  requireUser,
  serverError,
} from '@/lib/admin-auth';
import { canAccessClient } from '@/lib/agency/permissions';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[GET] /api/admin/agencia/reports/${params.id} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de reporte inválido');

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: { select: { id: true, name: true } },
        package: {
          select: { id: true, month: true, clientId: true, client: { select: { id: true, name: true } } },
        },
      },
    });

    if (!report) return notFound('Reporte no encontrado');
    if (!(await canAccessClient(user, report.package.clientId))) return forbidden();

    return NextResponse.json({ data: report, error: null, message: null });
  } catch (error) {
    return serverError(`[GET] /api/admin/agencia/reports/${params.id}`, error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/reports/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de reporte inválido');

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ data: null, error: null, message: 'Reporte eliminado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Reporte no encontrado');
    }
    return serverError(`[DELETE] /api/admin/agencia/reports/${params.id}`, error);
  }
}
