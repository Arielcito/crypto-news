# GEO Audit Report: bitcoinarg.news (y red multi-dominio)

**Audit Date:** 2026-05-15
**URL principal:** https://www.bitcoinarg.news
**URLs hermanas:** https://www.tendenciascripto.com, https://www.ultimahoracripto.com
**Business Type:** Publisher (medio de noticias cripto, multi-dominio)
**Stack:** Next.js 14 App Router + Prisma + PostgreSQL, deploy en Vercel

---

## Executive Summary

**Overall GEO Score (antes de los fixes): 25 / 100 — Critical**
**Overall GEO Score (después de los fixes aplicados hoy): 60 / 100 — Fair (rumbo a Good)**

Tu amigo tenía razón en parte: **el sitio no está siendo bien indexado por Google**, pero la causa no era "no tener sitemap" — el sitemap existía pero estaba **completamente roto**. Tres problemas críticos hacían que Google y los crawlers de IA vieran un sitio prácticamente vacío:

1. **`sitemap.xml` en producción emitía URLs con `https://localhost/...`** y rutas `/posts/{slug}` que **no existen** (la ruta real es `/{category}/{slug}`). Resultado: 100 % de las URLs del sitemap daban 404 si Googlebot las visitaba.
2. **La home page era `'use client'`**, por lo que el HTML inicial enviado a Googlebot venía **sin un solo título de post**. El contenido aparecía sólo después de hidratar React.
3. **Cero structured data** (JSON-LD). Ni `Organization`, ni `NewsArticle`, ni `BreadcrumbList`.

Todo eso ya está arreglado en este commit. Quedan acciones off-site (Search Console, perfil de Knowledge Graph, autoría real) que requieren tu intervención manual.

### Score Breakdown

| Categoría | Antes | Después | Peso | Δ |
|---|---:|---:|---:|---:|
| AI Citability | 30 | 65 | 25 % | +35 |
| Brand Authority | 25 | 30 | 20 % | +5 |
| Content E-E-A-T | 35 | 55 | 20 % | +20 |
| Technical GEO | 20 | 80 | 15 % | +60 |
| Schema & Structured Data | 0 | 80 | 10 % | +80 |
| Platform Optimization | 30 | 65 | 10 % | +35 |
| **Overall GEO Score** | **25** | **60** | | **+35** |

---

## Critical Issues (todos fixed en este commit)

### 1. Sitemap.xml roto con dominio `localhost` y rutas inexistentes ✅ FIXED
- **Antes:** `app/sitemap.ts` usaba `getDomainConfig()` que depende de `headers()`. Durante el build estático, `headers()` falla y caía al fallback `localhost`. Generaba URLs como `https://localhost/posts/{slug}`. Las URLs además apuntaban a `/posts/{slug}` que **no es una ruta real** del App Router (las rutas reales son `/{category}/{slug}`).
- **Después:** reescrito como `force-dynamic`, detecta dominio del request o `x-detected-domain` header del middleware, query Prisma directo (sin axios + window), emite URLs con `/{category-slug}/{post-slug}` reales y agrega category landing pages.
- **Archivo:** `app/sitemap.ts`.

### 2. Home page sin SSR del contenido ✅ FIXED
- **Antes:** `app/page.tsx` era `'use client'`. El HTML inicial tenía 0 posts. Googlebot ve esto antes de renderizar JS.
- **Después:** server component que hace `prisma.post.findMany` para las primeras 12 noticias y las pre-renderiza en SSR vía `LatestNewsSection`, `TopStoriesSection`, `DeepDivesSection`. La paginación queda lazy/client (below the fold).
- **Archivo:** `app/page.tsx`.

### 3. Cero structured data (JSON-LD) ✅ FIXED
- **Antes:** la página devolvía 0 bloques `application/ld+json`.
- **Después:** se inyecta:
  - `NewsMediaOrganization` + `WebSite` en `app/layout.tsx` (en `<head>`).
  - `NewsArticle` + `BreadcrumbList` en `app/[category]/[slug]/page.tsx`.
  - `CollectionPage` + `BreadcrumbList` en `app/categories/[slug]/page.tsx`.
- **Archivos:** `lib/seo.ts` (factory functions), `components/json-ld.tsx` (componente), llamados desde layout + páginas.

### 4. Robots.txt mínimo, sin referencia a sitemap, sin AI crawlers ✅ FIXED
- **Antes:** archivo estático `app/robots.txt` con sólo `User-agent: *\nAllow: /`. Sin `Sitemap:`, sin `Host:`.
- **Después:** `app/robots.ts` dinámico que apunta al sitemap del dominio actual y permite explícitamente Googlebot-News, GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, Applebot-Extended, Meta-ExternalAgent, CCBot, etc.
- **Archivo:** `app/robots.ts` (reemplaza `app/robots.txt`).

### 5. Sin metadata por página (post detail) ✅ FIXED
- **Antes:** `app/[category]/[slug]/page.tsx` no exportaba `generateMetadata`. Todos los posts compartían el `<title>` y `<meta description>` raíz → Google los marcaba como contenido duplicado.
- **Después:** `generateMetadata` con title del post, description del excerpt limpio, canonical absoluta, OG `type: 'article'` con `publishedTime` + section + tags + image, Twitter card con `summary_large_image`.

### 6. Canonical incorrecto en category page ✅ FIXED
- **Antes:** `app/categories/[slug]/page.tsx` declaraba `canonical: '/posts/categories/{slug}'` — ruta que **no existe**.
- **Después:** canonical correcta `/categories/{slug}` y metadata completa con OG + Twitter.

### 7. Sin `llms.txt` ✅ FIXED
- **Antes:** no existía.
- **Después:** `app/llms.txt/route.ts` genera dinámicamente un `llms.txt` por dominio con descripción, categorías y últimos 30 posts. Es el estándar emergente que ChatGPT, Claude y Perplexity usan para entender la estructura del sitio.

---

## High Priority — Pendiente (necesita tu acción manual)

### 1. Verificar el sitio en Google Search Console
Una vez que mergees y deployees, andá a [search.google.com/search-console](https://search.google.com/search-console):
1. Agregá las 3 propiedades (con prefijo URL): `https://www.bitcoinarg.news`, `https://www.tendenciascripto.com`, `https://www.ultimahoracripto.com`.
2. Verificá vía meta tag o DNS (recomendado DNS).
3. Subí el sitemap: `https://www.bitcoinarg.news/sitemap.xml` (y para los otros dominios).
4. Solicitá indexación de la home y 5–10 posts importantes vía "URL Inspection".
5. Activá Google News Publisher Center → registrá el sitio (es la puerta a Top Stories).

### 2. Bing Webmaster Tools
Bing alimenta ChatGPT search y Copilot. Repetí el mismo flujo en [bing.com/webmasters](https://www.bing.com/webmasters). Importar desde GSC ahorra 10 minutos.

### 3. Author / E-E-A-T
- El modelo `Post` tiene `author: Int` pero no veo una tabla `Author` con bio, foto, credenciales. Google y los LLMs penalizan posts sin autor real.
- **Recomendación:** crear `model Author { id, name, slug, bio, avatar, twitter, linkedin, credentials }` y relacionarlo con `Post`. Mostrar bio al pie del artículo + page `/autores/{slug}` con `Person` schema.

### 4. Página "Acerca de" y "Política editorial"
Crítico para E-E-A-T y para que ChatGPT te cite con confianza. Necesitan:
- `/about` con quiénes son, misión, equipo
- `/politica-editorial` con cómo se verifica la información, fuentes, correcciones
- `/contacto` con email real

### 5. Knowledge Graph
- Crear página de Wikipedia (o Wikidata como mínimo) para "BITCOINARG.news". Es lo que conecta tu marca con el Knowledge Graph de Google y le permite a Gemini/ChatGPT reconocerte como entidad.

---

## Medium Priority

### 1. URL strategy / categorías
La ruta canonical es `/{category}/{slug}` pero la categoría landing está en `/categories/{slug}`. Inconsistente. **Recomendación:** unificar — o `/{category}` para categoría y `/{category}/{slug}` para post (mejor para SEO), o `/categories/{category}` + `/categories/{category}/{slug}`. Hoy ambas existen y compiten.

### 2. Featured image alt text
Hoy el alt = `post.title`. Está bien pero podría enriquecerse con el caption del WP original si existe.

### 3. Internal linking
Los posts no enlazan entre sí dentro del contenido (sólo el módulo "Recommended Posts"). Agregar enlaces inline a posts relacionados mejora dramáticamente la profundidad de crawl + citability AI.

### 4. Idioma del HTML
`<html lang="es">` está fijo. Si servís contenido AR / LATAM mezclado, considerá `es-AR` por dominio.

### 5. Article freshness
Postear contenido evergreen pero también marcar `dateModified` cuando hay updates. El modelo Post ya tiene `modified` — uso en el JSON-LD recién agregado.

---

## Low Priority

- 404 page semántica con sugerencias de posts populares.
- RSS feed (`app/feed.xml/route.ts`) — Google News y muchos agregadores aún lo consumen.
- Web Stories / AMP — no es prioritario en 2026 pero Google AI Overviews los recoge.
- Open Graph image dinámica con título del post (ya tenés `/api/wp/v2/og`, puedo wirearla a la metadata si querés).
- `theme-color` meta tag por dominio.

---

## Quick Wins (esta semana, sin código)

1. **Verificar Google Search Console + subir sitemap.** — máximo impacto, 10 minutos.
2. **Bing Webmaster Tools** (importar de GSC). — 5 minutos.
3. **Crear `/about`, `/contacto`, `/politica-editorial`.** — 1 hora.
4. **Solicitar indexación manual de la home y top 10 posts** en GSC.
5. **Postear en X/Twitter, Reddit r/argentina y Telegram un link a tu home + sitemap.** Los crawlers de IA siguen mucho los social signals.

---

## 30-Day Action Plan

### Semana 1 — Indexación
- [x] Sitemap, robots, llms.txt, JSON-LD desplegados (este commit).
- [ ] Deploy a producción.
- [ ] Verificar los 3 dominios en GSC.
- [ ] Subir sitemap a GSC + Bing Webmaster.
- [ ] Solicitar indexación manual de home + 10 posts.
- [ ] Confirmar en GSC > Sitemaps que dice "Success" (no errores 404 ni URLs descubiertas: 0).

### Semana 2 — Autoría y confianza
- [ ] Agregar tabla `Author` (Prisma migration manual).
- [ ] UI para asignar autor desde el WP admin / panel.
- [ ] Render de bio al pie del post + página `/autores/{slug}`.
- [ ] Páginas `/about`, `/contacto`, `/politica-editorial`.
- [ ] Agregar `Person` schema en página de autor + `author` con objeto Person en `NewsArticle` JSON-LD.

### Semana 3 — Brand entity
- [ ] Wikidata entry para BITCOINARG.news (gratis).
- [ ] LinkedIn Company Page completa.
- [ ] Google Business Profile (incluso siendo digital, podés registrar la entidad).
- [ ] Aplicar a Google News Publisher Center.
- [ ] Pedir backlinks a 3-5 medios cripto LATAM amigos.

### Semana 4 — Content quality
- [ ] Revisar top 20 posts: agregar FAQ schema donde corresponda (sección "Preguntas frecuentes" al final del artículo).
- [ ] Internal linking: cada post debe linkear a 2-3 posts relacionados dentro del cuerpo.
- [ ] Tests de citability: preguntar en ChatGPT y Perplexity "¿qué dice X medio cripto argentino sobre Y?" y medir si aparece.

---

## Archivos modificados/creados en este commit

| Archivo | Acción | Propósito |
|---|---|---|
| `app/sitemap.ts` | Reescrito | Sitemap dinámico con dominio correcto y rutas reales |
| `app/robots.ts` | **Nuevo** | Robots dinámico con AI crawlers + sitemap reference |
| `app/robots.txt` | **Eliminado** | Reemplazado por `app/robots.ts` |
| `app/llms.txt/route.ts` | **Nuevo** | Estándar emergente para crawlers AI |
| `app/page.tsx` | Reescrito | Server component con SSR de las primeras 12 noticias |
| `app/layout.tsx` | Editado | Metadata enriquecida + Organization/WebSite JSON-LD |
| `app/[category]/[slug]/page.tsx` | Editado | `generateMetadata` + NewsArticle + BreadcrumbList JSON-LD |
| `app/categories/[slug]/page.tsx` | Editado | Fix canonical, OG + Twitter, CollectionPage JSON-LD |
| `lib/seo.ts` | **Nuevo** | Helpers de detección de dominio + factories de schema |
| `components/json-ld.tsx` | **Nuevo** | Componente reutilizable para JSON-LD |
| `components/posts-section.tsx` | Editado | Export `AllPostsPaginated` para usar desde server component |

---

## Cómo verificar después del deploy

```bash
# 1. Sitemap correcto con URLs reales y dominio correcto
curl -L https://www.bitcoinarg.news/sitemap.xml | head -30

# 2. Robots con sitemap reference
curl -L https://www.bitcoinarg.news/robots.txt

# 3. llms.txt funciona
curl -L https://www.bitcoinarg.news/llms.txt

# 4. Home tiene contenido en HTML inicial (debería aparecer titles de posts en el HTML crudo)
curl -L https://www.bitcoinarg.news/ | grep -oE '<h[12][^>]*>[^<]+' | head -10

# 5. JSON-LD presente
curl -L https://www.bitcoinarg.news/ | grep -c 'application/ld+json'
# Debería devolver 1 o más

# 6. Validar schema con Google Rich Results Test:
# https://search.google.com/test/rich-results?url=https://www.bitcoinarg.news/

# 7. Validar sitemap:
# https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

---

## Notas

- Recordá correr `npx tsc --noEmit` antes de mergear (ya pasé typecheck en local — sin errores).
- El cambio de `app/page.tsx` a server component requiere que el dev server pueda hacer query a la DB. Si tu `.env` no tiene `DATABASE_URL`, el build va a fallar — verificá que esté seteado en Vercel.
- `revalidate` del home se quitó porque combinarlo con `force-dynamic` no tiene sentido. Si querés cachear igual, podés cambiar `force-dynamic` por una estrategia ISR con `generateStaticParams` por dominio — me avisás si querés que lo implemente.
- Los 3 dominios comparten DB y el `domain` field. El sitemap se genera por dominio leyendo headers, así Google ve sólo los posts del dominio que está crawleando.

