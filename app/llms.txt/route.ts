import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectRequestDomain, getSiteIdentity } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const domain = detectRequestDomain();
  const identity = getSiteIdentity();
  const base = `https://${domain}`;

  const [categories, recentPosts, authors] = await Promise.all([
    prisma.domainCategories
      .findMany({
        where: { domain, isActive: true },
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      })
      .catch((error) => {
        console.error("[llms.txt] categories query failed:", error);
        return [] as { name: string; slug: string }[];
      }),
    prisma.post
      .findMany({
        where: { domain, status: "publish" },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          date: true,
          categories: { select: { slug: true }, take: 1 },
        },
        orderBy: { date: "desc" },
        take: 30,
      })
      .catch((error) => {
        console.error("[llms.txt] posts query failed:", error);
        return [] as Array<{
          title: string;
          slug: string;
          excerpt: string | null;
          date: Date | null;
          categories: { slug: string }[];
        }>;
      }),
    prisma.author
      .findMany({
        where: { domain, isActive: true },
        select: { name: true, slug: true, jobTitle: true },
        orderBy: { name: "asc" },
      })
      .catch((error) => {
        console.error("[llms.txt] authors query failed:", error);
        return [] as { name: string; slug: string; jobTitle: string | null }[];
      }),
  ]);

  const lines: string[] = [];
  lines.push(`# ${identity.name}`);
  lines.push("");
  lines.push(`> ${identity.description}`);
  lines.push("");
  lines.push(
    "Sitio editorial independiente en español sobre Bitcoin, criptomonedas, blockchain, DeFi, regulación y mercados. " +
      "Todo el contenido es accesible sin login. Se permite la citación atribuida.",
  );
  lines.push("");

  lines.push("## Sitio");
  lines.push(`- [Inicio](${base}/): portada con las últimas noticias.`);
  lines.push(`- [Sobre nosotros](${base}/about): equipo editorial, misión y cobertura.`);
  lines.push(
    `- [Política editorial](${base}/politica-editorial): verificación, fuentes, correcciones, independencia financiera y uso de IA.`,
  );
  lines.push(`- [Contacto](${base}/contacto): canales editoriales y comerciales.`);
  lines.push(`- [Sitemap](${base}/sitemap.xml): índice completo de URLs.`);
  lines.push(`- [RSS feed](${base}/feed.xml): últimas 50 noticias en formato RSS 2.0.`);
  lines.push("");

  if (categories.length > 0) {
    lines.push("## Categorías");
    for (const c of categories) {
      lines.push(`- [${c.name}](${base}/categories/${c.slug})`);
    }
    lines.push("");
  }

  if (authors.length > 0) {
    lines.push("## Equipo editorial");
    lines.push(`Listado completo: [${base}/autores](${base}/autores)`);
    for (const a of authors) {
      const title = a.jobTitle ? `${a.name} (${a.jobTitle})` : a.name;
      lines.push(`- [${title}](${base}/autores/${a.slug})`);
    }
    lines.push("");
  }

  const postsWithCategory = recentPosts.filter((p) => p.categories.length > 0);
  if (postsWithCategory.length > 0) {
    lines.push("## Noticias recientes");
    for (const p of postsWithCategory) {
      const categorySlug = p.categories[0].slug;
      const url = `${base}/${categorySlug}/${p.slug}`;
      const summary = (p.excerpt || "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
      lines.push(summary ? `- [${p.title}](${url}): ${summary}` : `- [${p.title}](${url})`);
    }
    lines.push("");
  }

  lines.push("## Contacto");
  for (const link of identity.socialLinks) {
    lines.push(`- ${link}`);
  }

  const body = lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
