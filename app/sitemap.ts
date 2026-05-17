import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const KNOWN_DOMAINS = ["bitcoinarg.news"] as const;

type KnownDomain = (typeof KNOWN_DOMAINS)[number];

function detectDomain(): KnownDomain {
  try {
    const h = headers();
    const detected = h.get("x-detected-domain");
    if (detected && (KNOWN_DOMAINS as readonly string[]).includes(detected)) {
      return detected as KnownDomain;
    }
    const host = (h.get("x-forwarded-host") || h.get("host") || "")
      .replace(/^www\./, "")
      .split(":")[0];
    if ((KNOWN_DOMAINS as readonly string[]).includes(host)) {
      return host as KnownDomain;
    }
  } catch {
    // headers() may fail outside a request context — fall through to env
  }
  const envDomain = process.env.NEXT_PUBLIC_DOMAIN;
  if (envDomain && (KNOWN_DOMAINS as readonly string[]).includes(envDomain)) {
    return envDomain as KnownDomain;
  }
  return "bitcoinarg.news";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = detectDomain();
  const base = `https://${domain}`;

  const [posts, categories, authors] = await Promise.all([
    prisma.post
      .findMany({
        where: { domain, status: "publish" },
        select: {
          slug: true,
          modified: true,
          date: true,
          categories: {
            select: { slug: true, isActive: true },
            where: { isActive: true },
            take: 1,
          },
        },
        orderBy: { date: "desc" },
        take: 5000,
      })
      .catch((error) => {
        console.error("[sitemap] posts query failed:", error);
        return [] as Array<{
          slug: string;
          modified: Date | null;
          date: Date | null;
          categories: { slug: string; isActive: boolean }[];
        }>;
      }),
    prisma.domainCategories
      .findMany({
        where: { domain, isActive: true },
        select: { slug: true },
      })
      .catch((error) => {
        console.error("[sitemap] categories query failed:", error);
        return [] as { slug: string }[];
      }),
    prisma.author
      .findMany({
        where: { domain, isActive: true },
        select: { slug: true, updatedAt: true },
      })
      .catch((error) => {
        console.error("[sitemap] authors query failed:", error);
        return [] as { slug: string; updatedAt: Date | null }[];
      }),
  ]);

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/politica-editorial`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/contacto`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/autores`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const authorUrls: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${base}/autores/${a.slug}`,
    lastModified: a.updatedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const postUrls: MetadataRoute.Sitemap = posts
    .filter((p) => p.categories.length > 0)
    .map((p) => ({
      url: `${base}/${p.categories[0].slug}/${p.slug}`,
      lastModified: p.modified ?? p.date ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticUrls, ...categoryUrls, ...authorUrls, ...postUrls];
}
