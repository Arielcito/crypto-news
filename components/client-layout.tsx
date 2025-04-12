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

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { site } = useDomain();

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

const Nav = ({ className, children, id }: NavProps) => {
  const { site } = useDomain();

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
            src={site.logo}
            alt="Logo"
            loading="eager"
            width={42}
            height={26.44}
          ></Image>
          <h2 className="text-sm">{site.name}</h2>
        </Link>
        {children}
        <div className="flex items-center gap-2">
          <div className="mx-2 hidden md:flex">
            {site.categories.map(({ key, label, href }) => (
              <Button key={href} asChild variant="ghost" size="sm">
                <Link href={href}>
                  {label}
                </Link>
              </Button>
            ))}
          </div>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

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
                alt="Logo"
                width={42}
                height={26.44}
              ></Image>
            </Link>
            <p>
              <Balancer>{site.description}</Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Website</h5>
            {site.categories.map(({ key, label, href }) => (
              <Link
                className="hover:underline underline-offset-4"
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Social</h5>
            <Link
              className="hover:underline underline-offset-4"
              href={site.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </Link>
            <Link
              className="hover:underline underline-offset-4"
              href={site.socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </Link>
            <Link
              className="hover:underline underline-offset-4"
              href={site.socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Link>
          </div>
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          <ThemeToggle />
          <p className="text-muted-foreground">
            &copy; <a href="https://bitcoinarg.news">{site.name}</a>. All rights reserved.
            2025-present.
          </p>
        </Container>
      </Section>
    </footer>
  );
}; 