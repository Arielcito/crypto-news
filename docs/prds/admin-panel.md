# PRD: Admin panel — full CRUD for Posts (upload, edit, delete) across all domains

## Problem Statement

Content for the three sites (bitcoinarg.news, tendenciascripto.com, ultimahoracripto.com) is created and modified today only by calling the `/api/wp/v2/posts` REST API directly with Basic Auth (WordPress-style), or by writing straight to the database. There is no browser UI to create, edit, or delete a Post, no way to upload a featured image (URLs are pasted in by hand), and no protected area of the site at all — `middleware.ts` only handles CORS/domain detection, it does not gate any route. The person publishing content has no safe, visual way to manage notes, and deleting a Post today is a permanent, unrecoverable `prisma.post.delete`.

## Solution

A password-protected `/admin` panel, reachable from any of the three domains, that lets the single admin user log in and fully manage Posts: create, edit, soft-delete (and by extension restore), assign category/tag/author, set draft/publish status, and upload a featured image — without touching Prisma Studio or crafting raw API calls. The panel also manages the DomainCategories and Tag lookups that Posts depend on. Auth is a lightweight session cookie (iron-session) checked by middleware, not the existing Basic Auth (which remains untouched for the public WP-style API). All admin mutations go through new internal `/api/admin/*` endpoints, kept separate from the public `/api/wp/v2/*` contract.

## User Stories

1. As the site admin, I want to log in to `/admin` with a username and password, so that only I can manage content.
2. As the site admin, I want to be redirected to `/admin/login` if I visit any `/admin/*` page without a valid session, so that the panel is never exposed to anonymous visitors.
3. As the site admin, I want my session to persist across page loads via a secure cookie, so that I don't have to re-enter credentials on every request.
4. As the site admin, I want to log out and immediately lose access to `/admin/*`, so that I can secure the panel on a shared machine.
5. As the site admin, I want to see a list of all Posts across all three domains in one place, so that I don't have to jump between separate admin instances per domain.
6. As the site admin, I want to filter the Posts list by domain, category, tag, author, and status (draft/publish), so that I can find a specific note quickly.
7. As the site admin, I want to search Posts by title, so that I don't have to scroll through pages of results.
8. As the site admin, I want the Posts list to paginate, so that performance doesn't degrade as the number of notes grows.
9. As the site admin, I want the Posts list to render as a table on desktop and as stacked cards on mobile, so that I can manage content comfortably from my phone.
10. As the site admin, I want to create a new Post by picking its domain first, so that the category/tag/author choices I'm shown are only the ones valid for that domain.
11. As the site admin, I want to write the Post's body in Markdown with a live preview, so that I can see how the formatted content will look before publishing.
12. As the site admin, I want the Post's slug to auto-generate from the title but remain editable, so that I can fix awkward auto-generated slugs before saving.
13. As the site admin, I want a clear error if my chosen slug already exists for that domain, so that I don't lose my work to a silent failure.
14. As the site admin, I want to upload a featured image by dragging/dropping or selecting a file, so that I don't have to host the image somewhere else first and paste a URL.
15. As the site admin, I want to see the image preview after upload, so that I can confirm it's the right one before saving the Post.
16. As the site admin, I want to assign an existing Author to the Post from a dropdown scoped to the Post's domain, so that bylines stay consistent with what's on `/autores`.
17. As the site admin, I want to assign one or more existing Categories and Tags to the Post (scoped to its domain), so that the note shows up correctly in archive pages.
18. As the site admin, I want to set the Post's status to draft or publish, so that I can prepare content ahead of time without it going live.
19. As the site admin, I want to save a draft and come back to finish it later, so that I'm not forced to complete a note in one sitting.
20. As the site admin, I want to edit any existing Post's title, slug, content, excerpt, featured image, author, categories, tags, domain, and status, so that I can fix mistakes or update stale content.
21. As the site admin, I want the Post's `modified`/`modifiedGmt` timestamps to update automatically on every edit, so that "last updated" data stays accurate without manual input.
22. As the site admin, I want to delete a Post from the list (with a confirmation dialog), so that I don't accidentally remove content with one click.
23. As the site admin, I want a deleted Post to be soft-deleted (`isActive: false`), so that I can recover it if I made a mistake, and so it disappears from all public-facing queries immediately.
24. As the site admin, I want deleted Posts to stop appearing anywhere on the public site (home, category archives, post detail, RSS, sitemap) the moment I delete them, so that visitors never see stale or removed content.
25. As the site admin, I want to manage DomainCategories (create, edit name/slug, soft-delete) from the panel, so that I don't need Prisma Studio to keep the taxonomy current.
26. As the site admin, I want to manage Tags (create, edit, delete) from the panel, so that I can keep the tag list clean without direct DB access.
27. As the site admin, I want validation errors (missing title, invalid domain, duplicate slug, etc.) to show inline on the form, so that I know exactly what to fix.
28. As the site admin, I want toast confirmations after successful create/edit/delete actions, so that I have clear feedback that my action went through.
29. As the site admin, I want the admin panel's own mutations to be logged server-side at entry, on external calls (Blob upload, DB writes), and on error branches, so that issues can be diagnosed after the fact.
30. As a developer maintaining this codebase, I want the admin CRUD logic (slug generation, category/tag/domain validation) shared between `/api/admin/*` and `/api/wp/v2/*` via a common `lib/` module, so that business rules aren't duplicated and can't drift between the two surfaces.
31. As a developer, I want the public `/api/wp/v2/*` contract left untouched by this work, so that any existing external consumer of that API keeps working exactly as before.

## Implementation Decisions

- **Auth**: single shared admin identity via `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars (new, separate from the existing `WORDPRESS_USERNAME`/`WORDPRESS_PASSWORD`, which remain scoped to the public Basic Auth API). No `User` model is introduced — this is intentionally a single-operator admin, not multi-user/role-based.
- **Session mechanism**: `iron-session`, cookie-based, `httpOnly` + `secure` + `sameSite`, encrypted with a new `SESSION_SECRET` env var. No JWT library, no NextAuth — chosen for minimal footprint given there's exactly one admin identity.
- **Route protection**: `middleware.ts` gains a check for `/admin/*` (excluding `/admin/login` and the `/api/admin/login`/`/api/admin/logout` endpoints) that validates the iron-session cookie and redirects to `/admin/login` when absent/invalid. This is additive to the existing CORS/domain-detection logic already in `middleware.ts`, not a replacement.
- **API surface**: new, separate `/api/admin/*` route group (e.g. `/api/admin/login`, `/api/admin/logout`, `/api/admin/posts`, `/api/admin/posts/[id]`, `/api/admin/categories`, `/api/admin/categories/[id]`, `/api/admin/tags`, `/api/admin/tags/[id]`, `/api/admin/upload`), authenticated only via the session cookie (not Basic Auth). The existing `/api/wp/v2/*` routes are not modified in shape or auth — they keep serving Basic Auth-gated writes and public reads exactly as today.
- **Shared business logic**: slug generation, category/tag-exists-for-domain validation, and excerpt auto-generation are extracted out of the current inline logic in the `wp/v2/posts` route handlers into a shared `lib/` module, consumed by both `/api/wp/v2/posts` and `/api/admin/posts`. No behavior change to the existing public API — this is a refactor-for-reuse, not a rewrite.
- **Schema change**: add `isActive Boolean @default(true)` to the `Post` model, matching the existing convention already used by `DomainCategories` and `Author`. Migration is authored but not run automatically — the developer runs `prisma migrate` manually per project convention.
- **Soft delete semantics**: `DELETE /api/admin/posts/[id]` sets `isActive: false` instead of `prisma.post.delete`. Every existing and new query that surfaces Posts publicly (`GET /api/wp/v2/posts`, `by-slug`, home page, category archive, RSS feed, sitemap) must add an `isActive: true` filter so soft-deleted Posts disappear from all public surfaces immediately. `GET /api/admin/posts` shows only `isActive: true` Posts by default (no restore UI in this scope — see Out of Scope).
- **Media upload**: `@vercel/blob` added as a dependency. `POST /api/admin/upload` accepts a file, uploads it to Vercel Blob, and returns the resulting URL, which the client then sets as `featuredMedia` on the Post form. Requires a `BLOB_READ_WRITE_TOKEN` env var, provisioned by the developer via the Vercel dashboard — not generated or hardcoded by the implementation.
- **Content editor**: `@uiw/react-md-editor` added as a dependency for the Post body field. It edits and stores raw Markdown directly (matching `Post.content`'s existing storage format), with no HTML⟷Markdown conversion layer.
- **Domain scoping in the panel**: the panel is a single instance managing all three domains, not three separate deployments/instances. Creating a Post requires picking its `domain` first; the Category, Tag, and Author selects are then filtered to that domain (matching the existing `@@unique([domain, slug])` scoping already in the schema for `DomainCategories`, `Author`, and the `domain` field on `Tag`). The Posts list has a domain filter but shows all domains by default.
- **Author assignment**: the Post form includes a select of existing `Author` records (scoped by domain) to set `authorRefId`. Creating/editing `Author` records themselves is out of scope for this PRD (see Out of Scope) — assumed to be covered by whatever produced the existing `/autores` pages and `Author` model.
- **Status field**: the Post form exposes the existing `status` field as draft/publish, defaulting to `publish` to match the current schema default.
- **UI components**: new shadcn/ui components added — `table`, `dialog`, `alert-dialog` (delete confirmation), `textarea`, `tabs`, `sonner` (toast feedback) — alongside the already-installed `button`, `form`, `input`, `select`, `label`, `switch`, `pagination`.
- **Data fetching pattern**: follows the project's mandated build order — types, then `/api/admin/*` endpoints, then custom hooks (e.g. `useAdminPosts`, `useCreatePost`, `useUpdatePost`, `useDeletePost`, `useAdminCategories`, `useAdminTags`, `useUploadMedia`) wrapping TanStack React Query, then atomic components (`PostForm`, `PostsTable`/`PostsCardList`, `DeleteConfirmDialog`, `CategoryForm`, `TagForm`), then pages (`/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit`, `/admin/categories`, `/admin/tags`, `/admin/login`), then navigation wiring (an admin nav/sidebar linking these pages). All data handling lives inside the custom hooks, not inside components.
- **Forms**: `react-hook-form` + `zod` resolver for every admin form (Post, Category, Tag, login), per project convention. No native uncontrolled forms.
- **Responsive layout**: Posts/Categories/Tags tables render as a full-width table with sorting/filtering/pagination on desktop, and as a stacked card layout on mobile, per project convention — mobile-first.
- **Logging**: each `/api/admin/*` handler logs at entry, before/after the external call to Vercel Blob (for upload), on every error branch (validation failure, Prisma error, auth failure), and on successful exit — not on every intermediate variable.
- **Known pre-existing gap, explicitly not fixed by this PRD**: `POST/PUT/DELETE /api/wp/v2/categories` currently have no auth check at all (unlike `/api/wp/v2/posts`, which requires Basic Auth). This PRD does not touch that route's auth, since Category management in the admin panel goes through the new, separately-authenticated `/api/admin/categories` instead. Flagged here so it isn't mistaken for an oversight.

## Testing Decisions

- **Good test = behavior, not implementation**: tests exercise the `/api/admin/*` route handlers through real HTTP-shaped requests/responses (calling the exported route handler functions directly, as Next.js route handlers allow), asserting on status codes and response bodies — never asserting on internal function calls, Prisma query shapes, or component internals.
- **Single seam, chosen deliberately**: the project has no test runner today (no jest/vitest/playwright, no `test` script in `package.json`). Rather than introduce multiple seams (unit tests for hooks, component tests, API tests), this PRD introduces exactly one: integration tests against the `/api/admin/*` route handlers, run against a real (test/local) Postgres database via Prisma — no mocking of Prisma itself. This is the highest-value seam because all the business rules this PRD adds (auth gating, soft-delete, domain-scoped validation, slug collisions) live at that layer.
- **Test runner**: Vitest is added as the (first) test runner for this repo, chosen over Jest for faster ESM-native execution and lower config overhead with Next.js 14 App Router route handlers.
- **What gets covered**: login success/failure, session-gated access to every `/api/admin/*` route (401 without a valid cookie), Post create/edit/delete (including soft-delete leaving the row present but `isActive: false`), slug collision handling, domain-scoped category/tag/author validation, and the upload endpoint's contract (mocking only the Vercel Blob network call, not Prisma).
- **UI layer**: not covered by automated tests in this PRD. Per the project's existing convention (documented in this repo's `CLAUDE.md`), UI features are QA'd manually via Chrome MCP — golden path and edge cases exercised in-browser, console checked for errors, before the feature is considered done. No React Testing Library / Playwright is introduced by this PRD.
- **Prior art**: none — this is the first automated test suite in the repository. There is no existing test file or config to model against.

## Out of Scope

- A `User` model, multi-user login, or role-based permissions. Single shared admin credential only.
- Creating, editing, or deleting `Author` records from this panel (only assigning an existing Author to a Post).
- A "restore" UI for soft-deleted Posts (the data is preserved via `isActive: false`, but no admin screen to list/undelete them in this PRD).
- Any fix to the pre-existing lack of auth on `POST/PUT/DELETE /api/wp/v2/categories`.
- Rich WYSIWYG editing (Tiptap or similar) — Markdown-only editing via `@uiw/react-md-editor`.
- Any change to the public `/api/wp/v2/*` request/response contract.
- Bulk actions (bulk delete, bulk status change) on the Posts list.
- Revision history / version diffing of Post content.
- Image editing/cropping/resizing beyond the raw upload — whatever file is uploaded is stored and used as-is.
- Automated UI tests (Playwright/RTL) — UI is covered by manual Chrome MCP QA only, per existing project convention.
- Rate limiting on the new `/api/admin/*` endpoints beyond what already exists at the infra/CDN level.
- Any change to `WORDPRESS_USERNAME`/`WORDPRESS_PASSWORD` or the public API's Basic Auth mechanism.

## Further Notes

- This PRD assumes a single operator today, but the deliberate separation of `/api/admin/*` from `/api/wp/v2/*`, plus the shared `lib/` business-logic module, means introducing a real `User`/roles model later (if multiple editors are ever needed) is additive — it would touch the session/auth layer without requiring changes to the Post/Category/Tag CRUD logic itself.
- The domain-scoping pattern this PRD relies on (`@@unique([domain, slug])` on `DomainCategories`, similar scoping on `Author` and `Tag`) is pre-existing in the schema; this PRD does not introduce a new scoping mechanism, it reuses the one already established by the "feat(authors)" work.
- Soft-delete on `Post` brings it in line with `DomainCategories` and `Author`, which already use `isActive` — this PRD closes that inconsistency rather than introducing a new pattern.
