import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <Link 
            href={item.href}
            className="hover:text-primary transition-colors"
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  )
} 