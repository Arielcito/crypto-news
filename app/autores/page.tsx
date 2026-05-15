import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section, Container, Prose } from "@/components/craft";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { listActiveAuthors } from "@/lib/api/authors";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  detectRequestDomain,
  getSiteIdentity,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const PATH = "/autores";

export async function generateMetadata(): Promise<Metadata> {
  const identity = getSiteIdentity();
  const title = `Equipo editorial de ${identity.name}`;
  const description = `Conocé a los periodistas y analistas que escriben sobre Bitcoin, criptomonedas y blockchain en ${identity.name}.`;
  return {
    title,
    description,
    alternates: { canonical: PATH },
    openGraph: {
      type: "website",
      url: absoluteUrl(PATH),
      title,
      description,
      siteName: identity.name,
      locale: identity.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: identity.twitterHandle,
    },
  };
}

export default async function AuthorsIndexPage() {
  const domain = detectRequestDomain();
  const authors = await listActiveAuthors(domain);
  const identity = getSiteIdentity();
  const url = absoluteUrl(PATH);
  const headline = `Equipo editorial de ${identity.name}`;

  return (
    <Section>
      <JsonLd
        data={collectionPageSchema({
          name: headline,
          description: `Equipo de periodistas y analistas de ${identity.name}.`,
          url,
        })}
        id="ld-authors-collection"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Autores", url },
        ])}
        id="ld-breadcrumb"
      />

      <Container className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Autores", href: PATH },
          ]}
        />

        <Prose>
          <h1>{headline}</h1>
          <p>
            Estos son los periodistas y analistas que producen el contenido editorial
            de {identity.name}. Cada nota lleva firma del autor responsable.
          </p>
        </Prose>

        {authors.length === 0 ? (
          <p className="text-muted-foreground">
            Próximamente publicaremos los perfiles del equipo editorial.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/autores/${author.slug}`}
                className="flex flex-col gap-4 rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">
                      {author.name}
                    </h2>
                    {author.jobTitle && (
                      <p className="text-sm text-muted-foreground">
                        {author.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                {author.bio && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {author.bio}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
