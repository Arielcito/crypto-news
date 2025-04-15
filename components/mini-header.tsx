import { ThemeToggle } from './theme-toggle'
import { useDomain } from '@/lib/use-domain'
import { Button } from './ui/button'
import Link from 'next/link'
import { Instagram, Youtube } from 'lucide-react'
import { FaTelegram, FaTiktok } from 'react-icons/fa'
import Image from 'next/image'
import { useTheme } from '@/lib/theme-provider'

export function MiniHeader() {
  const { site } = useDomain()
  const { theme } = useTheme()
  
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
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* Current date centered */}
          <div className="text-sm text-muted-foreground">
            {currentDate}
          </div>

          {/* Logo and site name centered */}
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image 
              src={theme === 'dark' ? site.logoDark : site.logo} 
              alt={site.name} 
              width={24} 
              height={24} 
              className="transition-transform duration-300"
            />
            <span className="text-sm font-medium">{site.name}</span>
          </Link>

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
                <FaTelegram className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {site.socialLinks.tiktok && (
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href={site.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                  <FaTiktok className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  )
} 