import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, notFound, requireAdmin, requireUser, serverError } from '@/lib/admin-auth';
import { clientIdsForUser } from '@/lib/agency/permissions';
import { progressOf } from '@/lib/agency/packages';
import { parseMonth } from '@/lib/agency/dates';
import { createPackageSchema } from '@/lib/validations/admin';

export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/agencia/packages - Request received');
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const rawClientId = request.nextUrl.searchParams.get('clientId');
    const clientId = rawClientId ? Number(rawClientId) : undefined;
    if (rawClientId && (!Number.isInteger(clientId) || (clientId ?? 0) <= 0)) {
      return badRequest('ID de cliente inválido');
    }

    const allowed = await clientIdsForUser(user);
    const packages = await prisma.package.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(allowed === 'all' ? {} : { clientId: { in: allowed } }),
      },
      include: {
        client: { select: { id: true, name: true, slug: true } },
        tasks: { select: { status: true } },
        reports: { select: { id: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ month: 'desc' }, { clientId: 'asc' }],
    });

    const data = packages.map(({ tasks, ...pkg }) => ({ ...pkg, progress: progressOf(pkg, tasks) }));

    console.log(`[GET] /api/admin/agencia/packages - Returning ${data.length} packages`);
    return NextResponse.json({ data, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/packages', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/packages - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createPackageSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const pkg = await prisma.package.create({
      data: {
        clientId: parsed.data.clientId,
        month: parseMonth(parsed.data.month),
        committedPieces: parsed.data.committedPieces,
        amount: parsed.data.amount ?? null,
        notes: parsed.data.notes ?? null,
      },
      include: {
        client: { select: { id: true, name: true, slug: true } },
        reports: { select: { id: true, createdAt: true } },
      },
    });

    console.log(`[POST] /api/admin/agencia/packages - Created package ${pkg.id}`);
    return NextResponse.json(
      {
        data: { ...pkg, progress: { done: 0, total: 0, committed: pkg.committedPieces } },
        error: null,
        message: 'Paquete creado',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return conflict('Ese cliente ya tiene un paquete para ese mes');
      if (error.code === 'P2003') return notFound('Cliente no encontrado');
    }
    return serverError('[POST] /api/admin/agencia/packages', error);
  }
}
