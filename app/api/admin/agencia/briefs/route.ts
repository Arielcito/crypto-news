import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, serverError } from '@/lib/admin-auth';
import { BRIEF_PUBLIC_SELECT, MAX_BRIEF_SIZE, looksLikePdf, safeFilename } from '@/lib/agency/briefs';

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/briefs - Request received');
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const formData = await request.formData();
    const clientId = Number(formData.get('clientId'));
    const file = formData.get('file');

    if (!Number.isInteger(clientId) || clientId <= 0) return badRequest('ID de cliente inválido');
    if (!file || !(file instanceof File)) return badRequest('No mandaste ningún archivo');
    if (file.size === 0) return badRequest('El archivo está vacío');
    if (file.size > MAX_BRIEF_SIZE) return badRequest('El PDF supera los 10 MB');

    const buffer = await file.arrayBuffer();
    if (!looksLikePdf(buffer)) return badRequest('El archivo no es un PDF');

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return notFound('Cliente no encontrado');

    const filename = safeFilename(file.name);
    const blob = await put(`briefs/${clientId}/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    const brief = await prisma.brief.create({
      data: {
        clientId,
        filename,
        blobUrl: blob.url,
        size: file.size,
        contentType: 'application/pdf',
        uploadedById: user.id,
      },
      select: BRIEF_PUBLIC_SELECT,
    });

    console.log(`[POST] /api/admin/agencia/briefs - Uploaded brief ${brief.id}`);
    return NextResponse.json({ data: brief, error: null, message: 'Brief subido' }, { status: 201 });
  } catch (error) {
    return serverError('[POST] /api/admin/agencia/briefs', error);
  }
}
