import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, notFound, requireAdmin, serverError } from '@/lib/admin-auth';
import { createClientProfileSchema } from '@/lib/validations/admin';

/** Conecta una cuenta de PostProxy a un cliente. Sólo admin. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[POST] /api/admin/agencia/clients/${params.id}/profiles - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const clientId = Number(params.id);
    if (!Number.isInteger(clientId) || clientId <= 0) return badRequest('ID de cliente inválido');

    const body = await request.json();
    const parsed = createClientProfileSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const profile = await prisma.clientProfile.create({
      data: {
        clientId,
        postproxyProfileId: parsed.data.postproxyProfileId.trim(),
        network: parsed.data.network,
        handle: parsed.data.handle ?? null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    console.log(`[POST] /api/admin/agencia/clients/${clientId}/profiles - Created ${profile.id}`);
    return NextResponse.json(
      { data: profile, error: null, message: 'Cuenta conectada' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return conflict('Esa cuenta de PostProxy ya está asignada');
      if (error.code === 'P2003') return notFound('Cliente no encontrado');
    }
    return serverError(`[POST] /api/admin/agencia/clients/${params.id}/profiles`, error);
  }
}
