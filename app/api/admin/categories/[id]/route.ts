import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import { updateCategorySchema } from '@/lib/validations/admin';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/categories/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid category ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const updated = await prisma.domainCategories.update({
      where: { id },
      data: parsed.data,
    });

    console.log(`[PUT] /api/admin/categories/${id} - Updated successfully`);
    return NextResponse.json({ data: updated, error: null, message: 'Category updated successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ data: null, error: 'Not found', message: 'Category not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { data: null, error: 'Conflict', message: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[PUT] /api/admin/categories/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/categories/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid category ID' }, { status: 400 });
  }

  try {
    const deleted = await prisma.domainCategories.update({
      where: { id },
      data: { isActive: false },
    });
    console.log(`[DELETE] /api/admin/categories/${id} - Soft-deleted successfully`);
    return NextResponse.json({ data: deleted, error: null, message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ data: null, error: 'Not found', message: 'Category not found' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[DELETE] /api/admin/categories/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
