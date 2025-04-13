'use client';

import { useDomain } from '@/lib/use-domain';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Instagram, MessageSquare, Twitter, Youtube } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function HeroHeader() {
  const { site } = useDomain();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Logo grande y menú de categorías */}
      <div className={cn(
        "w-full bg-background transition-all duration-300",
        isScrolled ? "h-0 opacity-0" : "opacity-100"
      )}>
        <div className="container mx-auto px-4">
          <Link href="/" className="flex flex-col items-center justify-center h-32 py-4">
            <div className="flex items-center gap-4">
              <Image 
                src={site.logo} 
                alt={site.name} 
                width={120} 
                height={120} 
                className="transition-transform duration-300"
              />
              <h1 className="text-4xl font-bold">{site.name}</h1>
            </div>
          </Link>
          
          {/* Menú de categorías */}
          <div className="flex justify-center border-t border-b py-3">
            <div className="flex gap-6">
              {site.categories.map((category) => (
                <Link 
                  key={category.href} 
                  href={category.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header compacto al hacer scroll */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 border-b",
        isScrolled ? "translate-y-0 shadow-sm" : "-translate-y-full"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Social links left */}
            <div className="flex items-center gap-2">
              {site.socialLinks.instagram && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.telegram && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Logo and site name centered */}
            <Link href="/" className="flex items-center gap-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image 
                src={site.logo} 
                alt={site.name} 
                width={32} 
                height={32}
              />
              <span className="text-lg font-bold">{site.name}</span>
            </Link>

            {/* Social links right */}
            <div className="flex items-center gap-2">
              {site.socialLinks.twitter && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.tiktok && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </Link>
                </Button>
              )}
              {site.socialLinks.youtube && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 