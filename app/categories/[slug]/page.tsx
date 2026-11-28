import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BackButton from "@/components/back";
import Post from "@/types/post";
import { PostCard } from "@/app/posts/post-card";
import { JsonLd } from "@/components/json-ld";
import { prisma } from "@/lib/prisma";
import { removeAccents } from "@/lib/utils";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  detectRequestDomain,
  getSiteIdentity,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 30;

/** "Regulación", "regulacion" y "regulaci%C3%B3n" son la misma categoría. */
function normalizeSlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Un % suelto: se usa tal cual.
  }
  return removeAccents(decoded).toLowerCase();
}

/**
 * Junta todas las categorías activas del dominio que coinciden sin tildes ni
 * mayúsculas. Hay categorías viejas duplicadas (por ejemplo `regulacion` vacía y
 * `regulación` con las notas), y el menú linkea la versión sin tilde.
 */
async function resolveCategory(slug: string) {
  const domain = detectRequestDomain();
  const wanted = normalizeSlug(slug);

  const candidates = await prisma.domainCategories.findMany({
    where: { domain, isActive: true },
    select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
  });
  const matches = candidates.filter((c) => normalizeSlug(c.slug) === wanted);
  if (matches.length === 0) return null;

  // El nombre visible sale de la que más notas tiene (la "real").
  const main = matches.reduce((a, b) => (b._count.posts > a._count.posts ? b : a));
  return { domain, canonicalSlug: wanted, name: main.name, ids: matches.map((c) => c.id) };
}

async function getCategoryPosts(domain: string, categoryIds: number[]): Promise<Post[]> {
  const posts = await prisma.post.findMany({
    where: {
      domain,
      status: "publish",
      isActive: true,
      categories: { some: { id: { in: categoryIds } } },
    },
    include: { categories: { select: { id: true, name: true, slug: true } } },
    orderBy: { date: "desc" },
    take: POSTS_PER_PAGE,
  });

  return posts.map((p) => ({
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await resolveCategory(params.slug);
  const identity = getSiteIdentity();

  if (!category) {
    return {
      title: "Categoría no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const posts = await getCategoryPosts(category.domain, category.ids);
  const title = `${category.name} | ${identity.name}`;
  const description = `Últimas noticias y análisis de ${category.name} en ${identity.name}.`;
  const path = `/categories/${category.canonicalSlug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    // Una categoría sin notas es una página vacía: no se indexa.
    ...(posts.length === 0 && { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title,
      description,
      siteName: identity.name,
      locale: identity.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: identity.twitterHandle,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await resolveCategory(params.slug);
  if (!category) notFound();

  const posts = await getCategoryPosts(category.domain, category.ids);
  const identity = getSiteIdentity();
  const url = absoluteUrl(`/categories/${category.canonicalSlug}`);

  const collectionJsonLd = collectionPageSchema({
    name: `${category.name} | ${identity.name}`,
    description: `Últimas noticias y análisis de ${category.name}.`,
    url,
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Inicio", url: absoluteUrl("/") },
    { name: category.name, url },
  ]);

  return (
    <Section>
      <JsonLd data={collectionJsonLd} id="ld-collection" />
      <JsonLd data={breadcrumbJsonLd} id="ld-breadcrumb" />
      <Container className="space-y-6">
        <Prose className="mb-8">
          <h1>{category.name}</h1>
        </Prose>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-gray-500">
            Todavía no hay notas en esta categoría.
          </p>
        )}

        <div className="mt-8">
          <BackButton />
        </div>
      </Container>
    </Section>
  );
}
