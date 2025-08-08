'use client';

import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/nav/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { CryptoPriceBanner } from '@/components/crypto-price-banner';
import { HeroHeader } from '@/components/hero-header';
import { DomainSelector } from '@/components/domain-selector';
import { MiniHeader } from '@/components/mini-header';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Footer component
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-gray-50" />
});

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