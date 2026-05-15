import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import { fetchCategoryBySlug, fetchPostsByCategory } from "@/lib/api/categories";
import Post from "@/types/post";
import { PostCard } from "@/app/posts/post-card";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  getSiteIdentity,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await fetchCategoryBySlug(params.slug);
  const identity = getSiteIdentity();

  if (!category) {
    return {
      title: "Categoría no encontrada",
      description: "La categoría que buscas no existe.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} | ${identity.name}`;
  const description =
    category.description?.replace(/<[^>]+>/g, "").trim() ||
    `Últimas noticias y análisis de ${category.name} en ${identity.name}.`;
  const path = `/categories/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
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
  const category = await fetchCategoryBySlug(params.slug);
  const posts = await fetchPostsByCategory(params.slug);
  const identity = getSiteIdentity();
  const path = `/categories/${params.slug}`;
  const url = absoluteUrl(path);

  if (!category) {
    return (
      <Section>
        <Container>
          <h1>Category not found</h1>
          <p>The category you are looking for does not exist.</p>
          <div className="mt-8">
            <BackButton />
          </div>
        </Container>
      </Section>
    );
  }

  const collectionJsonLd = collectionPageSchema({
    name: `${category.name} | ${identity.name}`,
    description:
      category.description?.replace(/<[^>]+>/g, "").trim() ||
      `Últimas noticias y análisis de ${category.name}.`,
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
          {category.description && (
            <div
              dangerouslySetInnerHTML={{ __html: category.description }}
              className="mt-4"
            />
          )}
        </Prose>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-gray-500">
            No hay posts en esta categoría.
          </p>
        )}

        <div className="mt-8">
          <BackButton />
        </div>
      </Container>
    </Section>
  );
} 