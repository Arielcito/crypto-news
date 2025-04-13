import { ThemeToggle } from './theme-toggle'
import { useDomain } from '@/lib/use-domain'
import { Button } from './ui/button'
import Link from 'next/link'
import { Instagram, MessageSquare, Twitter, Youtube } from 'lucide-react'
import { FaTelegram, FaTiktok, FaYoutube } from 'react-icons/fa'

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
                  <FaTelegram className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              {site.socialLinks.tiktok && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    <FaTiktok className="mr-2 h-4 w-4" />
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