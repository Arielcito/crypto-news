import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Link público del reporte en vivo de un cliente: `/reporte/<clientId>.<firma>`.
 * La firma es un HMAC del id con `SESSION_SECRET`, así que no hace falta tabla
 * ni migración y un token inválido se rechaza sin tocar la base.
 *
 * ponytail: no se puede revocar el link de un solo cliente; rotar SESSION_SECRET
 * los invalida a todos (y cierra todas las sesiones). Si hace falta revocar de a
 * uno, guardar un `reportNonce` por cliente y firmarlo junto con el id.
 */
function sign(clientId: number): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET no está configurado');
  return createHmac('sha256', secret).update(`agency-report:${clientId}`).digest('base64url');
}

export function reportToken(clientId: number): string {
  return `${clientId}.${sign(clientId)}`;
}

/** Devuelve el id del cliente si la firma es válida; `null` si no. */
export function verifyReportToken(token: string): number | null {
  const match = /^(\d{1,9})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return null;
  const clientId = Number(match[1]);
  const expected = Buffer.from(sign(clientId));
  const given = Buffer.from(match[2]);
  return expected.length === given.length && timingSafeEqual(expected, given) ? clientId : null;
}
