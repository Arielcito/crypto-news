import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectRequestDomain, getSiteIdentity } from "@/lib/seo";

// Sitemap de Google News: solo notas de las últimas 48 horas, máximo 1000.
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
export const dynamic = "force-dynamic";
export const revalidate = 600;

const WINDOW_MS = 48 * 60 * 60 * 1000;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const domain = detectRequestDomain();
  const identity = getSiteIdentity();
  const base = `https://${domain}`;
  const since = new Date(Date.now() - WINDOW_MS);

  let posts: Array<{
    title: string;
    slug: string;
    date: Date;
    categories: { slug: string }[];
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { domain, status: "publish", isActive: true, date: { gte: since } },
      select: {
        title: true,
        slug: true,
        date: true,
        categories: { select: { slug: true }, where: { isActive: true }, take: 1 },
      },
      orderBy: { date: "desc" },
      take: 1000,
    });
  } catch (error) {
    console.error("[news-sitemap] posts query failed:", error);
  }

  const urls = posts
    .filter((p) => p.categories.length > 0)
    .map((p) => {
      const loc = `${base}/${encodeURI(p.categories[0].slug)}/${encodeURI(p.slug)}`;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(identity.name)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${p.date.toISOString()}</news:publication_date>
      <news:title>${escapeXml(p.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
    },
  });
}
