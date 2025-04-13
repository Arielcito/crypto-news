import { Container } from "@/components/craft";
import { RecommendedPosts } from "@/components/recommended-posts";
import { Clock, Calendar, Share2, Bookmark, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { mockPosts } from "@/lib/data/posts";
import Image from "next/image";
import { Breadcrumb } from "@/components/breadcrumb";
import { TableOfContents } from "@/components/table-of-contents";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const post = mockPosts.find(p => p.id === resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <Container>
      <div className="py-8">
        <Breadcrumb 
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias', href: '/news' },
            { label: post.title, href: `/news/${post.id}` }
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
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt || 'Descubre los detalles más relevantes de esta noticia...'}
              </p>

              <div className="aspect-video relative overflow-hidden rounded-lg mb-8 ring-1 ring-border/50">
                <Image
                  src={post.image || ''}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>

              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-3">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                <div className="col-span-1">
                  <TableOfContents content={post.content} />
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar con posts recomendados */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RecommendedPosts 
                currentPostId={post.id} 
                posts={mockPosts} 
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 