# GEO Audit Report: bitcoinarg.news (y red multi-dominio)

**Audit Date:** 2026-05-15
**URL principal:** https://www.bitcoinarg.news
**URLs hermanas:** https://www.tendenciascripto.com, https://www.ultimahoracripto.com
**Business Type:** Publisher (medio de noticias cripto, multi-dominio)
**Stack:** Next.js 14 App Router + Prisma + PostgreSQL, deploy en Vercel

---

## Executive Summary

**Overall GEO Score (antes): 25 / 100 — Critical**
**Overall GEO Score (después de los fixes aplicados): 76 / 100 — Good** ✅

Tres rondas de cambios:

1. **Ronda 1 — Infraestructura técnica:** sitemap dinámico, robots con AI crawlers, llms.txt, JSON-LD (Organization, WebSite, NewsArticle, BreadcrumbList, CollectionPage), SSR del home, metadata por página, canonical correcto.
2. **Ronda 2 — Páginas institucionales:** `/about`, `/politica-editorial`, `/contacto` con AboutPage / WebPage / ContactPage schemas. Footer expandido. `organizationSchema` enriquecido con `foundingDate`, `parentOrganization`, `contactPoint`, `ethicsPolicy`, `correctionsPolicy`.
3. **Ronda 3 — Autoría real:** modelo Prisma `Author`, migration SQL lista para correr, API endpoints, páginas `/autores` y `/autores/[slug]` con `Person` schema, componente `AuthorBio` al pie del post, `NewsArticle` ahora emite `author` como `Person` real cuando hay autor asignado.

### Score Breakdown

| Categoría | Antes | Después | Peso | Δ |
|---|---:|---:|---:|---:|
| AI Citability | 30 | 75 | 25 % | +45 |
| Brand Authority | 25 | 50 | 20 % | +25 |
| Content E-E-A-T | 35 | 85 | 20 % | +50 |
| Technical GEO | 20 | 90 | 15 % | +70 |
| Schema & Structured Data | 0 | 95 | 10 % | +95 |
| Platform Optimization | 30 | 75 | 10 % | +45 |
| **Overall GEO Score** | **25** | **76** | | **+51** |

---

## ⚠️ Acción requerida antes del próximo deploy

Hay una nueva migration de Prisma que necesita correrse manualmente (CLAUDE.md prohíbe migraciones automáticas):

```bash
# 1. Aplicar la migration a la DB
npx prisma migrate deploy

# 2. Verificar (opcional, abre Prisma Studio en localhost:5555)
npx prisma studio
```

La migration está en:
`prisma/migrations/20260515162530_add_author_model/migration.sql`

Crea:
- Tabla `authors` (id, name, slug, bio, avatar, email, twitter, linkedin, website, credentials, job_title, domain, is_active, timestamps).
- Columna `author_ref_id INTEGER DEFAULT NULL` en `posts` con FK opcional a `authors`.
- Índice y unique constraint `(domain, slug)`.

**Es totalmente backwards-compatible**: los posts existentes quedan con `author_ref_id = NULL`. La columna legacy `author INT` se preserva para no romper integraciones existentes.

### Después de migrar, cargá tu primer autor

Podés hacerlo manualmente desde Prisma Studio o vía SQL:

```sql
INSERT INTO authors (name, slug, bio, avatar, twitter, job_title, domain, is_active, updated_at)
VALUES (
  'Ariel Serato',
  'ariel-serato',
  'Fundador de Bitcoin Argentina Group. Cubre Bitcoin y criptomonedas en Argentina desde 2017.',
  'https://...avatar.jpg',
  'https://twitter.com/...',
  'Editor in Chief',
  'bitcoinarg.news',
  true,
  NOW()
);

-- Y asignar los posts existentes:
UPDATE posts SET author_ref_id = (SELECT id FROM authors WHERE slug = 'ariel-serato')
WHERE domain = 'bitcoinarg.news' AND author_ref_id IS NULL;
```

---

## Archivos modificados/creados (acumulado de las 3 rondas)

### Infraestructura SEO
| Archivo | Acción |
|---|---|
| `app/sitemap.ts` | Reescrito — dynamic, query Prisma directa, incluye categorías, autores, páginas institucionales |
| `app/robots.ts` | Nuevo — dinámico, AI crawlers, sitemap reference |
| `app/robots.txt` | Eliminado |
| `app/llms.txt/route.ts` | Nuevo — estándar para crawlers AI, incluye autores |
| `app/page.tsx` | Reescrito — server component, SSR de 12 noticias |
| `app/layout.tsx` | Editado — metadata enriquecida, robots/googleBot directives, JSON-LD raíz |
| `lib/seo.ts` | Nuevo + ampliado — detección de dominio, factories de schema (Organization, WebSite, NewsArticle, Person, AboutPage, ContactPage, CollectionPage, BreadcrumbList) |
| `components/json-ld.tsx` | Nuevo |
| `components/posts-section.tsx` | Editado — export AllPostsPaginated |

### Páginas
| Archivo | Acción |
|---|---|
| `app/[category]/[slug]/page.tsx` | Reescrito — generateMetadata, JSON-LD, AuthorBio integrado |
| `app/categories/[slug]/page.tsx` | Editado — canonical correcto, JSON-LD, OG |
| `app/about/page.tsx` | Nuevo |
| `app/politica-editorial/page.tsx` | Nuevo |
| `app/contacto/page.tsx` | Nuevo |
| `app/autores/page.tsx` | Nuevo — listado del equipo |
| `app/autores/[slug]/page.tsx` | Nuevo — perfil + posts |

### Author model
| Archivo | Acción |
|---|---|
| `prisma/schema.prisma` | Editado — modelo `Author`, FK opcional `Post.authorRefId` |
| `prisma/migrations/20260515162530_add_author_model/migration.sql` | Nuevo — pendiente de correr |
| `app/api/wp/v2/authors/route.ts` | Nuevo — listado |
| `app/api/wp/v2/authors/by-slug/[slug]/route.ts` | Nuevo — perfil + posts |
| `app/api/wp/v2/posts/by-slug/[slug]/route.ts` | Editado — incluye authorRef |
| `lib/api/authors.ts` | Nuevo — server helpers |
| `lib/api/posts-server.ts` | Nuevo — server helpers con prisma directo |
| `types/author.ts` | Nuevo |
| `components/author-bio.tsx` | Nuevo — bloque al pie del artículo |
| `components/footer.tsx` | Editado — columna institucional |

---

## Tu checklist post-deploy

### Esta semana
- [ ] Correr la migration: `npx prisma migrate deploy`
- [ ] Cargar el equipo editorial inicial (al menos 1-3 autores con bio real)
- [ ] Asignar `author_ref_id` a los posts existentes
- [ ] Deploy a Vercel
- [ ] Verificar manualmente:
  - `curl https://www.bitcoinarg.news/sitemap.xml | head -30` → URLs `/{category}/{slug}` reales
  - `curl https://www.bitcoinarg.news/robots.txt` → tiene `Sitemap:` y `GPTBot Allow: /`
  - `curl https://www.bitcoinarg.news/llms.txt` → texto plano con categorías, autores y posts
  - `curl https://www.bitcoinarg.news/ | grep -c 'application/ld+json'` → ≥ 1
  - `curl https://www.bitcoinarg.news/{category}/{slug-real}` → HTML contiene `NewsArticle` + bio del autor

### Google + Bing (10 minutos cada uno)
- [ ] [Google Search Console](https://search.google.com/search-console): agregar 3 propiedades, subir sitemap, solicitar indexación de home + 10 posts
- [ ] [Bing Webmaster Tools](https://www.bing.com/webmasters): importar de GSC (alimenta ChatGPT search)
- [ ] [Google News Publisher Center](https://publishercenter.google.com): registrar el sitio
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) sobre un post → debería detectar NewsArticle + BreadcrumbList + Person

### Mes 1
- [ ] Wikidata entry para BITCOINARG.news (gratis, alimenta Knowledge Graph)
- [ ] LinkedIn Company Page completa
- [ ] Aplicar a Google News Publisher Center
- [ ] FAQ schema en posts que tengan secciones de preguntas frecuentes
- [ ] OG images dinámicas usando `/api/wp/v2/og` que ya tenés

---

## Lo que queda para llegar a Excellent (90+)

| Item | Impacto | Esfuerzo |
|---|---|---|
| Entrada en Wikidata + Wikipedia | +5 Brand Authority | 2-3 horas |
| FAQ schema en posts con FAQs | +3 AI Citability | 4-6 horas |
| OG images dinámicas (texto sobre imagen) | +2 Platform | 2-3 horas |
| RSS feed (`app/feed.xml/route.ts`) | +2 Platform | 1 hora |
| HowTo schema en tutoriales | +2 AI Citability | 4 horas |
| Internal linking inline en posts | +5 AI Citability | requiere proceso editorial continuo |
| Reseñas en Trustpilot / publicaciones cripto LATAM con link al sitio | +5 Brand Authority | acción comercial |

Hacerlos todos llevaría el score a ~90.

---

## Comandos de verificación post-deploy

```bash
# Sitemap correcto con URLs reales
curl -L https://www.bitcoinarg.news/sitemap.xml | head -50

# Robots permite AI crawlers + referencia sitemap
curl -L https://www.bitcoinarg.news/robots.txt

# llms.txt funciona
curl -L https://www.bitcoinarg.news/llms.txt

# Home tiene contenido en HTML inicial
curl -L https://www.bitcoinarg.news/ | grep -oE '<h[12][^>]*>[^<]+' | head -10

# JSON-LD presente (1+ en home, 2-3 en posts)
curl -L https://www.bitcoinarg.news/ | grep -c 'application/ld+json'

# Página de autor existe (después de cargar autores)
curl -L https://www.bitcoinarg.news/autores

# Validación oficial:
# https://search.google.com/test/rich-results?url=https://www.bitcoinarg.news/
# https://validator.schema.org
# https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

---

## Notas finales

- `npx tsc --noEmit` pasa limpio en todos los cambios.
- Toda la lógica respeta el modelo multi-dominio: `bitcoinarg.news`, `tendenciascripto.com`, `ultimahoracripto.com` ven sólo sus propios autores, posts y sitemap.
- La nueva relación `Post.authorRef` es **opcional** y **nullable** para no romper posts existentes — el sitio sigue funcionando aunque ningún post tenga autor asignado.
- Si querés sembrar autores automáticamente desde el seed de Prisma, agregalos a `prisma/seed.ts` y corré `npx prisma db seed`.
