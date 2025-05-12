import { Container } from "@/components/craft";
import { RecommendedPosts } from "@/components/recommended-posts";
import { Clock, Calendar, Share2, Bookmark, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/breadcrumb";
import { TableOfContents } from "@/components/table-of-contents";
import { fetchPostBySlug, fetchPosts } from "@/lib/api/posts";

interface PageProps {
  params: { slug: string };
  searchParams: { domain?: string };
}

export default async function PostPage({ params, searchParams }: PageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Fetch all posts for recommended posts section
  const allPosts = await fetchPosts();

  return (
    <Container>
      <div className="py-8">
        <Breadcrumb 
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias', href: `/news?domain=${post.domain}` },
            { label: post.categories[0]?.name || 'Sin categoría', href: `/news?domain=${post.domain}&category=${post.categories[0]?.id}` },
            { label: post.title, href: `/news/${post.slug}?domain=${post.domain}` }
          ]} 
        />
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <h1 className="text-4xl font-bold mb-6">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {post.categories[0]?.name || 'Sin categoría'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.ceil(post.content.split(' ').length / 200)} min
                </span>
              </div>

              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt || 'Descubre los detalles más relevantes de esta noticia...'}
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
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                <div className="hidden lg:block lg:col-span-1">
                  <TableOfContents content={post.content} />
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar con posts recomendados */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RecommendedPosts 
                currentPostId={post.slug} 
                posts={allPosts} 
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 