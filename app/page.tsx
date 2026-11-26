import nextDynamic from "next/dynamic";

import { Section, Container } from "@/components/craft";
import { LatestNewsSection } from "@/components/LatestNewsSection";
import { TopStoriesSection } from "@/components/TopStoriesSection";
import { DeepDivesSection } from "@/components/DeepDivesSection";
import { PodcastSection } from "@/components/PodcastSection";
import { prisma } from "@/lib/prisma";
import { detectRequestDomain, getSiteIdentity } from "@/lib/seo";
import type Post from "@/types/post";

const AllPostsPaginated = nextDynamic(
  () => import("@/components/posts-section").then((mod) => ({ default: mod.AllPostsPaginated })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-50 rounded-lg" />,
  },
);

const TelegramChannel = nextDynamic(
  () => import("@/components/newsletter").then((mod) => ({ default: mod.TelegramChannel })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />,
  },
);

export const dynamic = "force-dynamic";

type PostWithCategories = Awaited<ReturnType<typeof prisma.post.findMany>>[number] & {
  categories: { id: number; name: string; slug: string }[];
};

function mapPost(p: PostWithCategories): Post {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt ?? "",
    date: p.date.toISOString(),
    content: p.content,
    categories: p.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    featuredMedia: p.featuredMedia ?? "",
    slug: p.slug,
    domain: p.domain,
  };
}

async function getInitialPosts(domain: string): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { domain, status: "publish", isActive: true },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { date: "desc" },
      take: 12,
    });

    return posts.map(mapPost);
  } catch (error) {
    console.error("[home] getInitialPosts failed, falling back to client fetch:", error);
    return [];
  }
}

async function getPublishedCount(domain: string): Promise<number> {
  try {
    return await prisma.post.count({ where: { domain, status: "publish", isActive: true } });
  } catch (error) {
    console.error("[home] getPublishedCount failed:", error);
    return 0;
  }
}

const FEATURED_SLOTS = 4;

async function getFeaturedPosts(domain: string): Promise<Post[]> {
  try {
    const baseWhere = { domain, status: "publish", isActive: true };
    const include = { categories: { select: { id: true, name: true, slug: true } } };

    const featured = await prisma.post.findMany({
      where: { ...baseWhere, featured: true },
      include,
      orderBy: { date: "desc" },
      take: FEATURED_SLOTS,
    });

    if (featured.length >= FEATURED_SLOTS) {
      return featured.map(mapPost);
    }

    const fallback = await prisma.post.findMany({
      where: { ...baseWhere, featured: false },
      include,
      orderBy: { date: "desc" },
      take: FEATURED_SLOTS - featured.length,
    });

    return [...featured, ...fallback].map(mapPost);
  } catch (error) {
    console.error("[home] getFeaturedPosts failed:", error);
    return [];
  }
}

export default async function Home() {
  const domain = detectRequestDomain();
  const [initialPosts, topStoryPosts, publishedCount] = await Promise.all([
    getInitialPosts(domain),
    getFeaturedPosts(domain),
    getPublishedCount(domain),
  ]);
  const identity = getSiteIdentity();
  const hasSsrPosts = initialPosts.length > 0;
  const latestPosts = initialPosts.slice(0, 4);
  const deepDivePosts = initialPosts.slice(8, 12);

  return (
    <Section>
      <Container>
        <main className="space-y-12">
          <p className="sr-only">{identity.description}</p>

          <div className="container mx-auto px-4 space-y-12">
            {hasSsrPosts && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <LatestNewsSection posts={latestPosts} />
                <TopStoriesSection posts={topStoryPosts} />
                <div className="flex flex-col gap-8">
                  <DeepDivesSection posts={deepDivePosts} />
                  <PodcastSection />
                </div>
              </div>
            )}

            <AllPostsPaginated
              initialData={
                hasSsrPosts
                  ? {
                      posts: initialPosts,
                      total: publishedCount,
                      totalPages: Math.ceil(publishedCount / 12),
                    }
                  : undefined
              }
            />
          </div>

          <TelegramChannel />
        </main>
      </Container>
    </Section>
  );
}
