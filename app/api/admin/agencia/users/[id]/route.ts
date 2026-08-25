import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, serverError } from '@/lib/admin-auth';
import { updateUserSchema } from '@/lib/validations/admin';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/agencia/users/${params.id} - Request received`);
  try {
    const { user: actor, error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de usuario inválido');

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    // Un admin no puede desactivarse ni degradarse a sí mismo: quedarse sin
    // ningún admin deja el panel sin dueño y sin forma de repararlo desde la UI.
    if (id === actor.id && (parsed.data.isActive === false || parsed.data.role === 'EMPLOYEE')) {
      return badRequest('No podés quitarte a vos mismo el acceso de admin');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...parsed.data,
        // Desactivar tiene que cortar la sesión abierta, no esperar a que venza.
        ...(parsed.data.isActive === false ? { sessionVersion: { increment: 1 } } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    console.log(`[PUT] /api/admin/agencia/users/${id} - Updated`);
    return NextResponse.json({ data: updated, error: null, message: 'Usuario actualizado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Usuario no encontrado');
    }
    return serverError(`[PUT] /api/admin/agencia/users/${params.id}`, error);
  }
}
