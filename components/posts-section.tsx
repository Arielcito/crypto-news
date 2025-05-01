import Link from "next/link";
import { Clock, TrendingUp, Newspaper } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Post } from "@/types/post";
import { LatestNewsSection } from "./LatestNewsSection";
import { TopStoriesSection } from "./TopStoriesSection";
import { DeepDivesSection } from "./DeepDivesSection";

const mockPosts: Post[] = [
  // Último Momento
  {
    id: "1",
    title: "Bitcoin supera los $70,000 por primera vez en su historia",
    excerpt: "El precio de Bitcoin alcanzó un nuevo récord histórico, superando la barrera psicológica de los $70,000...",
    category: "Último Momento",
    date: "2024-03-20",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "2",
    title: "Ethereum alcanza nuevo récord de TVL en DeFi",
    excerpt: "El valor total bloqueado en protocolos DeFi de Ethereum supera los $100 mil millones...",
    category: "Último Momento",
    date: "2024-03-20",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // Noticias de Mercado
  {
    id: "3",
    title: "Análisis: El mercado de criptomonedas en 2024",
    excerpt: "Un análisis detallado de las tendencias actuales y futuras del mercado de criptomonedas...",
    category: "Noticias de Mercado",
    date: "2024-03-19",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "4",
    title: "Volumen de trading de Bitcoin supera el de Apple",
    excerpt: "El volumen de trading de Bitcoin en las últimas 24 horas supera al de las acciones de Apple...",
    category: "Noticias de Mercado",
    date: "2024-03-19",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // Tecnología
  {
    id: "5",
    title: "Ethereum 2.0: Las últimas actualizaciones del protocolo",
    excerpt: "La red de Ethereum continúa evolucionando con nuevas mejoras en su protocolo...",
    category: "Tecnología",
    date: "2024-03-18",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "6",
    title: "Solana: La nueva era de las transacciones rápidas",
    excerpt: "Cómo Solana está revolucionando la velocidad de las transacciones blockchain...",
    category: "Tecnología",
    date: "2024-03-18",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // Temas Destacados
  {
    id: "7",
    title: "DeFi: El futuro de las finanzas descentralizadas",
    excerpt: "Un análisis profundo del impacto de DeFi en el sistema financiero tradicional...",
    category: "Temas Destacados",
    date: "2024-03-17",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "8",
    title: "NFTs: La revolución del arte digital",
    excerpt: "Cómo los NFTs están transformando el mundo del arte y la propiedad digital...",
    category: "Temas Destacados",
    date: "2024-03-17",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // Últimas Noticias
  {
    id: "9",
    title: "Nuevo ETF de Bitcoin en Europa",
    excerpt: "Europa lanza su primer ETF de Bitcoin, marcando un hito en la adopción institucional...",
    category: "Últimas Noticias",
    date: "2024-03-16",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "10",
    title: "Regulaciones de criptomonedas en América Latina",
    excerpt: "Un análisis de las nuevas regulaciones de criptomonedas en países latinoamericanos...",
    category: "Últimas Noticias",
    date: "2024-03-16",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // Deep Dive Posts
  {
    id: "11",
    title: "Análisis técnico: El futuro de las DAOs",
    excerpt: "Un estudio profundo sobre el impacto y evolución de las Organizaciones Autónomas Descentralizadas...",
    category: "Deep Dive",
    date: "2024-03-15",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "12",
    title: "Layer 2: La solución a la escalabilidad de Ethereum",
    excerpt: "Un análisis detallado de las diferentes soluciones Layer 2 y su impacto en la red Ethereum...",
    category: "Deep Dive",
    date: "2024-03-15",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "13",
    title: "El impacto de la Web3 en la privacidad digital",
    excerpt: "Cómo la Web3 está redefiniendo la privacidad y seguridad en internet...",
    category: "Deep Dive",
    date: "2024-03-14",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "14",
    title: "Smart Contracts: La revolución de los contratos inteligentes",
    excerpt: "Un análisis profundo de los smart contracts y su impacto en diferentes industrias...",
    category: "Deep Dive",
    date: "2024-03-14",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "15",
    title: "El futuro de las stablecoins",
    excerpt: "Análisis del mercado de stablecoins y su papel en el ecosistema cripto...",
    category: "Deep Dive",
    date: "2024-03-13",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "16",
    title: "Criptomonedas y el medio ambiente",
    excerpt: "Un estudio sobre el impacto ambiental de las criptomonedas y las soluciones sostenibles...",
    category: "Deep Dive",
    date: "2024-03-13",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.id}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={post.image || ''}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className="bg-primary/10 text-primary py-0.5 rounded-full text-[10px]">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {post.readTime}
            </span>
          </div>
          <h3 className="font-semibold text-xs mb-1 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.id}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-[16/10] relative overflow-hidden">
          <Image
            src={post.image || ''}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {post.readTime}
            </span>
          </div>
          <h2 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

function SmallPostCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.id}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={post.image || ''}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 33vw, 20vw"
            />
          </div>
          <div className="col-span-2 p-1.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
              <span className="bg-primary/10 text-primary py-0.5 rounded-full text-[10px]">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {post.readTime}
              </span>
            </div>
            <h3 className="font-semibold text-xs line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PostsSection() {
  // Dividir los posts en tres grupos para cada sección
  const latestPosts = mockPosts.slice(0, 4);
  const topStoryPosts = mockPosts.slice(4, 8);
  const deepDivePosts = mockPosts.slice(8, 12);

  return (
    <div className="container mx-auto px-4 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LatestNewsSection posts={latestPosts} />
        <TopStoriesSection posts={topStoryPosts} />
        <DeepDivesSection posts={deepDivePosts} />
      </div>

      {/* Sección de todos los posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Todas las Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
} 