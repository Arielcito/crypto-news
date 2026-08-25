import { SessionOptions } from 'iron-session';
import type { Role } from '@prisma/client';

/**
 * Lo que viaja en la cookie. `role` está acá sólo para que el middleware pueda
 * hacer un gate barato en el edge sin tocar la base: NO se confía para
 * autorizar. La verificación real relee el User en cada request server-side
 * (ver `getCurrentUser` en lib/admin-auth.ts).
 */
export interface AdminSessionData {
  isLoggedIn: boolean;
  userId?: number;
  role?: Role;
  /** Se compara contra User.sessionVersion: cambiar la password mata la sesión. */
  sessionVersion?: number;
  /**
   * Copia del flag de la base, igual que `role`: sirve para que el middleware
   * mande a cambiar la contraseña sin consultar Postgres. La verdad la tiene
   * `User.mustChangePassword`, que es lo que chequean `requireUser` y las páginas.
   */
  mustChangePassword?: boolean;
}

export const defaultSession: AdminSessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
};
