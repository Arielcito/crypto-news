import type { Prisma } from '@prisma/client';
import type { SessionUser } from '@/lib/admin-auth';

export const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true } },
  coAssignee: { select: { id: true, name: true } },
  package: {
    select: {
      id: true,
      month: true,
      clientId: true,
      client: { select: { id: true, name: true, slug: true, requiresApproval: true } },
    },
  },
} satisfies Prisma.TaskInclude;

/** El admin o alguno de los dos responsables. Ningún otro empleado. */
export function canWorkOnTask(
  user: SessionUser,
  task: { assigneeId: number | null; coAssigneeId: number | null }
): boolean {
  return user.role === 'ADMIN' || task.assigneeId === user.id || task.coAssigneeId === user.id;
}

/** Vercel corta el body de una función en 4,5 MB: más grande ni llega a la ruta. */
export const MAX_EVIDENCE_SIZE = 4 * 1024 * 1024;

const startsWith = (bytes: Uint8Array, magic: number[], offset = 0) =>
  magic.every((byte, index) => bytes[offset + index] === byte);

/**
 * Tipo real de la captura según sus primeros bytes, no según el `content-type`
 * que manda el navegador (ver `looksLikePdf` en briefs). `null` = no es imagen.
 */
export function imageTypeOf(head: ArrayBuffer): { contentType: string; ext: string } | null {
  const bytes = new Uint8Array(head.slice(0, 12));
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { contentType: 'image/jpeg', ext: 'jpg' };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { contentType: 'image/png', ext: 'png' };
  }
  // RIFF....WEBP
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { contentType: 'image/webp', ext: 'webp' };
  }
  return null;
}

/** Las capturas importadas del Excel son links de Drive: ésas no se borran de Blob. */
export function isOwnBlob(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
