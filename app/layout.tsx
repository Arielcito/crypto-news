import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { ClientLayout } from "@/components/client-layout";
import { getDomainConfig } from "@/lib/domain-config";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

// Función para determinar qué favicon usar basado en el dominio
const getFaviconPath = (domain: string) => {
  console.log('Getting favicon for domain:', domain);
  const path = (() => {
    switch (domain) {
      case 'bitcoinarg.news':
        return '/favicons/bitcoin.ico';
      case 'www.ultimahoracripto.com':
        return '/favicons/ultima.ico';
      case 'www.tendenciascripto.com':
        return '/favicons/tendencia.ico';
      default:
        return '/favicons/bitcoin.ico'; // favicon por defecto
    }
  })();
  console.log('Selected favicon path:', path);
  return path;
};

// Obtener la configuración del dominio
const config = getDomainConfig();
console.log('Domain config:', config);

// Generar metadata dinámicamente
export async function generateMetadata(): Promise<Metadata> {
  console.log('Generating metadata with config:', config);
  
  const faviconPath = getFaviconPath(config.site.domain);
  console.log('Using favicon path:', faviconPath);

  return {
    title: config.site.title,
    description: config.site.description,
    metadataBase: new URL(`https://${config.site.domain}`),
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
    openGraph: {
      title: config.site.title,
      description: config.site.description,
      images: config.site.ogImage,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.site.title,
      description: config.site.description,
      images: config.site.ogImage,
      creator: config.site.twitterHandle,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faviconPath = getFaviconPath(config.site.domain);
  console.log('Layout rendering with favicon:', faviconPath);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href={faviconPath} />
        <link rel="apple-touch-icon" href={faviconPath} />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
