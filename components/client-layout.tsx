'use client';

import { CryptoPriceBanner } from '@/components/crypto-price-banner';
import { HeroHeader } from '@/components/hero-header';
import { MiniHeader } from '@/components/mini-header';
import dynamic from 'next/dynamic';

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
    </div>
  );
}
