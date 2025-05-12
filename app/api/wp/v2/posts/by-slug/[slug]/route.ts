import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Post, DomainCategories, Tag } from '@prisma/client';

type PostWithRelations = Post & {
  categories: DomainCategories[];
  tags: Tag[];
};

const createResponse = (data: any = null, error: string | null = null, message: string | null = null, status: number = 200) => {
  return NextResponse.json({ data, error, message }, { status });
};

export async function GET(request: NextRequest) {
  console.log(`[GET] /api/wp/v2/posts/by-slug/[slug] - Request received`);
  
  try {
    const slug = request.nextUrl.pathname.split('/').pop() || '';

    console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Fetching post`);

    const post = await prisma.post.findFirst({
      where: { 
        slug
      },
      include: {
        categories: true,
        tags: true
      }
    });

    if (!post) {
      console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Post not found`);
      return createResponse(null, 'Not found', 'Post not found', 404);
    }

    console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Post found`);
    return createResponse(post, null, 'Post retrieved successfully');
  } catch (error) {
    console.error(`[GET] /api/wp/v2/posts/by-slug/[slug] - Error:`, error);
    return createResponse(null, 'Internal server error', error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
} 