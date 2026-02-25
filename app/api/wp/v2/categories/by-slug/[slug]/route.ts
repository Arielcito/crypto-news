import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugVariants } from '@/lib/utils';

const createResponse = (data: any = null, error: string | null = null, message: string | null = null, status: number = 200) => {
  return Response.json({ data, error, message }, { status });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  console.log('[GET] /api/wp/v2/categories/by-slug/[slug] - Request received');

  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const variants = slugVariants(slug);

    const category = await prisma.domainCategories.findFirst({
      where: {
        slug: { in: variants },
        isActive: true,
        ...(domain ? { domain } : {})
      }
    });

    if (!category) {
      return createResponse(null, 'Category not found', `Category with slug "${slug}" not found`, 404);
    }

    return createResponse(category, null, 'Category retrieved successfully');
  } catch (error: any) {
    console.error('[GET] /api/wp/v2/categories/by-slug/[slug] - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
} 