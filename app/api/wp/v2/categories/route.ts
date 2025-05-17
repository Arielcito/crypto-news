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

export async function POST(request: NextRequest) {
  console.log('[POST] /api/wp/v2/categories - Request received');
  
  try {
    const body = await request.json();
    const { name, slug, domain } = body;

    // Validate required fields
    if (!name || !slug || !domain) {
      return createResponse(null, 'Missing required fields', 'Name, slug, and domain are required', 400);
    }

    // Check if category with same slug exists in the domain
    const existingCategory = await prisma.domainCategories.findFirst({
      where: {
        slug,
        domain,
      },
    });

    if (existingCategory) {
      return createResponse(null, 'Category already exists', 'A category with this slug already exists in this domain', 409);
    }

    // Create new category
    const category = await prisma.domainCategories.create({
      data: {
        name,
        slug,
        domain,
        isActive: true,
      },
    });

    return createResponse(category, null, 'Category created successfully', 201);
  } catch (error: any) {
    console.error('[POST] /api/wp/v2/categories - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
}

export async function PUT(request: NextRequest) {
  console.log('[PUT] /api/wp/v2/categories - Request received');
  
  try {
    const body = await request.json();
    const { id, name, slug, domain, isActive } = body;

    // Validate required fields
    if (!id) {
      return createResponse(null, 'Missing required fields', 'Category ID is required', 400);
    }

    // Check if category exists
    const existingCategory = await prisma.domainCategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return createResponse(null, 'Category not found', 'Category does not exist', 404);
    }

    // Update category
    const updatedCategory = await prisma.domainCategories.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        domain: domain || existingCategory.domain,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
      },
    });

    return createResponse(updatedCategory, null, 'Category updated successfully');
  } catch (error: any) {
    console.error('[PUT] /api/wp/v2/categories - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  console.log('[DELETE] /api/wp/v2/categories - Request received');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return createResponse(null, 'Missing required fields', 'Category ID is required', 400);
    }

    // Check if category exists
    const existingCategory = await prisma.domainCategories.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      return createResponse(null, 'Category not found', 'Category does not exist', 404);
    }

    // Soft delete by setting isActive to false
    const deletedCategory = await prisma.domainCategories.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return createResponse(deletedCategory, null, 'Category deleted successfully');
  } catch (error: any) {
    console.error('[DELETE] /api/wp/v2/categories - Error:', error);
    return createResponse(null, 'Internal server error', error?.message, 500);
  }
} 