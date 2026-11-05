import { checkBasicAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { slugVariants } from '@/lib/utils';
import { PostWithRelations, cleanPostData } from '@/lib/services/posts-service';
import { PostInputError, createPost } from '@/lib/services/create-post';

// Generar la portada con Gemini tarda entre 10 y 30 segundos.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
    const searchParams = request.nextUrl.searchParams;
    const per_page = parseInt(searchParams.get('per_page') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    
    // Handle categories parameter - can be IDs or slugs
    const categoriesParam = searchParams.get('categories')?.split(',') || [];
    let categoryFilter = {};
    
    if (categoriesParam.length > 0) {
      // Detect if we have IDs (numbers) or slugs (strings)
      const categoryIds = categoriesParam.map(Number).filter(id => !isNaN(id));
      const categorySlugs = categoriesParam.filter(param => isNaN(Number(param)));
      
      console.log('[GET] /api/wp/v2/posts - Detected category IDs:', categoryIds);
      console.log('[GET] /api/wp/v2/posts - Detected category slugs:', categorySlugs);
      
      // Expand slugs to include accent variants (e.g. "regulación" + "regulacion")
      const expandedSlugs = categorySlugs.flatMap(slugVariants);

      if (categoryIds.length > 0 && expandedSlugs.length > 0) {
        // Mixed IDs and slugs
        console.log('[GET] /api/wp/v2/posts - Using mixed ID and slug filter');
        categoryFilter = {
          categories: {
            some: {
              OR: [
                { id: { in: categoryIds } },
                { slug: { in: expandedSlugs } }
              ]
            }
          }
        };
      } else if (categoryIds.length > 0) {
        // Only IDs
        console.log('[GET] /api/wp/v2/posts - Using ID filter');
        categoryFilter = {
          categories: {
            some: {
              id: { in: categoryIds }
            }
          }
        };
      } else if (expandedSlugs.length > 0) {
        // Only slugs
        console.log('[GET] /api/wp/v2/posts - Using slug filter (with accent variants):', expandedSlugs);
        categoryFilter = {
          categories: {
            some: {
              slug: { in: expandedSlugs }
            }
          }
        };
      }
    }
    
    // Validate and filter tag IDs
    const tagsParam = searchParams.get('tags')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
    
    const domain = searchParams.get('domain');

    const where: Prisma.PostWhereInput = {
      AND: [
        { isActive: true },
        // Endpoint público: los borradores sólo se ven desde /api/admin.
        { status: 'publish' },
        domain ? { domain } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        categoryFilter,
        tagsParam.length > 0 ? {
          tags: {
            some: {
              id: { in: tagsParam }
            }
          }
        } : {}
      ].filter(condition => Object.keys(condition).length > 0) // Remove empty conditions
    };

    console.log('[GET] /api/wp/v2/posts - Filtering posts with categories parameter:', categoriesParam);

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

    return Response.json(
      { posts: cleanedPosts, total, totalPages: Math.ceil(total / per_page) },
      {
        status: 200,
        headers: {
          'X-WP-Total': total.toString(),
          'X-WP-TotalPages': Math.ceil(total / per_page).toString(),
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, s-maxage=60',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
        },
      }
    );
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

    const { post, cover } = await createPost({
      title: String(body.title),
      content: String(body.content),
      excerpt: typeof body.excerpt === 'string' ? body.excerpt : undefined,
      domain: body.domain || 'default',
      status: body.status,
      author: body.author,
      categories: body.categories,
      tags: body.tags,
      featuredMedia: body.featured_media,
      mirrorMedia: body.mirror_media !== false,
    });

    return Response.json({ data: post, cover }, { status: 201 });
  } catch (error: any) {
    console.error('[POST] /api/wp/v2/posts - Error creating post:', error);

    if (error instanceof PostInputError) {
      return Response.json({ error: 'Bad request', message: error.message }, { status: 400 });
    }

    // Handle potential Prisma unique constraint violation for slug
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return Response.json({ error: 'Conflict', message: 'A post with this slug already exists.' }, { status: 409 });
    }

    return Response.json({ error: 'Bad request', message: error?.message || 'Invalid request body' }, { status: 400 });
  }
}
