'use client';

import { useDomain } from '@/lib/use-domain';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Instagram, Youtube } from 'lucide-react';
import { FaTelegram, FaTiktok } from 'react-icons/fa';
import { ThemeToggle } from '@/components/theme-toggle';

export function HeroHeader() {
  const { site, isBitcoinArg } = useDomain();
  const { theme } = useTheme();
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
                src={theme === 'dark' ? site.logoDark : site.logo} 
                alt={site.name} 
                width={120} 
                height={120} 
                className="transition-transform duration-300"
              />
              <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold">{site.name}</h1>
                {isBitcoinArg && (
                  <p className="text-sm text-muted-foreground mt-1">+ 8 años informando sobre criptomonedas en Argentina y Latinoamérica</p>
                )}
              </div>
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
            {/* Theme toggle left */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            {/* Logo and site name centered */}
            <Link href="/" className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image 
                src={theme === 'dark' ? site.logoDark : site.logo} 
                alt={site.name} 
                width={24} 
                height={24} 
                className="transition-transform duration-300"
              />
              <span className="text-sm font-medium">{site.name}</span>
            </Link>

            {/* Social links right */}
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
                    <FaTelegram className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.tiktok && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    <FaTiktok className="h-4 w-4" />
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
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 