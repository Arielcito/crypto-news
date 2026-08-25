import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  badRequest,
  forbidden,
  notFound,
  requireAdmin,
  requireUser,
  serverError,
} from '@/lib/admin-auth';
import { parseDueDate } from '@/lib/agency/dates';
import { completeTaskSchema, updateTaskSchema } from '@/lib/validations/admin';

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true } },
  package: {
    select: {
      id: true,
      month: true,
      clientId: true,
      client: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.TaskInclude;

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Editar el contenido de la tarea es del admin. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/agencia/tasks/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de tarea inválido');

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const { dueDate, ...rest } = parsed.data;
    const task = await prisma.task.update({
      where: { id },
      data: { ...rest, ...(dueDate ? { dueDate: parseDueDate(dueDate) } : {}) },
      include: TASK_INCLUDE,
    });

    return NextResponse.json({ data: task, error: null, message: 'Tarea actualizada' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return notFound('Tarea no encontrada');
      if (error.code === 'P2003') return notFound('El responsable no existe');
    }
    return serverError(`[PUT] /api/admin/agencia/tasks/${params.id}`, error);
  }
}

/**
 * Marcar hecha o volver a pendiente. Lo puede hacer el responsable —es el punto
 * del panel del empleado— o el admin. Nadie más, ni siquiera otro empleado.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PATCH] /api/admin/agencia/tasks/${params.id} - Request received`);
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de tarea inválido');

    const body = await request.json();
    const parsed = completeTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true, assigneeId: true, status: true, completedAt: true },
    });
    if (!existing) return notFound('Tarea no encontrada');
    if (user.role !== Role.ADMIN && existing.assigneeId !== user.id) return forbidden();

    const done = parsed.data.status === 'DONE';
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: parsed.data.status,
        // Si ya estaba hecha se respeta la fecha original: reabrir y volver a
        // cerrar no debería reescribir cuándo se entregó de verdad.
        completedAt: done ? existing.completedAt ?? new Date() : null,
        ...(parsed.data.permalink !== undefined ? { permalink: parsed.data.permalink } : {}),
      },
      include: TASK_INCLUDE,
    });

    console.log(`[PATCH] /api/admin/agencia/tasks/${id} - status=${task.status}`);
    return NextResponse.json({
      data: task,
      error: null,
      message: done ? 'Tarea completada' : 'Tarea reabierta',
    });
  } catch (error) {
    return serverError(`[PATCH] /api/admin/agencia/tasks/${params.id}`, error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/agencia/tasks/${params.id} - Request received`);
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = parseId(params.id);
    if (id === null) return badRequest('ID de tarea inválido');

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ data: null, error: null, message: 'Tarea eliminada' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return notFound('Tarea no encontrada');
    }
    return serverError(`[DELETE] /api/admin/agencia/tasks/${params.id}`, error);
  }
}
