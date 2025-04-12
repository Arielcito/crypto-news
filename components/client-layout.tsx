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

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <HeroHeader />
      <CryptoPriceBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <DomainSelector />
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
              <Balancer>{site.description}</Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <h5 className="font-medium text-base">Social</h5>
            <div className="flex gap-4">
              {site.socialLinks.telegram && (
                <Link
                  className="hover:text-primary transition-colors"
                  href={site.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare size={20} />
                </Link>
              )}
              {site.socialLinks.twitter && (
                <Link
                  className="hover:text-primary transition-colors"
                  href={site.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={20} />
                </Link>
              )}
              {site.socialLinks.instagram && (
                <Link
                  className="hover:text-primary transition-colors"
                  href={site.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </Link>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </footer>
  );
}; 