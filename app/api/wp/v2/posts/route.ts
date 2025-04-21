import { checkBasicAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const createResponse = (data: any = null, error: string | null = null, message: string | null = null, status: number = 200) => {
  return Response.json({ data, error, message }, { status });
};

export async function GET(request: NextRequest) {
  console.log('[GET] /api/wp/v2/posts - Request received');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const per_page = parseInt(searchParams.get('per_page') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',') || [];
    const tags = searchParams.get('tags')?.split(',') || [];

    const where: Prisma.PostWhereInput = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        categories.length > 0 ? {
          categories: {
            some: {
              id: { in: categories.map(Number) }
            }
          }
        } : {},
        tags.length > 0 ? {
          tags: {
            some: {
              id: { in: tags.map(Number) }
            }
          }
        } : {}
      ]
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        include: {
          categories: true,
          tags: true
        }
      }),
      prisma.post.count({ where })
    ]);

    const headers = new Headers();
    headers.set('X-WP-Total', total.toString());
    headers.set('X-WP-TotalPages', Math.ceil(total / per_page).toString());

    return createResponse({ posts, total, totalPages: Math.ceil(total / per_page) }, null, 'Posts retrieved successfully');
  } catch (error: any) {
    console.error('[GET] /api/wp/v2/posts - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/wp/v2/posts - Request received');
  
  if (!checkBasicAuth(request)) {
    console.log('[POST] /api/wp/v2/posts - Unauthorized request');
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    console.log('[POST] /api/wp/v2/posts - Parsing request body');
    const body = await request.json();
    console.log('[POST] /api/wp/v2/posts - Request body:', JSON.stringify(body, null, 2));
    
    if (!body.title || !body.content) {
      console.log('[POST] /api/wp/v2/posts - Missing required fields:', {
        hasTitle: !!body.title,
        hasContent: !!body.content
      });
      return createResponse(null, 'Bad request', 'Title and content are required', 400);
    }

    // Validar que las categorías existan
    if (body.categories?.length) {
      const existingCategories = await prisma.domainCategories.findMany({
        where: { 
          AND: [
            { id: { in: body.categories } },
            { domain: body.domain || 'default' }
          ]
        }
      });
      
      if (existingCategories.length !== body.categories.length) {
        const foundIds = existingCategories.map(c => c.id);
        const missingIds = body.categories.filter((id: number) => !foundIds.includes(id));
        return createResponse(null, 'Bad request', `Categories not found: ${missingIds.join(', ')}`, 400);
      }
    }

    // Validar que los tags existan
    if (body.tags?.length) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: body.tags } }
      });
      
      if (existingTags.length !== body.tags.length) {
        const foundIds = existingTags.map(t => t.id);
        const missingIds = body.tags.filter((id: number) => !foundIds.includes(id));
        return createResponse(null, 'Bad request', `Tags not found: ${missingIds.join(', ')}`, 400);
      }
    }

    console.log('[POST] /api/wp/v2/posts - Creating post with data:', {
      title: body.title,
      contentLength: body.content.length,
      excerpt: body.excerpt ? body.excerpt.length : 'auto-generated',
      slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: body.status || 'publish',
      author: body.author || 1,
      featuredMedia: body.featured_media || 0,
      domain: body.domain || 'default',
      categories: body.categories?.length || 0,
      tags: body.tags?.length || 0
    });

    const newPost = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || body.content.substring(0, 200) + '...',
        slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: body.status || 'publish',
        author: body.author || 1,
        featuredMedia: body.featured_media || 0,
        domain: body.domain || 'default',
        categories: {
          connect: body.categories?.map((id: number) => ({ id })) || []
        },
        tags: {
          connect: body.tags?.map((id: number) => ({ id })) || []
        }
      },
      include: {
        categories: true,
        tags: true
      }
    });

    console.log('[POST] /api/wp/v2/posts - Post created successfully:', {
      id: newPost.id,
      title: newPost.title,
      categories: newPost.categories.length,
      tags: newPost.tags.length
    });

    return createResponse(newPost, null, 'Post created successfully', 201);
  } catch (error: any) {
    console.error('[POST] /api/wp/v2/posts - Error creating post:', error);
    console.error('[POST] /api/wp/v2/posts - Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return createResponse(null, 'Bad request', error?.message || 'Invalid request body', 400);
  }
}

export async function PUT(request: NextRequest) {
  console.log('[PUT] /api/wp/v2/posts/[id] - Request received');
  
  if (!checkBasicAuth(request)) {
    console.log('[PUT] /api/wp/v2/posts/[id] - Unauthorized');
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    const body = await request.json();
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
    console.log(`[PUT] /api/wp/v2/posts/${id} - Updating post`);

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body,
        modified: new Date(),
        modifiedGmt: new Date(),
        categories: body.categories ? {
          set: body.categories.map((id: number) => ({ id }))
        } : undefined,
        tags: body.tags ? {
          set: body.tags.map((id: number) => ({ id }))
        } : undefined
      },
      include: {
        categories: true,
        tags: true
      }
    });

    console.log(`[PUT] /api/wp/v2/posts/${id} - Post updated successfully`);
    return createResponse(updatedPost, null, 'Post updated successfully');
  } catch (error: any) {
    console.error(`[PUT] /api/wp/v2/posts/[id] - Error:`, error);
    return createResponse(null, 'Not found', error?.message || 'Post not found', 404);
  }
}

export async function DELETE(request: NextRequest) {
  console.log('[DELETE] /api/wp/v2/posts/[id] - Request received');
  
  if (!checkBasicAuth(request)) {
    console.log('[DELETE] /api/wp/v2/posts/[id] - Unauthorized');
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
    console.log(`[DELETE] /api/wp/v2/posts/${id} - Deleting post`);

    await prisma.post.delete({
      where: { id }
    });

    console.log(`[DELETE] /api/wp/v2/posts/${id} - Post deleted successfully`);
    return createResponse(null, null, 'Post deleted successfully', 204);
  } catch (error: any) {
    console.error(`[DELETE] /api/wp/v2/posts/[id] - Error:`, error);
    return createResponse(null, 'Not found', error?.message || 'Post not found', 404);
  }
} 