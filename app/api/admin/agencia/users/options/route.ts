import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, serverError } from '@/lib/admin-auth';

/**
 * Lo mínimo para llenar el select de responsable de una tarea: id, nombre y rol.
 * Existe separado de `GET /users` justamente para que un empleado no necesite
 * leer el listado completo del equipo (mails, altas, quién tiene contraseña
 * temporal sin cambiar) sólo para asignar una tarea.
 */
export async function GET() {
  console.log('[GET] /api/admin/agencia/users/options - Request received');
  try {
    const { error } = await requireUser();
    if (error) return error;

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: users, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/users/options', error);
  }
}
