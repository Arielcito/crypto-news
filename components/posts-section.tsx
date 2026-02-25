import Link from "next/link";
import { Clock, TrendingUp, Newspaper, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Post  from "@/types/post";
import { LatestNewsSection } from "./LatestNewsSection";
import { TopStoriesSection } from "./TopStoriesSection";
import { DeepDivesSection } from "./DeepDivesSection";
import { PodcastSection } from "./PodcastSection";
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/lib/api/posts';
import { usePaginatedPosts } from '@/lib/use-paginated-posts';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, 'ellipsis', total);
  } else if (current >= total - 2) {
    pages.push(1, 'ellipsis', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total);
  }

  return pages;
}

function AllPostsPaginated() {
  const {
    posts,
    total,
    totalPages,
    page,
    isLoading,
    isPageTransitioning,
    goToPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePaginatedPosts({ perPage: 2 });

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Todas las Noticias</h2>
        {total > 0 && (
          <span className="text-sm text-muted-foreground">
            {total} noticias
          </span>
        )}
      </div>

      <div className="relative min-h-[200px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isPageTransitioning ? 'pointer-events-none' : ''}`}
            >
              {posts.map((post) => (
                <PostCard key={post.id} post={post} category={post.categories[0]?.name ?? 'general'} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => { e.preventDefault(); prevPage(); }}
                className={`cursor-pointer select-none transition-opacity duration-200 ${!hasPrevPage ? 'pointer-events-none opacity-40' : 'hover:bg-accent'}`}
              />
            </PaginationItem>

            {visiblePages.map((p, i) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={(e) => { e.preventDefault(); goToPage(p); }}
                    className="cursor-pointer select-none"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => { e.preventDefault(); nextPage(); }}
                className={`cursor-pointer select-none transition-opacity duration-200 ${!hasNextPage ? 'pointer-events-none opacity-40' : 'hover:bg-accent'}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
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
        <div className="flex flex-col gap-8">
          <DeepDivesSection posts={deepDivePosts} />
          <PodcastSection />
        </div>
      </div>

      <AllPostsPaginated />
    </div>
  );
} 