import { NextRequest, NextResponse } from 'next/server';
import { checkBasicAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, Post, DomainCategories, Tag } from '@prisma/client';

type PostWithRelations = Post & {
  categories: DomainCategories[];
  tags: Tag[];
};

type PostResponse = {
  id: number;
  date: Date;
  dateGmt: Date;
  modified: Date;
  modifiedGmt: Date;
  slug: string;
  status: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: number;
  featuredMedia: number | null;
  domain: string;
  categories: DomainCategories[];
  tags: Tag[];
};

const createResponse = (data: any = null, error: string | null = null, message: string | null = null, status: number = 200) => {
  return NextResponse.json({ data, error, message }, { status });
};

export async function GET(request: NextRequest) {
  console.log(`[GET] /api/wp/v2/posts/[id] - Request received`);
  
  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
    console.log(`[GET] /api/wp/v2/posts/${id} - Fetching post`);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true
      }
    });

    if (!post) {
      console.log(`[GET] /api/wp/v2/posts/${id} - Post not found`);
      return new NextResponse('Post not found', { status: 404 });
    }

    console.log(`[GET] /api/wp/v2/posts/${id} - Post found`);
    return NextResponse.json(post);
  } catch (error) {
    console.error(`[GET] /api/wp/v2/posts/[id] - Error:`, error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PUT] /api/wp/v2/posts/${params.id} - Request received`);
  
  if (!checkBasicAuth(request)) {
    console.log(`[PUT] /api/wp/v2/posts/${params.id} - Unauthorized`);
    return createResponse(null, 'Unauthorized', 'Authentication required', 401);
  }

  try {
    const body = await request.json();
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return createResponse(null, 'Bad request', 'Invalid post ID', 400);
    }

    // Fetch the current post to get the domain if not provided in the body
    const currentPost = await prisma.post.findUnique({ where: { id } });
    if (!currentPost) {
      return createResponse(null, 'Not found', 'Post not found', 404);
    }
    const domain = body.domain || currentPost.domain;

    // Validate categories if provided
    if (body.categories?.length) {
      const existingCategories = await prisma.domainCategories.findMany({
        where: { 
          AND: [
            { id: { in: body.categories } },
            { domain: domain } // Use determined domain
          ]
        }
      });
      
      if (existingCategories.length !== body.categories.length) {
        const foundIds = existingCategories.map(c => c.id);
        const missingIds = body.categories.filter((catId: number) => !foundIds.includes(catId));
        return createResponse(null, 'Bad request', `Categories not found for domain ${domain}: ${missingIds.join(', ')}`, 400);
      }
    }

    // Validate tags if provided
    if (body.tags?.length) {
      // Assuming tags are global for now, adjust if tags are domain-specific like categories
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: body.tags } }
      });
      
      if (existingTags.length !== body.tags.length) {
        const foundIds = existingTags.map(t => t.id);
        const missingIds = body.tags.filter((tagId: number) => !foundIds.includes(tagId));
        return createResponse(null, 'Bad request', `Tags not found: ${missingIds.join(', ')}`, 400);
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
        // Allow clearing categories
        updateData.categories = { set: [] };
    }

    if (body.tags) {
      updateData.tags = {
        set: body.tags.map((id: number) => ({ id }))
      };
    } else if (body.tags === null || Array.isArray(body.tags) && body.tags.length === 0) {
       // Allow clearing tags
       updateData.tags = { set: [] };
    }
    
    // Ensure relational fields are not directly included in updateData if they are handled separately
    delete (updateData as any).categories;
    delete (updateData as any).tags;
    delete (updateData as any).featured_media; // Use mapped name


    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
        tags: true
      }
    });

    // Explicitly cast to PostWithRelations if needed, or ensure the response mapping is correct
    const typedUpdatedPost = updatedPost as PostWithRelations;

    const response = {
      id: typedUpdatedPost.id,
      date: typedUpdatedPost.date,
      dateGmt: typedUpdatedPost.dateGmt,
      modified: typedUpdatedPost.modified,
      modifiedGmt: typedUpdatedPost.modifiedGmt,
      slug: typedUpdatedPost.slug,
      status: typedUpdatedPost.status,
      title: typedUpdatedPost.title,
      content: typedUpdatedPost.content,
      excerpt: typedUpdatedPost.excerpt,
      author: typedUpdatedPost.author,
      featuredMedia: typedUpdatedPost.featuredMedia,
      domain: typedUpdatedPost.domain,
      // Map related data correctly
      categories: typedUpdatedPost.categories.map(c => c.id),
      tags: typedUpdatedPost.tags.map(t => t.id)
    }; // satisfies PostResponse; - Removed satisfies for flexibility, ensure type safety manually or adjust PostResponse

    console.log(`[PUT] /api/wp/v2/posts/${id} - Post updated successfully`);
    return createResponse(response, null, 'Post updated successfully');
  } catch (error: any) {
    console.error(`[PUT] /api/wp/v2/posts/${params.id} - Error:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return createResponse(null, 'Not found', 'Post not found', 404);
        }
        // Handle other specific Prisma errors if necessary
        console.error(`[PUT] /api/wp/v2/posts/${params.id} - Prisma Error Code: ${error.code}`);
    }
    // Log the specific error message for debugging
    console.error(`[PUT] /api/wp/v2/posts/${params.id} - Error Message: ${error?.message}`);
    return createResponse(null, 'Internal server error', error?.message || 'An unexpected error occurred', 500);
  }
}

export async function DELETE(request: NextRequest) {
  console.log(`[DELETE] /api/wp/v2/posts/[id] - Request received`);
  
  if (!checkBasicAuth(request)) {
    console.log(`[DELETE] /api/wp/v2/posts/[id] - Unauthorized`);
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
    console.log(`[DELETE] /api/wp/v2/posts/${id} - Deleting post`);

    await prisma.post.delete({
      where: { id }
    });

    console.log(`[DELETE] /api/wp/v2/posts/${id} - Post deleted successfully`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE] /api/wp/v2/posts/[id] - Error:`, error);
    return new NextResponse('Post not found', { status: 404 });
  }
} 