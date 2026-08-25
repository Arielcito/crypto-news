import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from './prisma';
import { AdminSessionData, sessionOptions } from './session';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}

export type AuthResult =
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse };

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(cookies(), sessionOptions);
}

/**
 * Usuario de la request, releído de la base. El rol de la cookie no se usa para
 * autorizar: si el admin baja a alguien de rango o lo desactiva, tiene efecto en
 * el request siguiente y no cuando venza la cookie.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getAdminSession();
  if (!session.isLoggedIn || !session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      sessionVersion: true,
    },
  });

  if (!user || !user.isActive) return null;
  if (user.sessionVersion !== session.sessionVersion) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function checkAdminSession(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { data: null, error: 'Unauthorized', message: 'Authentication required' },
    { status: 401 }
  );
}

export function forbidden(): NextResponse {
  return NextResponse.json(
    { data: null, error: 'Forbidden', message: 'No tenés permiso para esta acción' },
    { status: 403 }
  );
}

export function notFound(message = 'Recurso no encontrado'): NextResponse {
  return NextResponse.json({ data: null, error: 'Not found', message }, { status: 404 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ data: null, error: 'Bad request', message }, { status: 400 });
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ data: null, error: 'Conflict', message }, { status: 409 });
}

/** Los detalles del error se loguean; al cliente le va un mensaje genérico. */
export function serverError(scope: string, error: unknown): NextResponse {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`${scope} - Error:`, detail);
  return NextResponse.json(
    { data: null, error: 'Internal server error', message: 'Ocurrió un error inesperado' },
    { status: 500 }
  );
}

export interface AuthOptions {
  /**
   * Deja pasar a quien todavía tiene la contraseña temporal. Sólo para las dos
   * rutas que necesitan funcionar durante el cambio: `/api/admin/me` y
   * `/api/admin/password`. En el resto, una temporal sin cambiar es una
   * credencial que circuló por fuera del sistema y no autoriza nada.
   */
  allowPendingPassword?: boolean;
}

export function passwordChangeRequired(): NextResponse {
  return NextResponse.json(
    {
      data: null,
      error: 'Password change required',
      message: 'Cambiá tu contraseña temporal para seguir usando el panel',
    },
    { status: 403 }
  );
}

/** Cualquier usuario con sesión válida. */
export async function requireUser(options: AuthOptions = {}): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: unauthorized() };
  if (user.mustChangePassword && !options.allowPendingPassword) {
    return { user: null, error: passwordChangeRequired() };
  }
  return { user, error: null };
}

/** Sesión válida + rol ADMIN. 401 si no hay sesión, 403 si la hay pero no alcanza. */
export async function requireAdmin(options: AuthOptions = {}): Promise<AuthResult> {
  const { user, error } = await requireUser(options);
  if (!user) return { user: null, error };
  if (user.role !== Role.ADMIN) return { user: null, error: forbidden() };
  return { user, error: null };
}

/**
 * Compatibilidad con las rutas de contenido de bitcoinarg.news, que son
 * exclusivas del admin. Devuelve la respuesta de error o `null` si pasa.
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  const { error } = await requireAdmin();
  return error;
}

/**
 * Usuario para una página del panel. El middleware ya cortó a los anónimos; esto
 * es el segundo cerrojo para que un render nunca corra sin sesión si la ruta
 * quedara fuera del matcher.
 */
export async function requirePageUser(options: AuthOptions = {}): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (user.mustChangePassword && !options.allowPendingPassword) {
    redirect('/admin/cambiar-password');
  }
  return user;
}
