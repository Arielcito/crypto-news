import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import { updatePostSchema } from '@/lib/validations/admin';
import { validateCategoriesForDomain, validateTagsExist } from '@/lib/services/posts-service';
import { ADMIN_DOMAIN } from '@/lib/constants';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[GET] /api/admin/posts/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const post = await prisma.post.findFirst({
      where: { id, isActive: true },
      include: { categories: true, tags: true, authorRef: true },
    });

    if (!post) {
      return NextResponse.json({ data: null, error: 'Not found', message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ data: post, error: null, message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[GET] /api/admin/posts/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/admin/posts/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const existing = await prisma.post.findFirst({ where: { id, isActive: true } });
    if (!existing) {
      return NextResponse.json({ data: null, error: 'Not found', message: 'Post not found' }, { status: 404 });
    }

    if (input.categories?.length) {
      const categoryValidation = await validateCategoriesForDomain(input.categories, ADMIN_DOMAIN);
      if (!categoryValidation.valid) {
        return NextResponse.json(
          { data: null, error: 'Bad request', message: `Categories not found: ${categoryValidation.missingIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    if (input.tags?.length) {
      const tagValidation = await validateTagsExist(input.tags);
      if (!tagValidation.valid) {
        return NextResponse.json(
          { data: null, error: 'Bad request', message: `Tags not found: ${tagValidation.missingIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const updateData: Prisma.PostUpdateInput = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      slug: input.slug,
      status: input.status,
      featuredMedia: input.featuredMedia,
      modified: new Date(),
      modifiedGmt: new Date(),
    };

    if (input.authorRefId !== undefined) {
      updateData.authorRef = { connect: { id: input.authorRefId } };
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    if (input.categories) {
      updateData.categories = { set: input.categories.map((cid) => ({ id: cid })) };
    }
    if (input.tags) {
      updateData.tags = { set: input.tags.map((tid) => ({ id: tid })) };
    }

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
      include: { categories: true, tags: true, authorRef: true },
    });

    console.log(`[PUT] /api/admin/posts/${id} - Updated successfully`);
    return NextResponse.json({ data: updated, error: null, message: 'Post updated successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ data: null, error: 'Not found', message: 'Post not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { data: null, error: 'Conflict', message: 'A post with this slug already exists' },
          { status: 409 }
        );
      }
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[PUT] /api/admin/posts/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE] /api/admin/posts/${params.id} - Request received`);
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ data: null, error: 'Bad request', message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const deleted = await prisma.post.update({
      where: { id },
      data: { isActive: false },
    });
    console.log(`[DELETE] /api/admin/posts/${id} - Soft-deleted successfully`);
    return NextResponse.json({ data: deleted, error: null, message: 'Post deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ data: null, error: 'Not found', message: 'Post not found' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[DELETE] /api/admin/posts/${params.id} - Error:`, message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
