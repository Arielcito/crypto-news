import bcrypt from 'bcryptjs';

/** Costo de bcrypt. 12 es el piso razonable en 2026 para un panel interno. */
const ROUNDS = 12;

export const MIN_PASSWORD_LENGTH = 8;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Contraseña temporal para un empleado nuevo. Se muestra UNA vez al admin y
 * obliga al cambio en el primer ingreso — nunca se guarda en claro.
 */
export function generateTemporaryPassword(): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}
