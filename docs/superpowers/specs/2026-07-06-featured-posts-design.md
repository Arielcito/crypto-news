# Noticias Destacadas (featured posts) — design note

**Date:** 2026-07-06

## What changed
"Historias Destacadas" was purely positional (posts 5–8 by date, no real selection). Now it's admin-controlled.

- `Post.featured: Boolean @default(false)` (prisma/schema.prisma)
- Admin checkbox "Destacado" in post form (components/admin/post-form.tsx), wired through admin create/update API routes and validation schema (lib/validations/admin.ts)
- Home page (app/page.tsx): `getFeaturedPosts()` selects up to 4 posts where `featured: true`, ordered by date desc; if fewer than 4 are marked, fills remaining slots with the latest non-featured posts so the section never looks empty
- Section title renamed "Historias Destacadas" → "Noticias Destacadas" (components/TopStoriesSection.tsx)

## Not done
- No expiry date — admin must manually untoggle when a paid placement ends (chosen for simplicity)
- Requires running `npx prisma migrate dev` (or equivalent) to add the `featured` column — not run automatically per project safety rules
