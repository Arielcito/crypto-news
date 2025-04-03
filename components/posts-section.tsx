import Link from "next/link";
import { Clock, TrendingUp, Newspaper } from "lucide-react";

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
    title: "Ethereum 2.0: Las últimas actualizaciones del protocolo",
    excerpt: "La red de Ethereum continúa evolucionando con nuevas mejoras en su protocolo...",
    category: "Tecnología",
    date: "2024-03-19",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "3",
    title: "Solana: El ecosistema que está revolucionando DeFi",
    excerpt: "Solana se posiciona como una de las plataformas más prometedoras en el espacio DeFi...",
    category: "DeFi",
    date: "2024-03-18",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "4",
    title: "NFTs: La nueva tendencia en el arte digital",
    excerpt: "El mercado de NFTs continúa creciendo, atrayendo a artistas y coleccionistas...",
    category: "NFTs",
    date: "2024-03-17",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.id}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
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

export function PostsSection() {
  const ultimoMomento = mockPosts.filter(post => post.category === "Último Momento");
  const otherPosts = mockPosts.filter(post => post.category !== "Último Momento");

  return (
    <div className="space-y-8">
      {/* Último Momento */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Último Momento</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {ultimoMomento.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Otros Posts */}
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