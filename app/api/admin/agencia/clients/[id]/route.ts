import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
  requireAdmin,
  requireUser,
  serverError,
} from '@/lib/admin-auth';
import { canAccessClient } from '@/lib/agency/permissions';
import { BRIEF_PUBLIC_SELECT } from '@/lib/agency/briefs';
import { updateClientSchema } from '@/lib/validations/admin';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[GET] /api/admin/agencia/clients/${params.id} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de cliente inválido');
    if (!(await canAccessClient(user, id))) return forbidden();

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        profiles: { orderBy: { network: 'asc' } },
        briefs: {
          // Sin `blobUrl`: la descarga pasa siempre por el proxy con sesión.
          select: BRIEF_PUBLIC_SELECT,
          orderBy: { createdAt: 'desc' },
        },
        packages: {
          orderBy: { month: 'desc' },
          include: { _count: { select: { tasks: true } } },
        },
      },
    });

    if (!client) return notFound('Cliente no encontrado');
    return NextResponse.json({ data: client, error: null, message: null });
  } catch (error) {
    return serverError(`[GET] /api/admin/agencia/clients/${params.id}`, error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/agencia/clients/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de cliente inválido');

    const body = await request.json();
    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
      include: {
        profiles: true,
        _count: { select: { packages: true, briefs: true } },
      },
    });

    console.log(`[PUT] /api/admin/agencia/clients/${id} - Updated`);
    return NextResponse.json({ data: client, error: null, message: 'Cliente actualizado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return notFound('Cliente no encontrado');
      if (error.code === 'P2002') return conflict('Ya existe un cliente con ese slug');
    }
    return serverError(`[PUT] /api/admin/agencia/clients/${params.id}`, error);
  }
}

/**
 * Baja lógica. Borrar de verdad se llevaría paquetes, tareas y reportes por
 * cascada: el historial de lo facturado no se tira porque un cliente se fue.
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/clients/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de cliente inválido');

    await prisma.client.update({
      where: { id },
      data: { isActive: false, status: 'CHURNED' },
    });

    console.log(`[DELETE] /api/admin/agencia/clients/${id} - Archived`);
    return NextResponse.json({ data: null, error: null, message: 'Cliente archivado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Cliente no encontrado');
    }
    return serverError(`[DELETE] /api/admin/agencia/clients/${params.id}`, error);
  }
}
