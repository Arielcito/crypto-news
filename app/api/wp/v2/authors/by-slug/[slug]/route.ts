import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get("domain") || undefined;

    const author = await prisma.author.findFirst({
      where: {
        slug: params.slug,
        isActive: true,
        ...(domain ? { domain } : {}),
      },
      include: {
        posts: {
          where: { status: "publish", ...(domain ? { domain } : {}) },
          orderBy: { date: "desc" },
          take: 50,
          include: {
            categories: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!author) {
      return Response.json(
        { data: null, error: "Not found", message: "Autor no encontrado" },
        { status: 404 },
      );
    }

    return Response.json(
      { data: author, error: null, message: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[GET] /api/wp/v2/authors/by-slug - Error:", message);
    return Response.json(
      { data: null, error: "Internal server error", message },
      { status: 500 },
    );
  }
}
