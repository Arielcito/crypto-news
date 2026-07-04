import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST() {
  console.log('[POST] /api/admin/logout - Request received');
  const session = await getAdminSession();
  session.destroy();
  console.log('[POST] /api/admin/logout - Session destroyed');
  return NextResponse.json({ data: null, error: null, message: 'Logout successful' });
}
