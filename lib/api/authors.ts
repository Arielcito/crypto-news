import { prisma } from "@/lib/prisma";
import type { Author } from "@/types/author";
import type Post from "@/types/post";

export type AuthorWithPosts = Author & { posts: Post[] };

function serializeAuthor(
  author: {
    id: number;
    name: string;
    slug: string;
    bio: string | null;
    avatar: string | null;
    email: string | null;
    twitter: string | null;
    linkedin: string | null;
    website: string | null;
    credentials: string | null;
    jobTitle: string | null;
    domain: string;
    isActive: boolean;
  },
): Author {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    avatar: author.avatar,
    email: author.email,
    twitter: author.twitter,
    linkedin: author.linkedin,
    website: author.website,
    credentials: author.credentials,
    jobTitle: author.jobTitle,
    domain: author.domain,
    isActive: author.isActive,
  };
}

export async function getAuthorWithPosts(
  slug: string,
  domain: string,
): Promise<AuthorWithPosts | null> {
  let record;
  try {
    record = await prisma.author.findFirst({
      where: { slug, domain, isActive: true },
      include: {
        posts: {
          where: { status: "publish", domain },
          orderBy: { date: "desc" },
          take: 50,
          include: {
            categories: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error("[authors] getAuthorWithPosts failed:", error);
    return null;
  }

  if (!record) return null;

  const author = serializeAuthor(record);
  const posts: Post[] = record.posts.map((p) => ({
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

  return { ...author, posts };
}

// Firma de las notas que entran sin autor (ingesta automática, admin sin elegir).
const DEFAULT_AUTHOR_SLUG: Partial<Record<string, string>> = {
  "bitcoinarg.news": "franco-villabona",
};

// Nunca lanza: sin autor la nota se publica igual, perderla es peor.
export async function getDefaultAuthorId(domain: string): Promise<number | null> {
  const slug = DEFAULT_AUTHOR_SLUG[domain];
  if (!slug) return null;
  try {
    const author = await prisma.author.findFirst({
      where: { domain, slug, isActive: true },
      select: { id: true },
    });
    if (!author) console.warn(`[authors] autor por defecto "${slug}" no existe en ${domain}`);
    return author?.id ?? null;
  } catch (error) {
    console.error("[authors] getDefaultAuthorId failed:", error);
    return null;
  }
}

export async function listActiveAuthors(domain: string): Promise<Author[]> {
  try {
    const records = await prisma.author.findMany({
      where: { domain, isActive: true },
      orderBy: { name: "asc" },
    });
    return records.map(serializeAuthor);
  } catch (error) {
    console.error("[authors] listActiveAuthors failed:", error);
    return [];
  }
}
