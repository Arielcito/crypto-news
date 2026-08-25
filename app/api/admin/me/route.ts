import { NextResponse } from 'next/server';
import { requireUser, serverError } from '@/lib/admin-auth';

/** Quién soy, según la base — no según lo que diga la cookie. */
export async function GET() {
  try {
    const { user, error } = await requireUser({ allowPendingPassword: true });
    if (error) return error;

    return NextResponse.json({ data: user, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/me', error);
  }
}
