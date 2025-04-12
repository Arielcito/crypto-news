import { NextRequest, NextResponse } from 'next/server';
import { checkBasicAuth } from '@/lib/auth';
import { Post } from '@/types/wordpress';

// Simular una base de datos en memoria
let posts: Post[] = [];

export async function GET(request: NextRequest) {
  const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
  const post = posts.find(p => p.id === id);

  if (!post) {
    return new NextResponse('Post not found', { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');

    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return new NextResponse('Post not found', { status: 404 });
    }

    const updatedPost = {
      ...posts[postIndex],
      ...body,
      modified: new Date().toISOString(),
      modified_gmt: new Date().toISOString()
    };

    posts[postIndex] = updatedPost;

    return NextResponse.json(updatedPost);
  } catch (error) {
    return new NextResponse('Invalid request body', { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
  const postIndex = posts.findIndex(post => post.id === id);

  if (postIndex === -1) {
    return new NextResponse('Post not found', { status: 404 });
  }

  posts.splice(postIndex, 1);

  return new NextResponse(null, { status: 204 });
} 