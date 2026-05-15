import type { Metadata } from "next";
import Link from "next/link";

import { Section, Container, Prose } from "@/components/craft";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import {
  aboutPageSchema,
  absoluteUrl,
  breadcrumbSchema,
  getSiteIdentity,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const PATH = "/about";

export async function generateMetadata(): Promise<Metadata> {
  const identity = getSiteIdentity();
  const title = `Sobre ${identity.name}`;
  const description = `Conocé al equipo editorial de ${identity.name}, nuestra misión y la cobertura sobre Bitcoin, criptomonedas y blockchain en ${identity.coverage}.`;
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

export default function AboutPage() {
  const identity = getSiteIdentity();
  const url = absoluteUrl(PATH);
  const yearsActive = new Date().getFullYear() - identity.foundingYear;
  const headline = `Sobre ${identity.name}`;

  return (
    <Section>
      <JsonLd
        data={aboutPageSchema({ url, headline })}
        id="ld-about"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Sobre nosotros", url },
        ])}
        id="ld-breadcrumb"
      />

      <Container className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Sobre nosotros", href: PATH },
          ]}
        />

        <Prose>
          <h1>{headline}</h1>
          <p className="lead">
            {identity.name} es un medio digital independiente dedicado a la cobertura
            informativa sobre Bitcoin, criptomonedas, blockchain, DeFi y la economía
            digital en {identity.coverage}.
          </p>

          <h2>Nuestra misión</h2>
          <p>
            Acercar a lectores hispanohablantes información rigurosa, contextualizada y
            verificable sobre el ecosistema cripto. Creemos que la adopción responsable
            de estas tecnologías requiere lectores informados, no especuladores.
          </p>

          <h2>Quiénes somos</h2>
          <p>
            Somos parte de{" "}
            <a
              href={identity.parentOrganization.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {identity.parentOrganization.name}
            </a>
            , una organización con más de {yearsActive} años de trayectoria difundiendo
            información sobre Bitcoin y criptomonedas en Argentina y la región. Nuestro
            equipo está formado por periodistas, analistas y entusiastas del ecosistema
            que trabajan a tiempo completo para producir contenido editorial.
          </p>

          <h2>Qué cubrimos</h2>
          <ul>
            <li>
              <strong>Noticias diarias:</strong> regulación, mercados, adopción, hackeos y
              eventos relevantes del ecosistema cripto.
            </li>
            <li>
              <strong>Análisis de fondo:</strong> investigaciones, explainers y reportajes
              sobre proyectos, tendencias macro y políticas públicas.
            </li>
            <li>
              <strong>Cobertura LATAM:</strong> ponemos énfasis especial en la región,
              donde otros medios globales no llegan con profundidad.
            </li>
            <li>
              <strong>Educación:</strong> contenido orientado a nuevos usuarios para que
              entiendan cómo funcionan Bitcoin, las stablecoins, los wallets y la
              autocustodia.
            </li>
          </ul>

          <h2>Independencia editorial</h2>
          <p>
            Nuestro contenido editorial no es influenciado por anunciantes, sponsors ni
            socios comerciales. Toda colaboración pagada, contenido patrocinado o
            comunicado de prensa se etiqueta explícitamente como tal. Las decisiones
            sobre qué cubrir y cómo cubrirlo recaen exclusivamente en el equipo
            editorial.
          </p>
          <p>
            Para conocer en detalle nuestros estándares, fuentes y proceso de
            correcciones, leé nuestra{" "}
            <Link href="/politica-editorial">política editorial</Link>.
          </p>

          <h2>Contacto</h2>
          <p>
            Si tenés una primicia, querés sumarte al equipo o querés anunciar con
            nosotros, escribinos a{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a> o usá los canales
            descritos en la página de <Link href="/contacto">contacto</Link>.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
