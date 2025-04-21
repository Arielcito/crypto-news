import { NextRequest, NextResponse } from 'next/server';
import { checkBasicAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export async function PUT(request: NextRequest) {
  console.log(`[PUT] /api/wp/v2/posts/[id] - Request received`);
  
  if (!checkBasicAuth(request)) {
    console.log(`[PUT] /api/wp/v2/posts/[id] - Unauthorized`);
    return new NextResponse('Unauthorized', { status: 401 });
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
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`[PUT] /api/wp/v2/posts/[id] - Error:`, error);
    return new NextResponse('Post not found', { status: 404 });
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