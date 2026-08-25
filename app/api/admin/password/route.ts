import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, getAdminSession, requireUser, serverError } from '@/lib/admin-auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { changePasswordSchema } from '@/lib/validations/admin';

/**
 * Cambio de contraseña propio. Incrementa `sessionVersion`, lo que invalida
 * cualquier otra sesión abierta con la contraseña vieja; la sesión actual se
 * re-firma con la versión nueva para que quien hizo el cambio no se autoexpulse.
 */
export async function PUT(request: NextRequest) {
  console.log('[PUT] /api/admin/password - Request received');

  try {
    // Única ruta que se puede usar con la temporal todavía vigente: es
    // justamente la que la reemplaza.
    const { user, error } = await requireUser({ allowPendingPassword: true });
    if (error) return error;

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const stored = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!stored) return badRequest('Usuario inexistente');

    const valid = await verifyPassword(parsed.data.currentPassword, stored.passwordHash);
    if (!valid) {
      console.log(`[PUT] /api/admin/password - Wrong current password user=${user.id}`);
      return NextResponse.json(
        { data: null, error: 'Unauthorized', message: 'La contraseña actual no es correcta' },
        { status: 401 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
      select: { sessionVersion: true },
    });

    const session = await getAdminSession();
    session.sessionVersion = updated.sessionVersion;
    session.mustChangePassword = false;
    await session.save();

    console.log(`[PUT] /api/admin/password - Password changed user=${user.id}`);
    return NextResponse.json({
      data: null,
      error: null,
      message: 'Contraseña actualizada',
    });
  } catch (error) {
    return serverError('[PUT] /api/admin/password', error);
  }
}
