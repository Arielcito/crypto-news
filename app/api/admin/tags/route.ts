import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { createTagSchema } from '@/lib/validations/admin';
import { ADMIN_DOMAIN } from '@/lib/constants';

export async function GET() {
  console.log('[GET] /api/admin/tags - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const tags = await prisma.tag.findMany({
      where: { domain: ADMIN_DOMAIN },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: tags, error: null, message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET] /api/admin/tags - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/tags - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const existing = await prisma.tag.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Conflict', message: 'A tag with this slug already exists' },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: { ...parsed.data, domain: ADMIN_DOMAIN },
    });

    console.log(`[POST] /api/admin/tags - Created tag ${tag.id}`);
    return NextResponse.json({ data: tag, error: null, message: 'Tag created successfully' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[POST] /api/admin/tags - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
