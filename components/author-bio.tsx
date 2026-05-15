import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin, Globe, Mail } from "lucide-react";

import type { Author } from "@/types/author";

type AuthorBioProps = {
  author: Author;
  showCredentials?: boolean;
};

export function AuthorBio({ author, showCredentials = true }: AuthorBioProps) {
  const profileHref = `/autores/${author.slug}`;

  return (
    <aside
      className="mt-12 rounded-2xl border bg-card p-6 md:p-8"
      aria-label={`Sobre el autor ${author.name}`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {author.avatar ? (
          <Link
            href={profileHref}
            className="shrink-0"
            aria-label={`Perfil de ${author.name}`}
          >
            <Image
              src={author.avatar}
              alt={author.name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/20"
            />
          </Link>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {author.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href={profileHref}
              className="text-xl font-semibold hover:text-primary transition-colors"
            >
              {author.name}
            </Link>
            {author.jobTitle && (
              <span className="text-sm text-muted-foreground">
                {author.jobTitle}
              </span>
            )}
          </div>

          {author.bio && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {author.bio}
            </p>
          )}

          {showCredentials && author.credentials && (
            <p className="text-xs italic text-muted-foreground">
              {author.credentials}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {author.twitter && (
              <a
                href={author.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Twitter de ${author.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {author.linkedin && (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn de ${author.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Sitio web de ${author.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                aria-label={`Email de ${author.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>

          <div>
            <Link
              href={profileHref}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todas las notas de {author.name} →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
