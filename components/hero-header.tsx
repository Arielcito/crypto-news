'use client';

import { lazy, Suspense } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/nav/mobile-nav";
import { mainMenu } from "@/menu.config";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getDomainConfig } from "@/lib/domain-config";

// Constantes para evitar cálculos complejos durante la compilación
const categoryNames: Record<string, string> = {
  mercados: "Mercados",
  noticias: "Noticias",
  etfs: "ETFs",
  analisis: "Análisis",
  educacion: "Educación",
};

// Componente principal simplificado y con renderizado estático para partes críticas
export function HeroHeader() {
  // Datos estáticos para el SSR inicial
  const defaultSite = {
    name: "BITCOINARG.news",
    logo: "/bitcoinarg/logo.png",
    socialLinks: {
      telegram: "https://t.me/bitcoinargnews",
      twitter: "https://twitter.com/bitcoinargnews",
      instagram: "https://instagram.com/bitcoinargnews",
      tiktok: "https://tiktok.com/@bitcoinargnews",
      youtube: "https://youtube.com/@bitcoinargnews",
    }
  };

  // Estructura simplificada para evitar recursión durante el build
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src={defaultSite.logo} alt={defaultSite.name} width={32} height={32} />
              <span className="text-xl font-bold">{defaultSite.name}</span>
            </Link>
            <div className="hidden md:flex gap-2">
              {Object.entries(mainMenu).map(([key, href]) => (
                <Button key={href} asChild variant="ghost" size="sm">
                  <Link href={href}>{categoryNames[key] || key}</Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="https://t.me/bitcoinargnews" target="_blank" rel="noopener noreferrer">
                  Telegram
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="https://twitter.com/bitcoinargnews" target="_blank" rel="noopener noreferrer">
                  Twitter
                </Link>
              </Button>
            </div>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 