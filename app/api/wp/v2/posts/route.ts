import { NextRequest } from 'next/server';
import { checkBasicAuth } from '@/lib/auth';
import { Post } from '@/types/wordpress';

// Simular una base de datos en memoria
let posts: Post[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const per_page = parseInt(searchParams.get('per_page') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categories = searchParams.get('categories')?.split(',') || [];
  const tags = searchParams.get('tags')?.split(',') || [];

  // Filtrar posts
  let filteredPosts = [...posts];

  if (search) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.rendered.toLowerCase().includes(search.toLowerCase()) ||
      post.content.rendered.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (categories.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      categories.some(cat => post.categories.includes(parseInt(cat)))
    );
  }

  if (tags.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      tags.some(tag => post.tags.includes(parseInt(tag)))
    );
  }

  // Paginación
  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paginatedPosts = filteredPosts.slice(start, end);

  // Headers de WordPress
  const headers = new Headers();
  headers.set('X-WP-Total', filteredPosts.length.toString());
  headers.set('X-WP-TotalPages', Math.ceil(filteredPosts.length / per_page).toString());

  return Response.json(paginatedPosts, { headers });
}

export async function POST(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.title || !body.content) {
      return new Response('Title and content are required', { status: 400 });
    }

    const newPost: Post = {
      id: posts.length + 1,
      date: new Date().toISOString(),
      date_gmt: new Date().toISOString(),
      modified: new Date().toISOString(),
      modified_gmt: new Date().toISOString(),
      password: '',
      slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: body.status || 'publish',
      type: 'post',
      title: {
        rendered: body.title
      },
      content: {
        rendered: body.content,
        protected: false
      },
      excerpt: {
        rendered: body.excerpt || body.content.substring(0, 200) + '...',
        protected: false
      },
      author: body.author || 1,
      featured_media: body.featured_media || 0,
      comment_status: body.comment_status || 'open',
      ping_status: body.ping_status || 'open',
      sticky: body.sticky || false,
      template: body.template || '',
      format: body.format || 'standard',
      meta: body.meta || [],
      categories: body.categories || [],
      tags: body.tags || []
    };

    posts.push(newPost);

    return Response.json(newPost, { status: 201 });
  } catch (error) {
    return new Response('Invalid request body', { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');

    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return new Response('Post not found', { status: 404 });
    }

    const updatedPost = {
      ...posts[postIndex],
      ...body,
      modified: new Date().toISOString(),
      modified_gmt: new Date().toISOString()
    };

    posts[postIndex] = updatedPost;

    return Response.json(updatedPost);
  } catch (error) {
    return new Response('Invalid request body', { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = parseInt(request.nextUrl.pathname.split('/').pop() || '0');
  const postIndex = posts.findIndex(post => post.id === id);

  if (postIndex === -1) {
    return new Response('Post not found', { status: 404 });
  }

  posts.splice(postIndex, 1);

  return new Response(null, { status: 204 });
} 