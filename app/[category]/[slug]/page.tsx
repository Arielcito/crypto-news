import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Container } from "@/components/craft";
import { RecommendedPosts } from "@/components/recommended-posts";
import { Breadcrumb } from "@/components/breadcrumb";
import { TableOfContents } from "@/components/table-of-contents";
import { JsonLd } from "@/components/json-ld";
import { fetchPostBySlug, fetchPosts } from "@/lib/api/posts";
import {
  absoluteUrl,
  breadcrumbSchema,
  getSiteIdentity,
  newsArticleSchema,
} from "@/lib/seo";

interface PageProps {
  params: { category: string; slug: string };
  searchParams: { domain?: string };
}

function stripMarkdown(text: string, max = 160): string {
  const stripped = text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Noticia no encontrada",
      description: "La noticia que buscas no existe o fue eliminada.",
      robots: { index: false, follow: false },
    };
  }

  const identity = getSiteIdentity();
  const categorySlug = post.categories[0]?.slug || params.category;
  const path = `/${categorySlug}/${post.slug}`;
  const url = absoluteUrl(path);
  const description =
    (post.excerpt && stripMarkdown(post.excerpt)) ||
    stripMarkdown(post.content);
  const image = post.featuredMedia || absoluteUrl(identity.logo);
  const publishedTime = new Date(post.date).toISOString();

  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: identity.name,
      locale: identity.locale,
      images: [{ url: image, alt: post.title }],
      publishedTime,
      section: post.categories[0]?.name,
      tags: post.categories.map((c) => c.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
      creator: identity.twitterHandle,
      site: identity.twitterHandle,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchPosts();
  const identity = getSiteIdentity();
  const categorySlug = post.categories[0]?.slug || params.category;
  const categoryName = post.categories[0]?.name || "Sin categoría";
  const path = `/${categorySlug}/${post.slug}`;
  const url = absoluteUrl(path);
  const description =
    (post.excerpt && stripMarkdown(post.excerpt)) ||
    stripMarkdown(post.content);
  const image = post.featuredMedia || absoluteUrl(identity.logo);

  const articleJsonLd = newsArticleSchema({
    title: post.title,
    description,
    url,
    image,
    datePublished: post.date,
    section: categoryName,
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Inicio", url: absoluteUrl("/") },
    { name: categoryName, url: absoluteUrl(`/categories/${categorySlug}`) },
    { name: post.title, url },
  ]);

  return (
    <Container>
      <JsonLd data={articleJsonLd} id="ld-article" />
      <JsonLd data={breadcrumbJsonLd} id="ld-breadcrumb" />
      <div className="py-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: categoryName, href: `/categories/${categorySlug}` },
            { label: post.title, href: path },
          ]}
        />

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {categoryName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={new Date(post.date).toISOString()}>
                    {new Date(post.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.ceil(post.content.split(" ").length / 200)} min
                </span>
              </div>

              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt || "Descubre los detalles más relevantes de esta noticia..."}
              </p>

              {post.featuredMedia && (
                <div className="aspect-video relative overflow-hidden rounded-lg mb-8 ring-1 ring-border/50">
                  <Image
                    src={post.featuredMedia}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {post.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="hidden lg:block lg:col-span-1">
                  <TableOfContents content={post.content} />
                </div>
              </div>
            </article>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RecommendedPosts currentPostId={post.slug} posts={allPosts} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
