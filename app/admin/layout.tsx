import { Bricolage_Grotesque } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-admin-display',
  display: 'swap',
});

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-shell min-h-screen ${bricolage.variable}`}>
      {children}
      <Toaster />
    </div>
  );
}
