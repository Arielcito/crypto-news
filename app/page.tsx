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

async function getInitialPosts(): Promise<Post[]> {
  try {
    const domain = detectRequestDomain();
    const posts = await prisma.post.findMany({
      where: { domain, status: "publish" },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { date: "desc" },
      take: 12,
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt ?? "",
      date: p.date.toISOString(),
      content: p.content,
      categories: p.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      featuredMedia: p.featuredMedia ?? "",
      slug: p.slug,
      domain: p.domain,
    }));
  } catch (error) {
    console.error("[home] getInitialPosts failed, falling back to client fetch:", error);
    return [];
  }
}

export default async function Home() {
  const initialPosts = await getInitialPosts();
  const identity = getSiteIdentity();
  const hasSsrPosts = initialPosts.length > 0;
  const latestPosts = initialPosts.slice(0, 4);
  const topStoryPosts = initialPosts.slice(4, 8);
  const deepDivePosts = initialPosts.slice(8, 12);

  return (
    <Section>
      <Container>
        <main className="space-y-12">
          <header className="sr-only">
            <h1>{identity.name}</h1>
            <p>{identity.description}</p>
          </header>

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

            <AllPostsPaginated />
          </div>

          <TelegramChannel />
        </main>
      </Container>
    </Section>
  );
}
