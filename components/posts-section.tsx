import Link from "next/link";
import { Clock, TrendingUp, Newspaper } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image?: string;
}

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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="bg-primary/10 text-primary  py-1 rounded-full text-xs">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
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
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-muted-foreground line-clamp-3">
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
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={post.image || ''}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
          </div>
          <div className="col-span-2 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="bg-primary/10 text-primary  py-0.5 rounded-full text-xs">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PostsSection() {
  const featuredPost = mockPosts[0];
  const recentPosts = mockPosts.slice(1, 5);
  const otherPosts = mockPosts.slice(5);

  return (
    <div className="space-y-12">
      {/* Featured and Recent Posts */}
      <section>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <FeaturedPostCard post={featuredPost} />
          </div>
          <div className="space-y-6">
            {recentPosts.map(post => (
              <SmallPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Other Posts */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Lo Más Reciente</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
} 