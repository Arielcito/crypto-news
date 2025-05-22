import Link from "next/link";
import { Clock } from "lucide-react";
import Image from "next/image";
import Post from "@/types/post";

interface DeepDivesSectionProps {
  posts: Post[];
}

function DeepDiveCard({ post }: { post: Post }) {
  return (
    <Link href={`/${post.categories[0].slug}/${post.slug}`} className="block group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={post.featuredMedia || ""}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              ANÁLISIS
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.views}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function DeepDivesSection({ posts }: DeepDivesSectionProps) {
  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-4">Análisis en Profundidad</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <DeepDiveCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 