import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { badRequest, notFound, requireAdmin, requireUser, serverError } from '@/lib/admin-auth';
import { parseDueDate } from '@/lib/agency/dates';
import { createTaskSchema, taskFiltersSchema } from '@/lib/validations/admin';

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

/** Los query params llegan como texto; el schema pide números. */
function numberParam(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw === '') return undefined;
  return Number(raw);
}

export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/agencia/tasks - Request received');
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const search = request.nextUrl.searchParams;
    const parsed = taskFiltersSchema.safeParse({
      clientId: numberParam(search, 'clientId'),
      assigneeId: numberParam(search, 'assigneeId'),
      packageId: numberParam(search, 'packageId'),
      status: search.get('status') ?? undefined,
      network: search.get('network') ?? undefined,
      page: numberParam(search, 'page') ?? 1,
      perPage: numberParam(search, 'perPage') ?? 20,
    });
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const { page, perPage, clientId, assigneeId, status, network, packageId } = parsed.data;

    // El empleado ve SÓLO lo suyo. No es un default que el cliente pueda pisar
    // mandando otro assigneeId: el filtro se impone después de leer el suyo.
    const scopedAssignee = user.role === Role.ADMIN ? assigneeId : user.id;

    const where: Prisma.TaskWhereInput = {
      ...(scopedAssignee ? { assigneeId: scopedAssignee } : {}),
      ...(status ? { status } : {}),
      ...(network ? { network } : {}),
      ...(packageId ? { packageId } : {}),
      ...(clientId ? { package: { clientId } } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        // Pendientes primero y por vencimiento: lo que está por vencer arriba.
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.task.count({ where }),
    ]);

    console.log(`[GET] /api/admin/agencia/tasks - Returning ${tasks.length}/${total}`);
    return NextResponse.json({
      data: { tasks, total, page, perPage },
      error: null,
      message: null,
    });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/tasks', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/tasks - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const task = await prisma.task.create({
      data: {
        packageId: parsed.data.packageId,
        title: parsed.data.title.trim(),
        network: parsed.data.network,
        format: parsed.data.format.trim(),
        dueDate: parseDueDate(parsed.data.dueDate),
        assigneeId: parsed.data.assigneeId ?? null,
        notes: parsed.data.notes ?? null,
      },
      include: TASK_INCLUDE,
    });

    console.log(`[POST] /api/admin/agencia/tasks - Created task ${task.id}`);
    return NextResponse.json({ data: task, error: null, message: 'Tarea creada' }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return notFound('El paquete o el responsable no existen');
    }
    return serverError('[POST] /api/admin/agencia/tasks', error);
  }
}
