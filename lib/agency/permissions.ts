import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/lib/admin-auth';

/**
 * A qué clientes puede acceder un empleado: sólo aquellos donde tiene al menos
 * una tarea asignada. No hay tabla de asignación cliente↔empleado porque la
 * asignación real es la tarea; una tabla aparte sería un segundo estado que
 * mantener sincronizado.
 */
export async function clientIdsForUser(user: SessionUser): Promise<number[] | 'all'> {
  if (user.role === Role.ADMIN) return 'all';

  const rows = await prisma.task.findMany({
    where: { assigneeId: user.id },
    select: { package: { select: { clientId: true } } },
    distinct: ['packageId'],
  });

  return Array.from(new Set(rows.map((row) => row.package.clientId)));
}

export async function canAccessClient(user: SessionUser, clientId: number): Promise<boolean> {
  const allowed = await clientIdsForUser(user);
  return allowed === 'all' || allowed.includes(clientId);
}

/** Filtro Prisma para listados de clientes según el rol de quien pregunta. */
export async function clientScopeFilter(user: SessionUser) {
  const allowed = await clientIdsForUser(user);
  return allowed === 'all' ? {} : { id: { in: allowed } };
}
