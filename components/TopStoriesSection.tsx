import Link from "next/link";
import { Clock } from "lucide-react";
import Image from "next/image";
import Post from "@/types/post";

interface TopStoriesSectionProps {
  posts: Post[];
}

function FeaturedStoryCard({ post }: { post: Post }) {
  console.log(post);
  return (
    <Link href={`/news/${post.slug}`} className="block group">
      <article className="relative h-[300px] rounded-lg overflow-hidden">
        <Image
          src={post.featuredMedia || ""}
          alt={post.title}
          fill
          className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="bg-blue-500 px-2 py-1 rounded-full">
              DESTACADO
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-200 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

function SmallStoryCard({ post }: { post: Post }) {
  console.log(post);
  return (
    <Link href={`/news/${post.slug}`} className="block group">
      <article className="flex gap-4 items-center">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={post.featuredMedia || ""}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function TopStoriesSection({ posts }: TopStoriesSectionProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const [featuredPost, ...smallPosts] = posts;
  
  if (!featuredPost) {
    return null;
  }

  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-4">Historias Destacadas</h2>
      <div className="space-y-6">
        <FeaturedStoryCard post={featuredPost} />
        <div className="space-y-4">
          {smallPosts.map((post) => (
            <SmallStoryCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
} 