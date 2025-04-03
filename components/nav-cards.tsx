import Link from "next/link";
import { Coins, Globe, TrendingUp, Newspaper } from "lucide-react";

interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function NavCard({ href, icon, title, description }: NavCardProps) {
  return (
    <Link
      href={href}
      className="group border rounded-lg p-6 hover:bg-accent/50 transition-colors"
    >
      {icon}
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

export function NavCards() {
  const cards = [
    {
      href: "/news/market",
      icon: <Coins className="w-8 h-8 mb-4 text-primary" />,
      title: "Noticias de Mercado",
      description: "Últimas actualizaciones sobre mercados de criptomonedas, volúmenes de trading y movimientos de precios."
    },
    {
      href: "/news/technology",
      icon: <Globe className="w-8 h-8 mb-4 text-primary" />,
      title: "Tecnología",
      description: "Actualizaciones sobre tecnología blockchain, cambios en protocolos y análisis técnico."
    },
    {
      href: "/news/trending",
      icon: <TrendingUp className="w-8 h-8 mb-4 text-primary" />,
      title: "Temas Destacados",
      description: "Tópicos más discutidos y tendencias virales en el espacio crypto."
    },
    {
      href: "/news/latest",
      icon: <Newspaper className="w-8 h-8 mb-4 text-primary" />,
      title: "Últimas Noticias",
      description: "Noticias de última hora y desarrollos recientes en el mundo crypto."
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <NavCard key={card.href} {...card} />
      ))}
    </div>
  );
} 