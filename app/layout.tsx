import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { ClientLayout } from "@/components/client-layout";
import { getDomainConfig } from "@/lib/domain-config";
import { Providers } from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// Función para determinar qué favicon usar basado en el dominio
const getFaviconPath = (domain: string) => {
  console.log('🔍 Getting favicon for domain:', domain);
  const path = (() => {
    switch (domain) {
      case 'bitcoinarg.news':
        return '/favicons/bitcoin.ico';
      case 'ultimahoracripto.com':
        return '/favicons/ultima.ico';
      case 'tendenciascripto.com':
        return '/favicons/tendencia.ico';
      default:
        return '/favicons/bitcoin.ico'; // favicon por defecto
    }
  })();
  console.log('✅ Selected favicon path:', path);
  return path;
};

// Generar metadata dinámicamente
export async function generateMetadata(): Promise<Metadata> {
  // Obtener la configuración del dominio dinámicamente
  const config = getDomainConfig();
  const faviconPath = getFaviconPath(config.site.domain);

  console.log('🔧 Generating metadata for:', {
    domain: config.site.domain,
    siteName: config.site.name,
    favicon: faviconPath
  });

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
  // No duplicar el favicon aquí ya que se maneja en generateMetadata
  console.log('🚀 Layout rendering...');
  const config = getDomainConfig();
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {isProduction && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7010167677917603"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
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
