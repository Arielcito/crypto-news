# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server
npm run dev

# Build for production (includes Prisma generate)
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check (always run after changes)
npx tsc --noEmit
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# View database in browser
npx prisma studio
```

## Architecture

### Multi-Domain News Platform
This is a Next.js application that serves three cryptocurrency news domains:
- `bitcoinarg.news` - Argentina/LATAM focused Bitcoin news
- `tendenciascripto.com` - Blockchain/DeFi/Web3 analysis
- `ultimahoracripto.com` - Breaking crypto news

### Key Architecture Components

#### Domain Detection System
- `middleware.ts` - Detects domain from headers, sets CORS, adds debugging headers
- `lib/domain-config.ts` - Contains domain-specific configurations, colors, social links, categories
- `lib/domain-colors.ts` - Theme colors for each domain
- `lib/use-domain.ts` - React hook for domain detection

#### Database & API
- **Prisma ORM** with PostgreSQL
- **API Routes** follow WordPress REST API patterns (`/api/wp/v2/`)
- **Multi-domain posts** with domain-specific categories
- **Schema**: Posts, DomainCategories, Tags with domain isolation

#### Frontend Architecture
- **App Router** with dynamic routing per domain
- **Component Structure**: 
  - `components/ui/` - shadcn/ui components
  - `components/` - Feature components
  - `app/` - Pages and layouts
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with domain-specific CSS variables
- **Theming**: next-themes with domain-specific color schemes

### Domain-Specific Features
- **Dynamic metadata** generation based on domain
- **Domain-specific logos** and favicons
- **Category filtering** by domain
- **Social media links** per domain
- **SEO optimization** with domain-specific OG images

### Data Flow
1. Middleware detects domain from request headers
2. Domain config provides site-specific settings
3. API routes filter content by domain
4. Components render domain-specific UI and content
5. Theme provider applies domain-specific colors

## Development Guidelines

### Adding New Components
- Follow shadcn/ui patterns for UI components
- Use domain context via `useDomain()` hook
- Implement atomic design principles
- Check existing component patterns before creating new ones

### Working with Posts
- All posts are stored in single table with domain field
- Use `lib/api/posts.ts` for data fetching
- Content is stored in Markdown format
- Featured media are URL strings (changed from numeric IDs)

### Database Changes
- **Never run migrations** in development
- Use `npx prisma db seed` to populate test data
- Always run `npx prisma generate` after schema changes

### Type Safety
- Always run `npx tsc --noEmit` after changes
- Check existing types in `lib/types.d.ts` and `types/` before creating new ones
- Use interfaces that match database schema

### Package Management
- Use `pnpm` as package manager
- Never use npm or yarn

### Logging
- Add strategic logs showing key process moments
- Use console.log with emoji prefixes for debugging
- Domain detection includes extensive logging

## Domain Configuration

### Adding New Domain
1. Add domain to `domainConfigs` in `lib/domain-config.ts`
2. Add domain mapping in `middleware.ts`
3. Create domain-specific assets in `public/`
4. Add favicon path in `app/layout.tsx`
5. Update CSS variables in `app/globals.css`

### Domain-Specific Styling
Each domain has its own color scheme:
- **bitcoinarg.news**: Orange Bitcoin (#F7931A), Blue (#03A9F4), Light Gray (#ECEFF1)
- **tendenciascripto.com**: Electric Blue (#2979FF), Purple (#673AB7), Dark Gray (#37474F)  
- **ultimahoracripto.com**: Red (#D32F2F), Black (#212121), White (#FAFAFA)

## Testing
- No specific test framework configured
- Check README.md for any testing instructions
- Run build command to verify production readiness

## Production Considerations
- Uses standalone output mode for Docker deployment
- Includes Google AdSense integration
- Optimized caching for static assets
- CORS configured for allowed domains
- Vercel Analytics integration