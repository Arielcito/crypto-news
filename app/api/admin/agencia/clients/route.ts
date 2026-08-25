import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, requireAdmin, requireUser, serverError } from '@/lib/admin-auth';
import { clientScopeFilter } from '@/lib/agency/permissions';
import { createClientSchema } from '@/lib/validations/admin';

/**
 * Listado de clientes. El empleado sólo ve aquellos donde tiene alguna tarea
 * asignada: el alcance sale de la base, no de un filtro que manda el navegador.
 */
export async function GET() {
  console.log('[GET] /api/admin/agencia/clients - Request received');
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const scope = await clientScopeFilter(user);
    const clients = await prisma.client.findMany({
      where: { isActive: true, ...scope },
      include: {
        profiles: { where: { isActive: true }, orderBy: { network: 'asc' } },
        _count: { select: { packages: true, briefs: true } },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });

    console.log(`[GET] /api/admin/agencia/clients - Returning ${clients.length} clients`);
    return NextResponse.json({ data: clients, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/clients', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/clients - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const client = await prisma.client.create({
      data: {
        name: parsed.data.name.trim(),
        slug: parsed.data.slug,
        status: parsed.data.status,
        monthlyAmount: parsed.data.monthlyAmount ?? null,
        notes: parsed.data.notes ?? null,
      },
      include: {
        profiles: true,
        _count: { select: { packages: true, briefs: true } },
      },
    });

    console.log(`[POST] /api/admin/agencia/clients - Created client ${client.id}`);
    return NextResponse.json(
      { data: client, error: null, message: 'Cliente creado' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflict('Ya existe un cliente con ese slug');
    }
    return serverError('[POST] /api/admin/agencia/clients', error);
  }
}
