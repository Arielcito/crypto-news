'use client';

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/nav/mobile-nav";
import { mainMenu } from "@/menu.config";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/lib/use-domain";
import Image from "next/image";

const categoryNames: Record<string, string> = {
  mercados: "Mercados",
  noticias: "Noticias",
  etfs: "ETFs",
  analisis: "Análisis",
  educacion: "Educación",
};

export function HeroHeader() {
  const { site } = useDomain(); 
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src={site.logo} alt={site.name} width={32} height={32} />
              <span className="text-xl font-bold text-primary">{site.name}</span>
            </Link>
            <div className="hidden md:flex gap-2">
              {Object.entries(mainMenu).map(([key, href]) => (
                <Button key={href} asChild variant="ghost" size="sm">
                  <Link href={href}>{categoryNames[key]}</Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              {site.socialLinks.telegram && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={site.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </Link>
                </Button>
              )}
              {site.socialLinks.twitter && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={site.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    Twitter
                  </Link>
                </Button>
              )}
              {site.socialLinks.instagram && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={site.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </Link>
                </Button>
              )}
              {site.socialLinks.tiktok && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    TikTok
                  </Link>
                </Button>
              )}
              {site.socialLinks.youtube && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={site.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </Link>
                </Button>
              )}
            </div>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 