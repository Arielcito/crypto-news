# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (DO NOT run unless user says to)
npm run build        # Production build (runs prisma generate first)
npm run lint         # ESLint
npx tsc --noEmit     # Type check — always run after changes

npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db seed   # Seed database (never run migrations automatically)
npx prisma studio    # Browse database in browser

ANALYZE=true npm run build  # Bundle analysis
```

## Architecture

### Multi-Domain News Platform

Single Next.js 14 (App Router) codebase serving three crypto news sites:

| Domain | Focus | Primary Color |
|---|---|---|
| `bitcoinarg.news` | Argentina/LATAM Bitcoin | #F7931A (orange) |
| `tendenciascripto.com` | Blockchain/DeFi/Web3 analysis | #2979FF (electric blue) |
| `ultimahoracripto.com` | Breaking crypto news | #D32F2F (red) |

Localhost defaults to bitcoinarg.news colors in development.

### Domain Detection Flow

```
Request → middleware.ts (detect domain from host/origin headers, set CORS, inject X-Detected-Domain header)
       → lib/domain-config.ts (getDomainConfig() reads headers or NEXT_PUBLIC_DOMAIN env var)
       → lib/use-domain.ts (useDomain() hook — client-side, reads cookie "selected_domain" or window.location)
       → lib/domain-colors.ts (color palettes, getCurrentPalette())
       → lib/theme-provider.tsx (applies --primary/--secondary/--tertiary CSS variables)
```

Key: `useDomain()` returns `{ domain, setDomain, colors, site, isBitcoinArg, isTendenciasCrypto, isUltimaHoraCrypto }`. Use this hook in any component that needs domain context.

### Database (Prisma + PostgreSQL)

Three models with domain isolation:
- **Post** — `domain` field, many-to-many with DomainCategories and Tags. Content is Markdown. `featuredMedia` is a URL string (not numeric ID).
- **DomainCategories** — scoped `@@unique([domain, slug])`, soft-deleted via `isActive` flag
- **Tag** — globally unique by slug, has `domain` field

### API Routes

Follow WordPress REST API patterns under `/api/wp/v2/`:

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/wp/v2/posts` | GET, POST | GET: query `per_page`, `page`, `search`, `categories`, `tags`, `domain`. POST: requires Basic Auth |
| `/api/wp/v2/posts/by-slug/[slug]` | GET | Returns `{ data, error, message }` |
| `/api/wp/v2/categories` | GET, POST, PUT, DELETE | DELETE is soft-delete (sets isActive=false) |
| `/api/wp/v2/og` | GET | OG image generation |

API auth (`lib/auth.ts`): Basic HTTP auth using `WORDPRESS_USERNAME` / `WORDPRESS_PASSWORD` env vars.

API response format: `{ data: T, error: string | null, message: string | null }`

### Frontend Stack

- **State**: TanStack React Query (`app/providers.tsx` wraps QueryClientProvider)
- **HTTP**: Axios instance in `lib/axios.ts` (uses `NEXT_PUBLIC_API_URL`)
- **API clients**: `lib/api/posts.ts` and `lib/api/categories.ts`
- **Styling**: Tailwind CSS 3 + CSS variables for domain colors, tailwindcss-animate, @tailwindcss/typography
- **Animations**: Framer Motion — use smooth non-linear easing
- **Markdown**: react-markdown + remark-gfm for post content
- **UI primitives**: shadcn/ui (Radix-based) in `components/ui/`
- **Icons**: lucide-react + react-icons
- **Forms**: react-hook-form

### Page Routing

| Route | Type | Description |
|---|---|---|
| `/` (app/page.tsx) | Client | Home — PostsSection + lazy TelegramChannel |
| `/[category]/[slug]` | Server | Post detail — markdown content, TOC sidebar, RecommendedPosts |
| `/categories/[slug]` | Server | Category archive — PostCard grid |

### Layout Chain

`app/layout.tsx` (metadata + favicon per domain, preconnect hints, AdSense)
→ `app/providers.tsx` (TanStack Query)
→ `lib/theme-provider.tsx` (dark/light theme + domain CSS vars)
→ `components/client-layout.tsx` (MiniHeader → HeroHeader → CryptoPriceBanner → main → Footer)

Footer and TelegramChannel are lazy-loaded via `next/dynamic`.

### Analytics

Google Analytics 4 per domain (`lib/use-analytics.ts`):
- `NEXT_PUBLIC_GA_ID_BITCOINARG`
- `NEXT_PUBLIC_GA_ID_TENDENCIAS`
- `NEXT_PUBLIC_GA_ID_ULTIMAHORA`

Only active in production. Component: `components/analytics.tsx` uses `@next/third-parties`.

## Environment Variables

```
DATABASE_URL                      # PostgreSQL connection string
NEXT_PUBLIC_API_URL               # Axios base URL
NEXT_PUBLIC_DOMAIN                # Domain override (also falls back to VERCEL_URL)
WORDPRESS_USERNAME                # Basic auth for write API routes
WORDPRESS_PASSWORD                # Basic auth for write API routes
NEXT_PUBLIC_GA_ID_BITCOINARG      # GA4 measurement ID
NEXT_PUBLIC_GA_ID_TENDENCIAS      # GA4 measurement ID
NEXT_PUBLIC_GA_ID_ULTIMAHORA      # GA4 measurement ID
```

## Development Guidelines

### Package Management
- Use `npm` (package-lock.json is the lockfile)

### Adding a New Domain
1. Add config to `domainConfigs` in `lib/domain-config.ts`
2. Add palette to `domainPalettes` in `lib/domain-colors.ts`
3. Add domain mapping in `middleware.ts`
4. Create assets in `public/<domain>/`
5. Add favicon path in `app/layout.tsx`
6. Add CSS variable overrides in `app/globals.css`
7. Add GA env var mapping in `lib/use-analytics.ts`

### Working with Posts
- Single `Post` table with `domain` field for multi-domain isolation
- Content stored as Markdown, rendered via react-markdown
- `featuredMedia` is a URL string
- Use `lib/api/posts.ts` for fetching

### Production
- `output: 'standalone'` in next.config.js for Docker deployment
- Static assets cached 1 year (immutable); favicons cached 1 day
- CORS configured in middleware for allowed domains
- Google AdSense conditionally loaded in production
- Vercel Analytics integrated
