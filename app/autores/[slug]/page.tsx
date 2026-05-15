import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section, Container, Prose } from "@/components/craft";
import { Breadcrumb } from "@/components/breadcrumb";
import { AuthorBio } from "@/components/author-bio";
import { JsonLd } from "@/components/json-ld";
import { PostCard } from "@/app/posts/post-card";
import { getAuthorWithPosts } from "@/lib/api/authors";
import {
  absoluteUrl,
  breadcrumbSchema,
  detectRequestDomain,
  getSiteIdentity,
  personSchema,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const domain = detectRequestDomain();
  const author = await getAuthorWithPosts(params.slug, domain);
  const identity = getSiteIdentity();

  if (!author) {
    return {
      title: "Autor no encontrado",
      description: "El autor que buscas no existe o ya no escribe en el sitio.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${author.name} | ${identity.name}`;
  const description =
    author.bio?.slice(0, 160) ||
    `Notas publicadas por ${author.name} en ${identity.name}.`;
  const path = `/autores/${author.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "profile",
      url: absoluteUrl(path),
      title,
      description,
      siteName: identity.name,
      locale: identity.locale,
      images: author.avatar ? [{ url: author.avatar, alt: author.name }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: identity.twitterHandle,
      images: author.avatar ? [author.avatar] : undefined,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const domain = detectRequestDomain();
  const author = await getAuthorWithPosts(params.slug, domain);

  if (!author) {
    notFound();
  }

  const path = `/autores/${author.slug}`;
  const url = absoluteUrl(path);

  return (
    <Section>
      <JsonLd data={personSchema(author)} id="ld-author" />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Autores", url: absoluteUrl("/autores") },
          { name: author.name, url },
        ])}
        id="ld-breadcrumb"
      />

      <Container className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Autores", href: "/autores" },
            { label: author.name, href: path },
          ]}
        />

        <AuthorBio author={author} />

        <Prose>
          <h2>Notas publicadas</h2>
          {author.posts.length === 0 && (
            <p className="text-muted-foreground">
              {author.name} todavía no tiene notas publicadas.
            </p>
          )}
        </Prose>

        {author.posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {author.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
