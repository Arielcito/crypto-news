'use client';

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";

const PODCAST_EPISODE = {
  title: "Bitcoin Argentina Podcast",
  description: "Mirá nuestro último episodio en YouTube.",
  thumbnail: "https://i.ytimg.com/vi/sWzD_EVip38/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBySBOOVYJNH6u928KouPBGLMgNLw",
  url: "https://www.youtube.com/@bitcoinargentinaoficial",
};

export function PodcastSection() {
  const [imageError, setImageError] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nuestro Podcast</h2>
      <a
        href={PODCAST_EPISODE.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video relative overflow-hidden">
            {!imageError ? (
              <Image
                src={PODCAST_EPISODE.thumbnail}
                alt={PODCAST_EPISODE.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-red-600 rounded-full p-4">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                PODCAST
              </span>
              <span className="flex items-center gap-1">
                YouTube
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {PODCAST_EPISODE.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {PODCAST_EPISODE.description}
            </p>
          </div>
        </article>
      </a>
    </div>
  );
}
