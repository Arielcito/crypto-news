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
import { MobileNav } from '@/components/nav/mobile-nav';

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
        <div className="container mx-auto px-2 sm:px-4">
          <Link href="/" className="flex flex-col items-center justify-center h-24 sm:h-32 py-2 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Image 
                src={theme === 'dark' ? site.logoDark : site.logo} 
                alt={site.name} 
                width={80} 
                height={80} 
                className="transition-transform duration-300 w-16 h-16 sm:w-20 sm:h-20"
              />
              <div className="flex flex-col items-center">
                <h1 className="text-2xl sm:text-4xl font-bold text-center">{site.name}</h1>
                {isBitcoinArg && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center max-w-[200px] sm:max-w-none">
                    + 8 años informando sobre criptomonedas en Argentina y Latinoamérica
                  </p>
                )}
              </div>
            </div>
          </Link>
          
          {/* Menú de categorías - Solo visible en desktop */}
          <div className="hidden md:flex flex-col items-center border-t border-b py-2 sm:py-3">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-6 max-w-3xl">
              {site.categories.map((category) => (
                <Link 
                  key={category.href} 
                  href={category.href}
                  className="text-xs sm:text-sm font-bold hover:text-primary transition-colors whitespace-nowrap text-center"
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
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Mobile menu */}
            <div className="flex items-center md:hidden">
              <MobileNav />
            </div>

            {/* Center - Logo and site name */}
            <Link href="/" className=" items-center gap-1 sm:gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex">
              <Image 
                src={theme === 'dark' ? site.logoDark : site.logo} 
                alt={site.name} 
                width={20} 
                height={20} 
                className="transition-transform duration-300"
              />
              <span className="text-xs sm:text-sm font-bold hidden sm:inline text-center">{site.name}</span>
            </Link>

            {/* Right side - Theme toggle and social links (desktop only) */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <div className="hidden md:flex gap-1">
                {site.socialLinks.instagram && (
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link href={site.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {site.socialLinks.telegram && (
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link href={site.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                      <FaTelegram className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {site.socialLinks.tiktok && (
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                      <FaTiktok className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {site.socialLinks.youtube && (
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link href={site.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 