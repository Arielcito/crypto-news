import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const createResponse = (data: any = null, error: string | null = null, message: string | null = null, status: number = 200) => {
  return Response.json({ data, error, message }, { status });
};

export async function GET(request: NextRequest) {
  console.log('[GET] /api/wp/v2/categories - Request received');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');

    const where: Prisma.DomainCategoriesWhereInput = {
      AND: [
        domain ? { domain } : {},
        { isActive: true },
        search ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {}
      ]
    };

    const categories = await prisma.domainCategories.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    return createResponse({ 
      categories,
      total: categories.length
    }, null, 'Categories retrieved successfully');
  } catch (error: any) {
    console.error('[GET] /api/wp/v2/categories - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
} 