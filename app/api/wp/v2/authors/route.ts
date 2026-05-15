import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get("domain") || undefined;
    const includePostCount = searchParams.get("include_post_count") === "true";

    const authors = await prisma.author.findMany({
      where: { isActive: true, ...(domain ? { domain } : {}) },
      orderBy: { name: "asc" },
      ...(includePostCount
        ? { include: { _count: { select: { posts: true } } } }
        : {}),
    });

    return Response.json(
      { data: authors, error: null, message: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[GET] /api/wp/v2/authors - Error:", message);
    return Response.json(
      { data: null, error: "Internal server error", message },
      { status: 500 },
    );
  }
}
