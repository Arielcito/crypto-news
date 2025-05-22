'use client';

import { Clock, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Post from "@/types/post";

export function PostCard({ post }: { post: Post }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/news/${post.slug}`} className="group">
      <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          {!imageError ? (
            <Image
              src={post.featuredMedia || ''}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className="bg-primary/10 text-primary py-0.5 rounded-full text-[10px]">
              {post.categories[0].name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {post.views}
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