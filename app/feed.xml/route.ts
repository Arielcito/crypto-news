import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectRequestDomain, getSiteIdentity } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripMarkdown(text: string, max = 320): string {
  const stripped = text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max - 1)}…`;
}

export async function GET() {
  const domain = detectRequestDomain();
  const identity = getSiteIdentity();
  const base = `https://${domain}`;
  const feedUrl = `${base}/feed.xml`;

  let posts: Array<{
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    date: Date;
    modified: Date;
    featuredMedia: string | null;
    categories: { name: string; slug: string }[];
    authorRef: { name: string } | null;
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { domain, status: "publish" },
      orderBy: { date: "desc" },
      take: 50,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        date: true,
        modified: true,
        featuredMedia: true,
        categories: { select: { name: true, slug: true }, take: 3 },
        authorRef: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error("[feed.xml] posts query failed:", error);
  }

  const items = posts
    .filter((p) => p.categories.length > 0)
    .map((p) => {
      const categorySlug = p.categories[0].slug;
      const url = `${base}/${categorySlug}/${p.slug}`;
      const description = stripMarkdown(p.excerpt || p.content);
      const pubDate = (p.date ?? new Date()).toUTCString();
      const authorName = p.authorRef?.name ?? identity.name;
      const enclosure = p.featuredMedia
        ? `\n      <enclosure url="${escapeXml(p.featuredMedia)}" type="image/jpeg" />`
        : "";

      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
${p.categories
  .map((c) => `      <category>${escapeXml(c.name)}</category>`)
  .join("\n")}${enclosure}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = (posts[0]?.modified ?? new Date()).toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(identity.name)}</title>
    <link>${base}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(identity.description)}</description>
    <language>${identity.locale.split("_")[0]}</language>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(identity.legalName)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <image>
      <url>${base}${identity.logo}</url>
      <title>${escapeXml(identity.name)}</title>
      <link>${base}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
