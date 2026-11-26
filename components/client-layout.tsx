'use client';

import { usePathname } from 'next/navigation';
import { CryptoPriceBanner } from '@/components/crypto-price-banner';
import { HeroHeader } from '@/components/hero-header';
import { MiniHeader } from '@/components/mini-header';
// El footer se renderiza en el servidor para que los buscadores vean los links
// institucionales (Sobre nosotros, Política editorial, Contacto).
import { Footer } from '@/components/footer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/reporte')) {
    return <div className="min-h-screen">{children}</div>;
  }

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
