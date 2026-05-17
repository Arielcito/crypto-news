import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/lib/theme-provider";
import { ClientLayout } from "@/components/client-layout";
import { getDomainConfig } from "@/lib/domain-config";
import { Providers } from "./providers";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import Script from "next/script";
import type { Domain } from "@/lib/domain-colors";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true });

const FAVICON_PATH = '/favicons/bitcoin.ico';

const KNOWN_DOMAINS: Domain[] = ['bitcoinarg.news', 'localhost'];

function detectInitialDomain(): Domain {
  try {
    const h = headers();
    const detected = h.get('x-detected-domain');
    if (detected && KNOWN_DOMAINS.includes(detected as Domain)) {
      return detected as Domain;
    }
    const host = h.get('host') || '';
    const cleanHost = host.replace(/^www\./, '').split(':')[0];
    if (cleanHost === 'bitcoinarg.news') return 'bitcoinarg.news';
  } catch {
    // headers() throws during static generation — fall through
  }
  const envDomain = process.env.NEXT_PUBLIC_DOMAIN as Domain | undefined;
  if (envDomain && KNOWN_DOMAINS.includes(envDomain)) return envDomain;
  return 'localhost';
}

export async function generateMetadata(): Promise<Metadata> {
  const config = getDomainConfig();
  const faviconPath = FAVICON_PATH;
  const baseDomain = config.site.domain === 'localhost' ? 'bitcoinarg.news' : config.site.domain;

  return {
    title: {
      default: config.site.title,
      template: `%s | ${config.site.name}`,
    },
    description: config.site.description,
    metadataBase: new URL(`https://${baseDomain}`),
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
    openGraph: {
      title: config.site.title,
      description: config.site.description,
      images: config.site.ogImage,
      type: 'website',
      siteName: config.site.name,
      locale: 'es_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.site.title,
      description: config.site.description,
      images: config.site.ogImage,
      creator: config.site.twitterHandle,
      site: config.site.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialDomain = detectInitialDomain();
  const isProduction = process.env.NODE_ENV === 'production';
  const config = getDomainConfig();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${config.site.name} — Feed RSS`}
          href="/feed.xml"
        />
        <JsonLd data={[organizationSchema(), websiteSchema()]} id="ld-site" />

        {isProduction && (
          <Script
            id="adsbygoogle-init"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7010167677917603"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={inter.className}>
        <Providers initialDomain={initialDomain}>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
