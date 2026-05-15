import type { Metadata } from "next";
import Link from "next/link";

import { Section, Container, Prose } from "@/components/craft";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  breadcrumbSchema,
  getSiteIdentity,
  webPageSchema,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const PATH = "/politica-editorial";

export async function generateMetadata(): Promise<Metadata> {
  const identity = getSiteIdentity();
  const title = `Política editorial de ${identity.name}`;
  const description = `Cómo verificamos la información, citamos fuentes, manejamos correcciones y mantenemos la independencia editorial en ${identity.name}.`;
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

export default function PoliticaEditorialPage() {
  const identity = getSiteIdentity();
  const url = absoluteUrl(PATH);
  const headline = `Política editorial de ${identity.name}`;
  const description = `Estándares editoriales, verificación de información, fuentes, correcciones e independencia financiera de ${identity.name}.`;

  return (
    <Section>
      <JsonLd
        data={webPageSchema({ url, headline, description })}
        id="ld-policy"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Política editorial", url },
        ])}
        id="ld-breadcrumb"
      />

      <Container className="space-y-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Política editorial", href: PATH },
          ]}
        />

        <Prose>
          <h1>{headline}</h1>
          <p className="lead">
            Esta política describe cómo {identity.name} produce, verifica y publica
            contenido. Es de aplicación obligatoria para todo el equipo editorial y
            colaboradores externos.
          </p>

          <h2>1. Estándares editoriales</h2>
          <ul>
            <li>
              <strong>Veracidad:</strong> publicamos únicamente información que podemos
              respaldar con fuentes verificables. Si un dato no se puede confirmar, lo
              dejamos fuera o lo etiquetamos explícitamente como rumor / no
              confirmado.
            </li>
            <li>
              <strong>Contexto:</strong> los precios, métricas y declaraciones se
              acompañan de contexto histórico cuando es relevante para entender la
              noticia.
            </li>
            <li>
              <strong>Pluralidad de fuentes:</strong> en notas de impacto buscamos al
              menos dos fuentes independientes antes de publicar.
            </li>
            <li>
              <strong>Distinción claras:</strong> separamos hechos, análisis y opinión.
              Las columnas de opinión llevan firma del autor y se etiquetan como tales.
            </li>
          </ul>

          <h2>2. Verificación de la información</h2>
          <p>Antes de publicar una noticia, nuestro proceso incluye:</p>
          <ul>
            <li>
              Confirmación en la fuente primaria (comunicado oficial, on-chain data,
              filing regulatorio, paper académico).
            </li>
            <li>
              Cross-check con al menos un medio de referencia (Bloomberg, Reuters,
              CoinDesk, The Block, BNAmericas, Infobae, La Nación, etc.).
            </li>
            <li>
              Para datos on-chain: validación con exploradores públicos como
              Etherscan, Blockstream, Solscan o herramientas como Arkham, Dune o
              Glassnode.
            </li>
            <li>
              Si la fuente es anónima, evaluamos su track record y advertimos al
              lector sobre el carácter no confirmado de la información.
            </li>
          </ul>

          <h2>3. Citación de fuentes</h2>
          <p>
            Citamos siempre la fuente original mediante enlace directo dentro del
            cuerpo del artículo. Cuando una nota se basa parcialmente en el trabajo de
            otro medio, lo mencionamos explícitamente. No copiamos contenido literal
            sin atribución.
          </p>

          <h2>4. Uso de inteligencia artificial</h2>
          <ul>
            <li>
              Las herramientas de IA pueden ser utilizadas como apoyo para traducción,
              resúmenes preliminares o búsqueda de antecedentes, pero todo el contenido
              publicado es revisado, editado y firmado por humanos.
            </li>
            <li>
              Cuando un texto incluye una sección generada con asistencia de IA, se
              indica al pie.
            </li>
            <li>
              No publicamos contenido íntegramente generado por IA sin revisión
              editorial.
            </li>
          </ul>

          <h2>5. Correcciones y rectificaciones</h2>
          <p>
            Si detectamos un error en una nota publicada, corregimos el contenido y
            agregamos una nota al pie indicando qué se corrigió, cuándo y por qué.
            Errores menores de ortografía o tipografía se corrigen sin nota visible.
            Para reportar un error o solicitar una rectificación, escribinos a{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a> con asunto
            <em> &quot;Corrección&quot;</em>. Respondemos en un plazo máximo de 72 horas
            hábiles.
          </p>

          <h2>6. Independencia financiera y conflictos de interés</h2>
          <ul>
            <li>
              {identity.name} es operado por {identity.parentOrganization.name}. Las
              decisiones editoriales son independientes de las decisiones comerciales.
            </li>
            <li>
              Aceptamos publicidad y contenido patrocinado siempre que se identifique
              claramente como tal (banner, etiqueta &quot;Sponsored&quot; o
              &quot;Contenido patrocinado&quot;).
            </li>
            <li>
              Los redactores deben declarar cualquier posición material en activos
              cripto sobre los que escriben. No publicamos análisis de tokens sobre los
              que tengamos un conflicto material sin disclosure explícito.
            </li>
            <li>
              No aceptamos pagos a cambio de cobertura editorial favorable, ni
              eliminamos contenido a cambio de pagos.
            </li>
          </ul>

          <h2>7. Privacidad y protección de fuentes</h2>
          <p>
            Protegemos la identidad de fuentes que solicitan anonimato cuando la
            información es de interés público y existe riesgo razonable para la fuente.
            Aplicamos prácticas razonables de seguridad de comunicaciones cuando es
            necesario (Signal, ProtonMail, PGP a pedido).
          </p>

          <h2>8. Comentarios y moderación</h2>
          <p>
            Cuando habilitamos comentarios en los artículos o en redes asociadas,
            moderamos contenido que viole nuestras normas: insultos personales,
            doxxing, spam, promoción de esquemas piramidales o de tokens fraudulentos,
            o desinformación deliberada.
          </p>

          <h2>9. Contacto editorial</h2>
          <p>
            Para sugerencias de cobertura, primicias, denuncias o cualquier consulta
            editorial, escribinos a{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a> o consultá la{" "}
            <Link href="/contacto">página de contacto</Link>.
          </p>

          <p>
            <em>
              Última actualización: {new Date().toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </em>
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
