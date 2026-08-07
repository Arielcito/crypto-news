import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import { createPostSchema } from '@/lib/validations/admin';
import {
  generateSlug,
  generateExcerpt,
  validateCategoriesForDomain,
  validateTagsExist,
} from '@/lib/services/posts-service';
import { notifyPostPublished } from '@/lib/services/discord';
import { ADMIN_DOMAIN } from '@/lib/constants';

export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/posts - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const per_page = parseInt(searchParams.get('per_page') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;

    const where: Prisma.PostWhereInput = {
      AND: [
        { domain: ADMIN_DOMAIN },
        { isActive: true },
        status ? { status } : {},
        search
          ? {
              OR: [
                { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {},
      ],
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { date: 'desc' },
        include: { categories: true, tags: true, authorRef: true },
      }),
      prisma.post.count({ where }),
    ]);

    console.log(`[GET] /api/admin/posts - Found ${total} posts`);
    return NextResponse.json({
      data: posts,
      error: null,
      message: null,
      total,
      totalPages: Math.ceil(total / per_page),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET] /api/admin/posts - Error:', message);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/posts - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[POST] /api/admin/posts - Validation failed');
      return NextResponse.json(
        { data: null, error: 'Bad request', message: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const input = parsed.data;

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

    const post = await prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || generateExcerpt(input.content),
        slug: input.slug || generateSlug(input.title),
        status: input.status,
        author: input.authorRefId ?? 1,
        authorRefId: input.authorRefId,
        featuredMedia: input.featuredMedia,
        featured: input.featured ?? false,
        domain: ADMIN_DOMAIN,
        categories: { connect: input.categories?.map((id) => ({ id })) || [] },
        tags: { connect: input.tags?.map((id) => ({ id })) || [] },
      },
      include: { categories: true, tags: true, authorRef: true },
    });

    console.log(`[POST] /api/admin/posts - Created post ${post.id}`);
    await notifyPostPublished(post);
    return NextResponse.json({ data: post, error: null, message: 'Post created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { data: null, error: 'Conflict', message: 'A post with this slug already exists' },
        { status: 409 }
      );
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[POST] /api/admin/posts - Error:', message);
    return NextResponse.json({ data: null, error: 'Bad request', message }, { status: 400 });
  }
}
