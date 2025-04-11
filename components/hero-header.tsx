import Link from "next/link";
import { SocialMediaButtons } from "./social-media-buttons";

export function HeroHeader() {
  return (
    <header className="bg-tertiary py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              BITCOINARG.news
            </Link>
            <p className="text-secondary-foreground mt-1">
              Noticias de Bitcoin y criptomonedas en Argentina y Latinoamérica
            </p>
          </div>
          
          <SocialMediaButtons />
        </div>
      </div>
    </header>
  );
} 