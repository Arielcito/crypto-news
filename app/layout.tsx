import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { ClientLayout } from "@/components/client-layout";
import { getDomainConfig } from "@/lib/domain-config";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const config = getDomainConfig();

export const metadata: Metadata = {
  title: config.site.title,
  description: config.site.description,
  metadataBase: new URL(`https://${config.site.domain}`),
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
