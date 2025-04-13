import { ThemeToggle } from './theme-toggle'
import { useDomain } from '@/lib/use-domain'
import { Button } from './ui/button'
import Link from 'next/link'
import { Instagram, MessageSquare, Twitter, Youtube } from 'lucide-react'

export function MiniHeader() {
  const { site } = useDomain()
  
  // Get current date in Spanish
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="w-full bg-background border-b py-1">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {currentDate}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {site.socialLinks.instagram && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.telegram && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.twitter && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {site.socialLinks.tiktok && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </Link>
                </Button>
              )}
              {site.socialLinks.youtube && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
} 