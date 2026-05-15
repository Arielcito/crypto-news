import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { FaTelegram, FaLinkedin } from "react-icons/fa";

import { Section, Container, Prose } from "@/components/craft";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  breadcrumbSchema,
  contactPageSchema,
  getSiteIdentity,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const PATH = "/contacto";

export async function generateMetadata(): Promise<Metadata> {
  const identity = getSiteIdentity();
  const title = `Contacto | ${identity.name}`;
  const description = `Cómo contactar al equipo editorial y comercial de ${identity.name}: email, redes sociales y canales para enviar primicias o pautar publicidad.`;
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

type ContactChannel = {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  display: string;
};

export default function ContactoPage() {
  const identity = getSiteIdentity();
  const url = absoluteUrl(PATH);
  const headline = `Contacto | ${identity.name}`;

  const channels: ContactChannel[] = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email general",
      description:
        "Sugerencias de cobertura, primicias, denuncias, correcciones o consultas editoriales.",
      href: `mailto:${identity.email}`,
      display: identity.email,
    },
    {
      icon: <Send className="h-5 w-5" />,
      label: "Publicidad",
      description:
        "Pauta publicitaria, contenido patrocinado, sponsoreos y partnerships comerciales.",
      href: `mailto:${identity.email}?subject=Publicidad%20en%20${encodeURIComponent(
        identity.name,
      )}`,
      display: identity.email,
    },
    {
      icon: <FaTelegram className="h-5 w-5" />,
      label: "Comunidad en Telegram",
      description:
        "Sumate a la conversación con miles de lectores y obtené alertas en tiempo real.",
      href: identity.socialLinks.find((l) => l.includes("t.me")) ?? "#",
      display: "Unirse al canal",
    },
    {
      icon: <FaLinkedin className="h-5 w-5" />,
      label: "LinkedIn",
      description: "Networking institucional, RRPP corporativas y oportunidades B2B.",
      href:
        identity.socialLinks.find((l) => l.includes("linkedin.com")) ??
        "https://www.linkedin.com/company/bitcoin-argentina-group/",
      display: "Visitar perfil",
    },
  ];

  return (
    <Section>
      <JsonLd
        data={contactPageSchema({ url, headline })}
        id="ld-contact"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Contacto", url },
        ])}
        id="ld-breadcrumb"
      />

      <Container className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Contacto", href: PATH },
          ]}
        />

        <Prose>
          <h1>Contacto</h1>
          <p className="lead">
            ¿Tenés una primicia, querés trabajar con nosotros o pautar publicidad?
            Estos son los canales oficiales para contactar al equipo de {identity.name}.
          </p>
        </Prose>

        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-3 rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {channel.icon}
                </span>
                <h2 className="text-lg font-semibold leading-tight">
                  {channel.label}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">{channel.description}</p>
              <p className="mt-auto text-sm font-medium text-primary group-hover:underline">
                {channel.display}
              </p>
            </a>
          ))}
        </div>

        <Prose>
          <h2>Operador y dirección institucional</h2>
          <p>
            {identity.name} ({identity.legalName}) es operado por{" "}
            <a
              href={identity.parentOrganization.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {identity.parentOrganization.name}
            </a>
            . Para consultas legales o institucionales, dirigirse al mismo email
            corporativo:{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a>.
          </p>

          <h2>Sobre correcciones</h2>
          <p>
            Si detectaste un error en una nota publicada, podés solicitarnos una
            rectificación. El proceso, plazos y criterios están descritos en nuestra{" "}
            <Link href="/politica-editorial">política editorial</Link>.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
