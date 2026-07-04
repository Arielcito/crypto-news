import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { createCategorySchema } from '@/lib/validations/admin';
import { ADMIN_DOMAIN } from '@/lib/constants';

export async function GET() {
  console.log('[GET] /api/admin/categories - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const categories = await prisma.domainCategories.findMany({
      where: { domain: ADMIN_DOMAIN, isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: categories, error: null, message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET] /api/admin/categories - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/categories - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const existing = await prisma.domainCategories.findFirst({
      where: { slug: parsed.data.slug, domain: ADMIN_DOMAIN },
    });

    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Conflict', message: 'A category with this slug already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.domainCategories.create({
      data: { ...parsed.data, domain: ADMIN_DOMAIN, isActive: true },
    });

    console.log(`[POST] /api/admin/categories - Created category ${category.id}`);
    return NextResponse.json({ data: category, error: null, message: 'Category created successfully' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[POST] /api/admin/categories - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
