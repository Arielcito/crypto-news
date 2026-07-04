import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import { updateTagSchema } from '@/lib/validations/admin';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/tags/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid tag ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const updated = await prisma.tag.update({ where: { id }, data: parsed.data });
    console.log(`[PUT] /api/admin/tags/${id} - Updated successfully`);
    return NextResponse.json({ data: updated, error: null, message: 'Tag updated successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ data: null, error: 'Not found', message: 'Tag not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { data: null, error: 'Conflict', message: 'A tag with this slug already exists' },
          { status: 409 }
        );
      }
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[PUT] /api/admin/tags/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/tags/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid tag ID' }, { status: 400 });
  }

  try {
    await prisma.tag.delete({ where: { id } });
    console.log(`[DELETE] /api/admin/tags/${id} - Deleted successfully`);
    return NextResponse.json({ data: null, error: null, message: 'Tag deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ data: null, error: 'Not found', message: 'Tag not found' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[DELETE] /api/admin/tags/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
