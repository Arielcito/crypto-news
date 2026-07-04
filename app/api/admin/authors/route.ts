import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ADMIN_DOMAIN } from '@/lib/constants';

export async function GET() {
  console.log('[GET] /api/admin/authors - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const authors = await prisma.author.findMany({
      where: { domain: ADMIN_DOMAIN, isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: authors, error: null, message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET] /api/admin/authors - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
