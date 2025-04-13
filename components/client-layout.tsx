'use client';

import { useDomain } from '@/lib/use-domain';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/nav/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Section, Container } from '@/components/craft';
import { CryptoPriceBanner } from '@/components/crypto-price-banner';
import { HeroHeader } from '@/components/hero-header';
import { DomainSelector } from '@/components/domain-selector';
import Balancer from "react-wrap-balancer";
import Image from "next/image";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { MessageSquare, Twitter, Instagram, Youtube, Music } from 'lucide-react';
import { MiniHeader } from '@/components/mini-header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MiniHeader />
      <HeroHeader />
      <CryptoPriceBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {process.env.NODE_ENV === 'development' && <DomainSelector />}
    </div>
  );
}

const Footer = () => {
  const { site } = useDomain();

  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{site.name}</h3>
              <Image
                src={site.logo}
                alt={site.name}
                width={42}
                height={26.44}
              />
            </Link>
            <p>
              <Balancer>+8 años informando sobre criptomonedas en Argentina y Latinoamérica.</Balancer>
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">¿Querés aparecer en nuestra web?</p>
              <a 
                href="mailto:123@gmail.com" 
                className="text-sm text-primary hover:underline"
              >
                123@gmail.com
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <h5 className="font-medium text-base">Social</h5>
            <div className="flex gap-4">
              {site.socialLinks.instagram && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </Link>
              )}
              {site.socialLinks.telegram && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare size={20} />
                </Link>
              )}
              {site.socialLinks.twitter && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={20} />
                </Link>
              )}
              {site.socialLinks.tiktok && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </Link>
              )}
              {site.socialLinks.youtube && (
                <Link
                  className="text-foreground hover:text-primary transition-colors"
                  href={site.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={20} />
                </Link>
              )}
            </div>
          </div>
        </Container>
        <Container className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
        </Container>
      </Section>
    </footer>
  );
}; 