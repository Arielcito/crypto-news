import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, verifyAdminCredentials } from '@/lib/admin-auth';
import { loginSchema } from '@/lib/validations/admin';

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/login - Request received');

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[POST] /api/admin/login - Invalid payload');
      return NextResponse.json(
        { data: null, error: 'Bad request', message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    if (!verifyAdminCredentials(username, password)) {
      console.log('[POST] /api/admin/login - Invalid credentials');
      return NextResponse.json(
        { data: null, error: 'Unauthorized', message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const session = await getAdminSession();
    session.isLoggedIn = true;
    session.username = username;
    await session.save();

    console.log('[POST] /api/admin/login - Login successful');
    return NextResponse.json({ data: { username }, error: null, message: 'Login successful' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[POST] /api/admin/login - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
