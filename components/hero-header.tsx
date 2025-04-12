'use client';

import { useDomain } from '@/lib/use-domain';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/nav/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import Link from 'next/link';

export function HeroHeader() {
  const { site } = useDomain();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src={site.logo} alt={site.name} width={32} height={32} />
              <span className="text-xl font-bold">{site.name}</span>
            </Link>
            <div className="hidden md:flex gap-2">
              {site.categories.map((category) => (
                <Button key={category.href} asChild variant="ghost" size="sm">
                  <Link href={category.href}>{category.label}</Link>
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
            </div>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 