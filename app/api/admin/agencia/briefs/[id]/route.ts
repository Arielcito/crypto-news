import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, serverError } from '@/lib/admin-auth';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/briefs/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de brief inválido');

    const brief = await prisma.brief.delete({ where: { id }, select: { blobUrl: true } });

    // El archivo se borra después de la fila: si el Blob falla, el brief ya no
    // aparece en el panel y queda un huérfano, que es mejor que una fila que
    // apunta a un archivo que ya no está.
    try {
      await del(brief.blobUrl);
    } catch (blobError) {
      console.error(
        `[DELETE] /api/admin/agencia/briefs/${id} - Blob huérfano:`,
        blobError instanceof Error ? blobError.message : blobError
      );
    }

    return NextResponse.json({ data: null, error: null, message: 'Brief eliminado' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Brief no encontrado');
    }
    return serverError(`[DELETE] /api/admin/agencia/briefs/${params.id}`, error);
  }
}
