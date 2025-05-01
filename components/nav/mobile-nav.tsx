"use client";

// React and Next Imports
import * as React from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

// Utility Imports
import { Menu, ArrowRightSquare, Instagram, Youtube, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaTelegram, FaTiktok } from "react-icons/fa";

// Component Imports
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

import { mainMenu, contentMenu } from "@/menu.config";
import { useDomain } from "@/lib/use-domain";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { site } = useDomain();

  // Get current date in Spanish
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 border w-10 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle className="text-left">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setOpen}
            >
              <ArrowRightSquare className="mr-2 h-4 w-4" />
              <span>{site.name}</span>
            </MobileLink>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          {/* Current date */}
          <div className="text-sm text-muted-foreground mb-4">
            {currentDate}
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-2 mb-4">
            <ThemeToggle />
            <span>Cambiar tema</span>
          </div>

          {/* Categories */}
          <h3 className="text-small font-medium">Categorías</h3>
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2 mb-4">
            {site.categories.map((category) => (
              <MobileLink key={category.href} href={category.href} onOpenChange={setOpen}>
                {category.label}
              </MobileLink>
            ))}
          </div>

          {/* Main Menu */}
          <h3 className="text-small font-medium">Menú Principal</h3>
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2 mb-4">
            {Object.entries(mainMenu).map(([key, href]) => (
              <MobileLink key={key} href={href} onOpenChange={setOpen}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MobileLink>
            ))}
          </div>

          {/* Content Menu */}
          <h3 className="text-small font-medium">Blog</h3>
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2 mb-4">
            {Object.entries(contentMenu).map(([key, href]) => (
              <MobileLink key={key} href={href} onOpenChange={setOpen}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MobileLink>
            ))}
          </div>

          {/* Social Links */}
          <h3 className="text-small font-medium">Redes Sociales</h3>
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2">
            {site.socialLinks.instagram && (
              <MobileLink href={site.socialLinks.instagram} onOpenChange={setOpen} className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </MobileLink>
            )}
            {site.socialLinks.telegram && (
              <MobileLink href={site.socialLinks.telegram} onOpenChange={setOpen} className="flex items-center gap-2">
                <FaTelegram className="h-4 w-4" />
                Telegram
              </MobileLink>
            )}
            {site.socialLinks.tiktok && (
              <MobileLink href={site.socialLinks.tiktok} onOpenChange={setOpen} className="flex items-center gap-2">
                <FaTiktok className="h-4 w-4" />
                TikTok
              </MobileLink>
            )}
            {site.socialLinks.youtube && (
              <MobileLink href={site.socialLinks.youtube} onOpenChange={setOpen} className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </MobileLink>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("text-sm hover:text-primary transition-colors", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
