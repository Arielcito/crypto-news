import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, serverError } from '@/lib/admin-auth';

/** Se borra de verdad: un gasto cargado mal no tiene por qué quedar de ruido. */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/expenses/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de gasto inválido');

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ data: null, error: null, message: 'Gasto eliminado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Gasto no encontrado');
    }
    return serverError(`[DELETE] /api/admin/agencia/expenses/${params.id}`, error);
  }
}
