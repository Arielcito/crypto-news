import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, serverError } from '@/lib/admin-auth';
import { verifyPassword } from '@/lib/password';
import { clientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations/admin';

/** 5 intentos por minuto por IP. Fuerza bruta contra un panel interno no pasa de acá. */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

/**
 * Segundo cerrojo, por cuenta: rotar IPs es barato, así que el límite por IP
 * solo no protege a un usuario concreto. Es más flojo que el de IP para no
 * dejar afuera a una oficina entera detrás de una misma salida.
 */
const MAX_ATTEMPTS_PER_EMAIL = 10;
const EMAIL_WINDOW_MS = 5 * 60_000;

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/login - Request received');

  try {
    const ip = clientIp(request);
    const limit = rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
    if (!limit.allowed) {
      console.warn(`[POST] /api/admin/login - Rate limited ${ip}`);
      return NextResponse.json(
        {
          data: null,
          error: 'Too many requests',
          message: `Demasiados intentos. Probá de nuevo en ${limit.retryAfter} segundos.`,
        },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[POST] /api/admin/login - Invalid payload');
      return NextResponse.json(
        { data: null, error: 'Bad request', message: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const emailLimit = rateLimit(`login-email:${email}`, MAX_ATTEMPTS_PER_EMAIL, EMAIL_WINDOW_MS);
    if (!emailLimit.allowed) {
      console.warn('[POST] /api/admin/login - Rate limited por cuenta');
      return NextResponse.json(
        {
          data: null,
          error: 'Too many requests',
          message: `Demasiados intentos. Probá de nuevo en ${emailLimit.retryAfter} segundos.`,
        },
        { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Mismo mensaje para usuario inexistente, inactivo y contraseña mala: no se
    // le confirma a nadie qué emails existen en el panel.
    const valid = user?.isActive
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !valid) {
      console.log('[POST] /api/admin/login - Invalid credentials');
      return NextResponse.json(
        { data: null, error: 'Unauthorized', message: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const session = await getAdminSession();
    session.isLoggedIn = true;
    session.userId = user.id;
    session.role = user.role;
    session.sessionVersion = user.sessionVersion;
    session.mustChangePassword = user.mustChangePassword;
    await session.save();
    resetRateLimit(`login:${ip}`);
    resetRateLimit(`login-email:${email}`);

    console.log(`[POST] /api/admin/login - Login successful user=${user.id} role=${user.role}`);
    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      error: null,
      message: 'Login successful',
    });
  } catch (error) {
    return serverError('[POST] /api/admin/login', error);
  }
}
