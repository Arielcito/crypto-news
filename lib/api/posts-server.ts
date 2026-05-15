import "server-only";

import { prisma } from "@/lib/prisma";
import type Post from "@/types/post";
import type { Author } from "@/types/author";

export type PostWithAuthor = Post & { authorRef: Author | null };

function cleanUrls(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<(https?:\/\/[^>]+)>/g, "$1");
}

export async function getPostBySlugServer(
  slug: string,
): Promise<PostWithAuthor | null> {
  const record = await prisma.post.findFirst({
    where: { slug },
    include: {
      categories: { select: { id: true, name: true, slug: true } },
      authorRef: true,
    },
  });

  if (!record) return null;

  return {
    id: record.id,
    title: record.title,
    excerpt: cleanUrls(record.excerpt),
    date: record.date.toISOString(),
    content: cleanUrls(record.content),
    categories: record.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    featuredMedia: cleanUrls(record.featuredMedia),
    slug: record.slug,
    domain: record.domain,
    authorRef: record.authorRef
      ? {
          id: record.authorRef.id,
          name: record.authorRef.name,
          slug: record.authorRef.slug,
          bio: record.authorRef.bio,
          avatar: record.authorRef.avatar,
          email: record.authorRef.email,
          twitter: record.authorRef.twitter,
          linkedin: record.authorRef.linkedin,
          website: record.authorRef.website,
          credentials: record.authorRef.credentials,
          jobTitle: record.authorRef.jobTitle,
          domain: record.authorRef.domain,
          isActive: record.authorRef.isActive,
        }
      : null,
  };
}

export async function getRecentPostsForRecommendations(
  domain: string,
  excludeSlug: string,
  limit = 10,
): Promise<Post[]> {
  const records = await prisma.post.findMany({
    where: { domain, status: "publish", slug: { not: excludeSlug } },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      categories: { select: { id: true, name: true, slug: true } },
    },
  });

  return records.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt ?? "",
    date: p.date.toISOString(),
    content: p.content,
    categories: p.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    featuredMedia: p.featuredMedia ?? "",
    slug: p.slug,
    domain: p.domain,
  }));
}
