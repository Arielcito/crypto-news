import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { checkBasicAuth } from '@/lib/auth';
import {
  PostWithRelations,
  cleanPostData,
  validateCategoriesForDomain,
  validateTagsExist,
} from '@/lib/services/posts-service';

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
        slug,
        isActive: true
      },
      include: {
        categories: true,
        tags: true,
        authorRef: true
      }
    });

    if (!post) {
      console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Post not found`);
      return createResponse(null, 'Not found', 'Post not found', 404);
    }

    // Clean URLs from post data
    console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Cleaning URLs from post data by removing < > symbols`);
    const cleanedPost = cleanPostData(post as PostWithRelations);

    console.log(`[GET] /api/wp/v2/posts/by-slug/${slug} - Post found`);
    return createResponse(cleanedPost, null, 'Post retrieved successfully');
  } catch (error) {
    console.error(`[GET] /api/wp/v2/posts/by-slug/[slug] - Error:`, error);
    return createResponse(null, 'Internal server error', error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
}

export async function PUT(request: NextRequest) {
  console.log(`[PUT] /api/wp/v2/posts/by-slug/[slug] - Request received`);
  
  if (!checkBasicAuth(request)) {
    console.log(`[PUT] /api/wp/v2/posts/by-slug/[slug] - Unauthorized`);
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    const slug = request.nextUrl.pathname.split('/').pop() || '';
    const body = await request.json();

    // Fetch the current post to get the domain if not provided in the body
    const currentPost = await prisma.post.findFirst({ 
      where: { slug },
      include: {
        categories: true,
        tags: true
      }
    });

    if (!currentPost) {
      return createResponse(null, 'Not found', 'Post not found', 404);
    }

    const domain = body.domain || currentPost.domain;

    // Validate categories if provided
    if (body.categories?.length) {
      const categoryValidation = await validateCategoriesForDomain(body.categories, domain);
      if (!categoryValidation.valid) {
        return createResponse(null, 'Bad request', `Categories not found for domain ${domain}: ${categoryValidation.missingIds.join(', ')}`, 400);
      }
    }

    // Validate tags if provided
    if (body.tags?.length) {
      const tagValidation = await validateTagsExist(body.tags);
      if (!tagValidation.valid) {
        return createResponse(null, 'Bad request', `Tags not found: ${tagValidation.missingIds.join(', ')}`, 400);
      }
    }

    const updateData: Prisma.PostUpdateInput = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      slug: body.slug,
      status: body.status,
      author: body.author,
      featuredMedia: body.featured_media,
      domain: body.domain,
      modified: new Date(),
      modifiedGmt: new Date()
    };

    // Remove undefined fields from updateData
    Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);

    if (body.categories) {
      updateData.categories = {
        set: body.categories.map((id: number) => ({ id }))
      };
    } else if (body.categories === null || Array.isArray(body.categories) && body.categories.length === 0) {
      updateData.categories = { set: [] };
    }

    if (body.tags) {
      updateData.tags = {
        set: body.tags.map((id: number) => ({ id }))
      };
    } else if (body.tags === null || Array.isArray(body.tags) && body.tags.length === 0) {
      updateData.tags = { set: [] };
    }

    const updatedPost = await prisma.post.update({
      where: { id: currentPost.id },
      data: updateData,
      include: {
        categories: true,
        tags: true
      }
    });

    // Clean URLs from updated post data
    console.log(`[PUT] /api/wp/v2/posts/by-slug/${slug} - Cleaning URLs from updated post data by removing < > symbols`);
    const cleanedUpdatedPost = cleanPostData(updatedPost as PostWithRelations);

    return createResponse(cleanedUpdatedPost, null, 'Post updated successfully');
  } catch (error: any) {
    console.error(`[PUT] /api/wp/v2/posts/by-slug/[slug] - Error:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return createResponse(null, 'Not found', 'Post not found', 404);
      }
      if (error.code === 'P2002') {
        return createResponse(null, 'Conflict', 'A post with this slug already exists', 409);
      }
    }
    return createResponse(null, 'Internal server error', error?.message || 'An unexpected error occurred', 500);
  }
}

export async function DELETE(request: NextRequest) {
  console.log(`[DELETE] /api/wp/v2/posts/by-slug/[slug] - Request received`);
  
  if (!checkBasicAuth(request)) {
    console.log(`[DELETE] /api/wp/v2/posts/by-slug/[slug] - Unauthorized`);
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    const slug = request.nextUrl.pathname.split('/').pop() || '';

    // First find the post to get its ID
    const post = await prisma.post.findFirst({
      where: { slug }
    });

    if (!post) {
      return createResponse(null, 'Not found', 'Post not found', 404);
    }

    // Delete the post using its ID
    await prisma.post.delete({
      where: { id: post.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE] /api/wp/v2/posts/by-slug/[slug] - Error:`, error);
    return createResponse(null, 'Internal server error', error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
} 