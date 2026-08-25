import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, forbidden, notFound, requireUser, serverError } from '@/lib/admin-auth';
import { canAccessClient } from '@/lib/agency/permissions';

/**
 * Proxy de descarga. La URL del Blob nunca sale al navegador: si saliera, sería
 * un link público y permanente al brief de un cliente, compartible por accidente
 * y sin forma de revocarlo. Acá cada descarga vuelve a pasar por sesión y rol.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[GET] /api/admin/agencia/briefs/${params.id}/download - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('ID de brief inválido');

    const brief = await prisma.brief.findUnique({
      where: { id },
      select: { clientId: true, filename: true, blobUrl: true },
    });
    if (!brief) return notFound('Brief no encontrado');
    if (!(await canAccessClient(user, brief.clientId))) return forbidden();

    const upstream = await fetch(brief.blobUrl, { cache: 'no-store' });
    if (!upstream.ok || !upstream.body) {
      console.error(
        `[GET] /api/admin/agencia/briefs/${id}/download - Blob HTTP ${upstream.status}`
      );
      return notFound('El archivo ya no está disponible');
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${brief.filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return serverError(`[GET] /api/admin/agencia/briefs/${params.id}/download`, error);
  }
}
