import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { ClientLayout } from "@/components/client-layout";
import { getDomainConfig } from "@/lib/domain-config";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const config = getDomainConfig();

// Función para determinar qué favicon usar basado en el dominio
const getFaviconPath = (domain: string) => {
  switch (domain) {
    case 'https://bitcoinarg.news':
      return '/favicons/bitcoin.ico';
    case 'https://www.ultimahoracripto.com/':
      return '/favicons/ultima.ico';
    case 'https://www.tendenciascripto.com/':
      return '/favicons/tendencia.ico';
    default:
      return '/favicons/bitcoin.ico'; // favicon por defecto
  }
};

export const metadata: Metadata = {
  title: config.site.title,
  description: config.site.description,
  metadataBase: new URL(`https://${config.site.domain}`),
  icons: {
    icon: getFaviconPath(config.site.domain),
    shortcut: getFaviconPath(config.site.domain),
    apple: getFaviconPath(config.site.domain),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href={getFaviconPath(config.site.domain)} />
        <link rel="apple-touch-icon" href={getFaviconPath(config.site.domain)} />
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
