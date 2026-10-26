import { NextRequest, NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { badRequest, forbidden, notFound, requireUser, serverError } from '@/lib/admin-auth';
import {
  MAX_EVIDENCE_SIZE,
  TASK_INCLUDE,
  canWorkOnTask,
  imageTypeOf,
  isOwnBlob,
} from '@/lib/agency/tasks';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function findTask(id: number) {
  return prisma.task.findUnique({
    where: { id },
    select: { id: true, assigneeId: true, coAssigneeId: true, evidenceUrl: true },
  });
}

/** Si falla, queda un archivo huérfano en Blob: no vale la pena tirar el pedido por eso. */
async function dropOldBlob(url: string | null, route: string) {
  if (!url || !isOwnBlob(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error(`${route} - No se pudo borrar la captura anterior`, error);
  }
}

/** Sube la captura de la pieza (historias: a las 24 h el link ya no prueba nada). */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const route = `[POST] /api/admin/agencia/tasks/${params.id}/evidence`;
  console.log(`${route} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de tarea inválido');

    const existing = await findTask(id);
    if (!existing) return notFound('Tarea no encontrada');
    if (!canWorkOnTask(user, existing)) return forbidden();

    const file = (await request.formData()).get('file');
    if (!file || !(file instanceof File)) return badRequest('No mandaste ninguna imagen');
    if (file.size === 0) return badRequest('La imagen está vacía');
    if (file.size > MAX_EVIDENCE_SIZE) return badRequest('La imagen supera los 4 MB');

    const buffer = await file.arrayBuffer();
    const type = imageTypeOf(buffer);
    if (!type) return badRequest('La captura tiene que ser JPG, PNG o WebP');

    const blob = await put(`evidence/${id}/${Date.now()}.${type.ext}`, buffer, {
      access: 'public',
      contentType: type.contentType,
    });

    const task = await prisma.task.update({
      where: { id },
      data: { evidenceUrl: blob.url },
      include: TASK_INCLUDE,
    });
    await dropOldBlob(existing.evidenceUrl, route);

    console.log(`${route} - Uploaded evidence`);
    return NextResponse.json({ data: task, error: null, message: 'Captura subida' });
  } catch (error) {
    return serverError(route, error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const route = `[DELETE] /api/admin/agencia/tasks/${params.id}/evidence`;
  console.log(`${route} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de tarea inválido');

    const existing = await findTask(id);
    if (!existing) return notFound('Tarea no encontrada');
    if (!canWorkOnTask(user, existing)) return forbidden();

    const task = await prisma.task.update({
      where: { id },
      data: { evidenceUrl: null },
      include: TASK_INCLUDE,
    });
    await dropOldBlob(existing.evidenceUrl, route);

    return NextResponse.json({ data: task, error: null, message: 'Captura quitada' });
  } catch (error) {
    return serverError(route, error);
  }
}
