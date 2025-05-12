import { checkBasicAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Post, DomainCategories, Tag } from '@prisma/client';

type PostWithRelations = Post & {
  categories: DomainCategories[];
  tags: Tag[];
};

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
    const categoriesParam = searchParams.get('categories')?.split(',') || [];
    const tagsParam = searchParams.get('tags')?.split(',') || [];
    const domain = searchParams.get('domain') || 'default';

    const where: Prisma.PostWhereInput = {
      AND: [
        { domain: domain },
        search ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        categoriesParam.length > 0 ? {
          categories: {
            some: {
              id: { in: categoriesParam.map(Number) }
            }
          }
        } : {},
        tagsParam.length > 0 ? {
          tags: {
            some: {
              id: { in: tagsParam.map(Number) }
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

    return createResponse({ posts, total, totalPages: Math.ceil(total / per_page) }, null, 'Posts retrieved successfully', 200);
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

    // Ensure domain is provided or default
    const domain = body.domain || 'default';

    // Validate that categories exist for the given domain
    if (body.categories?.length) {
      const existingCategories = await prisma.domainCategories.findMany({
        where: { 
          AND: [
            { id: { in: body.categories } },
            { domain: domain }
          ]
        }
      });
      
      if (existingCategories.length !== body.categories.length) {
        const foundIds = existingCategories.map(c => c.id);
        const missingIds = body.categories.filter((id: number) => !foundIds.includes(id));
        return createResponse(null, 'Bad request', `Categories not found for domain ${domain}: ${missingIds.join(', ')}`, 400);
      }
    }

    // Validate that tags exist (assuming tags are not domain-specific for now)
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
      featuredMedia: body.featured_media || null,
      domain: domain,
      categories: body.categories?.length || 0,
      tags: body.tags?.length || 0
    });

    const newPostData: Prisma.PostCreateInput = {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || body.content.substring(0, 200) + '...',
        slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: body.status || 'publish',
        author: body.author || 1,
        featuredMedia: body.featured_media || null,
        domain: domain,
        categories: {
          connect: body.categories?.map((id: number) => ({ id })) || []
        },
        tags: {
          connect: body.tags?.map((id: number) => ({ id })) || []
        }
    };

    const newPost = await prisma.post.create({
      data: newPostData,
      include: {
        categories: true,
        tags: true
      }
    });

    // Cast to include relations for logging/response
    const newPostWithRelations = newPost as PostWithRelations;

    console.log('[POST] /api/wp/v2/posts - Post created successfully:', {
      id: newPostWithRelations.id,
      title: newPostWithRelations.title,
      categories: newPostWithRelations.categories.length,
      tags: newPostWithRelations.tags.length
    });

    return createResponse(newPostWithRelations, null, 'Post created successfully', 201);
  } catch (error: any) {
    console.error('[POST] /api/wp/v2/posts - Error creating post:', error);
    console.error('[POST] /api/wp/v2/posts - Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });

    // Handle potential Prisma unique constraint violation for slug
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return createResponse(null, 'Conflict', 'A post with this slug already exists.', 409);
    }

    return createResponse(null, 'Bad request', error?.message || 'Invalid request body', 400);
  }
}
