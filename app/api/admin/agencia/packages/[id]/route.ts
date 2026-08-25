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
import { progressOf } from '@/lib/agency/packages';
import { updatePackageSchema } from '@/lib/validations/admin';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[GET] /api/admin/agencia/packages/${params.id} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de paquete inválido');

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, slug: true } },
        reports: { select: { id: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!pkg) return notFound('Paquete no encontrado');
    if (!(await canAccessClient(user, pkg.clientId))) return forbidden();

    return NextResponse.json({
      data: { ...pkg, progress: progressOf(pkg, pkg.tasks) },
      error: null,
      message: null,
    });
  } catch (error) {
    return serverError(`[GET] /api/admin/agencia/packages/${params.id}`, error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/agencia/packages/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de paquete inválido');

    const body = await request.json();
    const parsed = updatePackageSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const pkg = await prisma.package.update({
      where: { id },
      data: parsed.data,
      include: {
        client: { select: { id: true, name: true, slug: true } },
        reports: { select: { id: true, createdAt: true } },
        tasks: { select: { status: true } },
      },
    });

    const { tasks, ...rest } = pkg;
    return NextResponse.json({
      data: { ...rest, progress: progressOf(pkg, tasks) },
      error: null,
      message: 'Paquete actualizado',
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Paquete no encontrado');
    }
    return serverError(`[PUT] /api/admin/agencia/packages/${params.id}`, error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/packages/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de paquete inválido');

    // Se borra de verdad, con sus tareas: un paquete cargado por error no tiene
    // por qué quedar como ruido en el historial. Si ya tiene reportes, no.
    const reports = await prisma.report.count({ where: { packageId: id } });
    if (reports > 0) {
      return badRequest('El paquete ya tiene reportes generados: no se puede borrar');
    }

    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ data: null, error: null, message: 'Paquete eliminado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Paquete no encontrado');
    }
    return serverError(`[DELETE] /api/admin/agencia/packages/${params.id}`, error);
  }
}
