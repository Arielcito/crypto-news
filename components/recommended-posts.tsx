import Link from "next/link";
import { Clock } from "lucide-react";
import { Post } from "@/types/post";

interface RecommendedPostsProps {
  currentPostId: string;
  posts: Post[];
}

export function RecommendedPosts({ currentPostId, posts }: RecommendedPostsProps) {
  const recommendedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Posts Relacionados
      </h3>
      <div className="space-y-4">
        {recommendedPosts.map(post => (
          <Link 
            key={post.id} 
            href={`/news/${post.id}`}
            className="group block"
          >
            <article className="flex gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50">
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {post.excerpt}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 