import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { mainMenu, contentMenu } from "@/menu.config";
import { Section, Container } from "@/components/craft";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/site.config";
import { CryptoPriceBanner } from "@/components/crypto-price-banner";
import { HeroHeader } from "@/components/hero-header";

import Balancer from "react-wrap-balancer";
import Logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina",
  description: "Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica. Información actualizada sobre adopción, regulación y tecnología.",
  keywords: "bitcoin, criptomonedas, argentina, latinoamérica, blockchain, adopción, regulación, tecnología, finanzas, economía",
  authors: [{ name: "BITCOINARG.news" }],
  creator: "BITCOINARG.news",
  publisher: "BITCOINARG.news",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina",
    description: "Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.",
    url: "https://bitcoinarg.news",
    siteName: "BITCOINARG.news",
    images: [
      {
        url: "https://bitcoinarg.news/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BITCOINARG.news",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BITCOINARG.news | Noticias de Bitcoin y Criptomonedas en Argentina",
    description: "Las últimas noticias sobre Bitcoin, criptomonedas y blockchain en Argentina y Latinoamérica.",
    images: ["https://bitcoinarg.news/twitter-image.jpg"],
    creator: "@bitcoinargnews",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Container>
                <div className="flex h-14 items-center">
                  <MobileNav />
                  <div className="flex flex-1 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                      <Image src={Logo} alt="Logo" width={32} height={32} />
                      <span className="font-bold">BITCOINARG.news</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </Container>
            </header>
            <CryptoPriceBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

const Nav = ({ className, children, id }: NavProps) => {
  const categoryNames: Record<string, string> = {
    mercados: "Mercados",
    noticias: "Noticias",
    etfs: "ETFs",
    analisis: "Análisis",
    educacion: "Educación",
  };

  return (
    <nav
      className={cn("sticky z-50 top-0 bg-background", "border-b", className)}
      id={id}
    >
      <div
        id="nav-container"
        className="max-w-5xl mx-auto py-4 px-6 sm:px-8 flex justify-between items-center"
      >
        <Link
          className="hover:opacity-75 transition-all flex gap-4 items-center"
          href="/"
        >
          <Image
            src={Logo}
            alt="Logo"
            loading="eager"
            className="dark:invert"
            width={42}
            height={26.44}
          ></Image>
          <h2 className="text-sm">{siteConfig.site_name}</h2>
        </Link>
        {children}
        <div className="flex items-center gap-2">
          <div className="mx-2 hidden md:flex">
            {Object.entries(mainMenu).map(([key, href]) => (
              <Button key={href} asChild variant="ghost" size="sm">
                <Link href={href}>
                  {categoryNames[key]}
                </Link>
              </Button>
            ))}
          </div>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{siteConfig.site_name}</h3>
              <Image
                src={Logo}
                alt="Logo"
                className="dark:invert"
                width={42}
                height={26.44}
              ></Image>
            </Link>
            <p>
              <Balancer>{siteConfig.site_description}</Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Website</h5>
            {Object.entries(mainMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Blog</h5>
            {Object.entries(contentMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          <ThemeToggle />
          <p className="text-muted-foreground">
            &copy; <a href="https://bitcoinarg.news">bitcoinarg.news</a>. All rights reserved.
            2025-present.
          </p>
        </Container>
      </Section>
    </footer>
  );
};
