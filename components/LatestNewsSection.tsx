import Link from "next/link";
import { Clock } from "lucide-react";
import Image from "next/image";
import { Post } from "@/types/post";

interface LatestNewsSectionProps {
  posts: Post[];
}

export function LatestNewsSection({ posts }: LatestNewsSectionProps) {
  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-4">Últimas Noticias</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/news/${post.id}`} className="block group">
            <article className="border-b pb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  TENDENCIA
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 