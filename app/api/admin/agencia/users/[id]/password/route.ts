import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, serverError } from '@/lib/admin-auth';
import { generateTemporaryPassword, hashPassword } from '@/lib/password';

/**
 * Regenera la contraseña temporal de un usuario. No hay reset self-service: el
 * empleado le pide al admin y el admin le pasa la nueva por su canal.
 */
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[POST] /api/admin/agencia/users/${params.id}/password - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de usuario inválido');

    const temporaryPassword = generateTemporaryPassword();
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
        // Toda sesión abierta con la contraseña vieja muere acá.
        sessionVersion: { increment: 1 },
      },
    });

    console.log(`[POST] /api/admin/agencia/users/${id}/password - Password reset`);
    return NextResponse.json({
      data: { temporaryPassword },
      error: null,
      message: 'Contraseña temporal regenerada. Sólo se muestra ahora.',
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Usuario no encontrado');
    }
    return serverError(`[POST] /api/admin/agencia/users/${params.id}/password`, error);
  }
}
