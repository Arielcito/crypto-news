import { checkBasicAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Post, DomainCategories, Tag } from '@prisma/client';

type PostWithRelations = Post & {
  categories: DomainCategories[];
  tags: Tag[];
};

// Function to clean URLs by removing < > symbols
function cleanUrls(text: string): string {
  return text.replace(/<(https?:\/\/[^>]+)>/g, '$1');
}

// Function to clean post data
function cleanPostData(post: PostWithRelations): PostWithRelations {
  return {
    ...post,
    content: cleanUrls(post.content),
    excerpt: post.excerpt ? cleanUrls(post.excerpt) : post.excerpt,
    featuredMedia: post.featuredMedia ? cleanUrls(post.featuredMedia) : post.featuredMedia
  };
}

export async function GET(request: NextRequest) {
    try {
    const searchParams = request.nextUrl.searchParams;
    const per_page = parseInt(searchParams.get('per_page') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    
    // Validate and filter category IDs
    const categoriesParam = searchParams.get('categories')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
    
    // Validate and filter tag IDs
    const tagsParam = searchParams.get('tags')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
    
    const domain = searchParams.get('domain');

    const where: Prisma.PostWhereInput = {
      AND: [
        domain ? { domain } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        categoriesParam.length > 0 ? {
          categories: {
            some: {
              id: { in: categoriesParam }
            }
          }
        } : {},
        tagsParam.length > 0 ? {
          tags: {
            some: {
              id: { in: tagsParam }
            }
          }
        } : {}
      ].filter(condition => Object.keys(condition).length > 0) // Remove empty conditions
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: {
          date: 'desc'
        },
        include: {
          categories: true,
          tags: true
        }
      }),
      prisma.post.count({ where })
    ]);

    // Clean URLs from posts data
    console.log('[GET] /api/wp/v2/posts - Cleaning URLs from posts data by removing < > symbols');
    const cleanedPosts = posts.map(post => cleanPostData(post as PostWithRelations));

    const headers = new Headers();
    headers.set('X-WP-Total', total.toString());
    headers.set('X-WP-TotalPages', Math.ceil(total / per_page).toString());

    return Response.json({ posts: cleanedPosts, total, totalPages: Math.ceil(total / per_page) }, { status: 200 });
  } catch (error: any) {
    console.error('[GET] /api/wp/v2/posts - Error:', error);
    return Response.json({ error: 'Internal server error', message: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  
  if (!checkBasicAuth(request)) {
    return Response.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.title || !body.content) {
      return Response.json({ error: 'Bad request', message: 'Title and content are required' }, { status: 400 });
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
        return Response.json({ error: 'Bad request', message: `Categories not found for domain ${domain}: ${missingIds.join(', ')}` }, { status: 400 });
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
        return Response.json({ error: 'Bad request', message: `Tags not found: ${missingIds.join(', ')}` }, { status: 400 });
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

    return Response.json({ data: newPostWithRelations }, { status: 201 });
  } catch (error: any) {
    console.error('[POST] /api/wp/v2/posts - Error creating post:', error);

    // Handle potential Prisma unique constraint violation for slug
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return Response.json({ error: 'Conflict', message: 'A post with this slug already exists.' }, { status: 409 });
    }

    return Response.json({ error: 'Bad request', message: error?.message || 'Invalid request body' }, { status: 400 });
  }
}
