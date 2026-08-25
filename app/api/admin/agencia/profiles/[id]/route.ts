import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, notFound, requireAdmin, serverError } from '@/lib/admin-auth';
import { updateClientProfileSchema } from '@/lib/validations/admin';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/agencia/profiles/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de perfil inválido');

    const body = await request.json();
    const parsed = updateClientProfileSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const { expiresAt, ...rest } = parsed.data;
    const profile = await prisma.clientProfile.update({
      where: { id },
      data: {
        ...rest,
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
      },
    });

    return NextResponse.json({ data: profile, error: null, message: 'Cuenta actualizada' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return notFound('Cuenta no encontrada');
      if (error.code === 'P2002') return conflict('Esa cuenta de PostProxy ya está asignada');
    }
    return serverError(`[PUT] /api/admin/agencia/profiles/${params.id}`, error);
  }
}

/**
 * Desconectar una cuenta la desactiva pero no borra sus métricas: el histórico
 * de seguidores de los meses que estuvo conectada sigue siendo cierto.
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/profiles/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de perfil inválido');

    await prisma.clientProfile.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ data: null, error: null, message: 'Cuenta desconectada' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Cuenta no encontrada');
    }
    return serverError(`[DELETE] /api/admin/agencia/profiles/${params.id}`, error);
  }
}
