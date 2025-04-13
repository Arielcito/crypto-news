'use client'

import { useEffect, useState } from 'react'

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])

  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const h2s = Array.from(doc.querySelectorAll('h2'))
    
    const extractedHeadings = h2s.map(h2 => ({
      id: h2.id || h2.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: h2.textContent || '',
      level: 2
    }))

    setHeadings(extractedHeadings)
  }, [content])

  if (headings.length === 0) return null

  return (
    <div className="sticky top-8">
      <h3 className="text-lg font-semibold mb-4">Contenido</h3>
      <nav className="space-y-2">
        {headings.map(heading => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
} 