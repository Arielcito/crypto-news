import { Bricolage_Grotesque } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-admin-display',
  display: 'swap',
});

// Link privado para el cliente: que ningún buscador lo indexe aunque alguien lo publique.
export const metadata = {
  robots: { index: false, follow: false },
};

/** Mismo look que el panel (`admin-shell`), sin sidebar ni chrome del sitio público. */
export default function ReporteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`admin-shell min-h-screen ${bricolage.variable}`}>{children}</div>;
}
