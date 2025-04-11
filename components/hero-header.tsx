import Link from "next/link";
import { SocialMediaButtons } from "./social-media-buttons";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "@/components/nav/mobile-nav";
import { mainMenu } from "@/menu.config";
import { Button } from "@/components/ui/button";

const categoryNames: Record<string, string> = {
  mercados: "Mercados",
  noticias: "Noticias",
  etfs: "ETFs",
  analisis: "Análisis",
  educacion: "Educación",
};

export function HeroHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src={Logo} alt="Logo" width={32} height={32} />
              <span className="text-xl font-bold text-primary">BITCOINARG.news</span>
            </Link>
            <div className="hidden md:flex gap-2">
              {Object.entries(mainMenu).map(([key, href]) => (
                <Button key={href} asChild variant="ghost" size="sm">
                  <Link href={href}>{categoryNames[key]}</Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SocialMediaButtons />
            </div>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 