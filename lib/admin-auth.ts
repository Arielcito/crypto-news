import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { AdminSessionData, sessionOptions } from './session';

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(cookies(), sessionOptions);
}

export async function checkAdminSession(): Promise<boolean> {
  const session = await getAdminSession();
  return session.isLoggedIn === true;
}

export async function requireAdminAuth(): Promise<NextResponse | null> {
  const authorized = await checkAdminSession();
  if (!authorized) {
    return NextResponse.json(
      { data: null, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  return null;
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}
