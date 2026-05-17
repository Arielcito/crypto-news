import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

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

export default function robots(): MetadataRoute.Robots {
  const domain = detectDomain();
  const base = `https://${domain}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-News", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
