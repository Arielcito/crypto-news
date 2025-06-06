import Link from "next/link";
import { Clock, TrendingUp, Newspaper, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Post  from "@/types/post";
import { LatestNewsSection } from "./LatestNewsSection";
import { TopStoriesSection } from "./TopStoriesSection";
import { DeepDivesSection } from "./DeepDivesSection";
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/lib/api/posts';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

function PostCard({ post, category }: { post: Post, category: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/${category}/${post.slug}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          {!imageError ? (
            <Image
              src={post.featuredMedia || ''}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className="bg-primary/10 text-primary py-0.5 rounded-full text-[10px]">
              {post.categories[0].name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {post.views}
            </span>
          </div>
          <h3 className="font-semibold text-xs mb-1 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

function PostCardSkeleton() {
  return (
    <article className="border rounded-lg overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1 mb-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </article>
  );
}

function FeaturedPostCardSkeleton() {
  return (
    <article className="border rounded-lg overflow-hidden h-full">
      <div className="aspect-[16/10] relative overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1 mb-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </article>
  );
}

function SmallPostCardSkeleton() {
  return (
    <article className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-2">
        <div className="aspect-square relative overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="col-span-2 p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </article>
  );
}

export function PostsSection() {
  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Dividir los posts en tres grupos para cada sección específica
  const latestPosts = allPosts.slice(0, 4);
  const topStoryPosts = allPosts.slice(4, 8);
  const deepDivePosts = allPosts.slice(8, 12);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest News Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <FeaturedPostCardSkeleton />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <SmallPostCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Top Stories Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <FeaturedPostCardSkeleton />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <SmallPostCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Deep Dives Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <FeaturedPostCardSkeleton />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <SmallPostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* All Posts Section Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LatestNewsSection posts={latestPosts} />
        <TopStoriesSection posts={topStoryPosts} />
        <DeepDivesSection posts={deepDivePosts} />
      </div>

      {/* Sección de todos los posts - sin límites */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Todas las Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} category={post.categories[0].name} />
          ))}
        </div>
      </div>
    </div>
  );
} 