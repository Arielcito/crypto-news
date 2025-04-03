import { Container } from "@/components/craft";
import { RecommendedPosts } from "@/components/recommended-posts";
import { Clock, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { mockPosts } from "@/lib/data/posts";

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = mockPosts.find(p => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <Container>
      <div className="py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <div className="aspect-video relative overflow-hidden rounded-lg mb-8 ring-1 ring-border/50">
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>

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

              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {post.title}
              </h1>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
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