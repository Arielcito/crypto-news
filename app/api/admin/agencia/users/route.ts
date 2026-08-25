import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, requireAdmin, serverError } from '@/lib/admin-auth';
import { generateTemporaryPassword, hashPassword } from '@/lib/password';
import { createUserSchema } from '@/lib/validations/admin';

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
} as const;

/**
 * Listado completo del equipo — mails, estado y quién todavía arrastra la
 * contraseña temporal. Es la pantalla de Equipo, así que va sólo para ADMIN;
 * el select de responsable usa `/users/options`, que devuelve mucho menos.
 * Nunca sale el hash.
 */
export async function GET() {
  console.log('[GET] /api/admin/agencia/users - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: PUBLIC_FIELDS,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: users, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/users', error);
  }
}

/**
 * Alta de empleado. La contraseña temporal se devuelve UNA vez para que el
 * admin se la pase por su canal; no se guarda en claro ni se puede volver a ver.
 */
export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/users - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const temporaryPassword = generateTemporaryPassword();
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.trim().toLowerCase(),
        name: parsed.data.name.trim(),
        role: parsed.data.role,
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
      },
      select: PUBLIC_FIELDS,
    });

    console.log(`[POST] /api/admin/agencia/users - Created user ${user.id} role=${user.role}`);
    return NextResponse.json(
      {
        data: { ...user, temporaryPassword },
        error: null,
        message: 'Usuario creado. Pasale la contraseña temporal: sólo se muestra ahora.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflict('Ya existe un usuario con ese email');
    }
    return serverError('[POST] /api/admin/agencia/users', error);
  }
}
