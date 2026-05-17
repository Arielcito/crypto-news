import { headers } from "next/headers";

export const KNOWN_DOMAINS = ["bitcoinarg.news"] as const;

export type KnownDomain = (typeof KNOWN_DOMAINS)[number];

export function detectRequestDomain(): KnownDomain {
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

export function getSiteBaseUrl(): string {
  return `https://${detectRequestDomain()}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  if (!path) return base;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type SiteIdentity = {
  domain: KnownDomain;
  name: string;
  legalName: string;
  shortName: string;
  description: string;
  twitterHandle: string;
  logo: string;
  socialLinks: string[];
  locale: string;
  email: string;
  foundingYear: number;
  parentOrganization: {
    name: string;
    url: string;
  };
  coverage: string;
};

const SITE_IDENTITIES: Record<KnownDomain, SiteIdentity> = {
  "bitcoinarg.news": {
    domain: "bitcoinarg.news",
    name: "BITCOIN ARGENTINA",
    legalName: "BITCOINARG.news",
    shortName: "BITCOINARG",
    description:
      "Noticias y análisis sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.",
    twitterHandle: "@bitcoinargnews",
    logo: "/bitcoinarg/logo.png",
    socialLinks: [
      "https://t.me/bitcoinargentinacomunidad",
      "https://instagram.com/bitcoin_argentina",
      "https://tiktok.com/@bitcoin_argentina",
      "https://www.youtube.com/@bitcoinargentinaoficial",
      "https://www.linkedin.com/company/bitcoin-argentina-group/",
    ],
    locale: "es_AR",
    email: "info@bitcoinarg.news",
    foundingYear: 2017,
    parentOrganization: {
      name: "Bitcoin Argentina Group",
      url: "https://bitcoinargentinagroup.com",
    },
    coverage: "Argentina y Latinoamérica",
  },
};

export function getSiteIdentity(): SiteIdentity {
  return SITE_IDENTITIES[detectRequestDomain()];
}

export function organizationSchema() {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${base}#organization`,
    name: id.name,
    legalName: id.legalName,
    url: base,
    logo: {
      "@type": "ImageObject",
      url: `${base}${id.logo}`,
    },
    description: id.description,
    foundingDate: `${id.foundingYear}-01-01`,
    parentOrganization: {
      "@type": "Organization",
      name: id.parentOrganization.name,
      url: id.parentOrganization.url,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: id.email,
      availableLanguage: ["Spanish", "es"],
    },
    sameAs: id.socialLinks,
    diversityPolicy: `${base}/politica-editorial`,
    ethicsPolicy: `${base}/politica-editorial`,
    correctionsPolicy: `${base}/politica-editorial`,
  };
}

export function aboutPageSchema(input: { url: string; headline: string }) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: input.headline,
    url: input.url,
    description: `Información sobre ${id.name}, su equipo editorial y su cobertura sobre criptomonedas y blockchain en ${id.coverage}.`,
    isPartOf: { "@id": `${base}#website` },
    publisher: { "@id": `${base}#organization` },
    mainEntity: { "@id": `${base}#organization` },
    inLanguage: id.locale.split("_")[0],
  };
}

export function contactPageSchema(input: { url: string; headline: string }) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: input.headline,
    url: input.url,
    description: `Cómo contactar al equipo editorial y comercial de ${id.name}.`,
    isPartOf: { "@id": `${base}#website` },
    publisher: { "@id": `${base}#organization` },
    inLanguage: id.locale.split("_")[0],
  };
}

export function webPageSchema(input: {
  url: string;
  headline: string;
  description: string;
}) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.headline,
    url: input.url,
    description: input.description,
    isPartOf: { "@id": `${base}#website` },
    publisher: { "@id": `${base}#organization` },
    inLanguage: id.locale.split("_")[0],
  };
}

export function websiteSchema() {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}#website`,
    url: base,
    name: id.name,
    description: id.description,
    publisher: { "@id": `${base}#organization` },
    inLanguage: id.locale.split("_")[0],
  };
}

type AuthorRef = {
  name: string;
  slug?: string;
  url?: string;
  bio?: string | null;
  avatar?: string | null;
  jobTitle?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  website?: string | null;
};

type ArticleInput = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished: string | Date;
  dateModified?: string | Date;
  author?: AuthorRef;
  section?: string;
};

function authorSchemaNode(author: AuthorRef | undefined) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  if (!author) {
    return {
      "@type": "Organization",
      name: id.name,
      url: base,
    };
  }
  const sameAs = [author.twitter, author.linkedin, author.website].filter(
    (v): v is string => Boolean(v),
  );
  return {
    "@type": "Person",
    name: author.name,
    url: author.url ?? (author.slug ? `${base}/autores/${author.slug}` : undefined),
    image: author.avatar ?? undefined,
    description: author.bio ?? undefined,
    jobTitle: author.jobTitle ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    worksFor: { "@id": `${base}#organization` },
  };
}

export function newsArticleSchema(article: ArticleInput) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  const published =
    article.datePublished instanceof Date
      ? article.datePublished.toISOString()
      : new Date(article.datePublished).toISOString();
  const modified = article.dateModified
    ? article.dateModified instanceof Date
      ? article.dateModified.toISOString()
      : new Date(article.dateModified).toISOString()
    : published;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.image ? [article.image] : [`${base}${id.logo}`],
    datePublished: published,
    dateModified: modified,
    author: authorSchemaNode(article.author),
    publisher: { "@id": `${base}#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
    isAccessibleForFree: true,
    inLanguage: id.locale.split("_")[0],
    articleSection: article.section,
  };
}

export function personSchema(author: AuthorRef) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  const sameAs = [author.twitter, author.linkedin, author.website].filter(
    (v): v is string => Boolean(v),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: author.url ?? (author.slug ? `${base}/autores/${author.slug}` : base),
    image: author.avatar ?? undefined,
    description: author.bio ?? undefined,
    jobTitle: author.jobTitle ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    worksFor: { "@id": `${base}#organization` },
  };
}

type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function collectionPageSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  const id = getSiteIdentity();
  const base = `https://${id.domain}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    isPartOf: { "@id": `${base}#website` },
    publisher: { "@id": `${base}#organization` },
  };
}
