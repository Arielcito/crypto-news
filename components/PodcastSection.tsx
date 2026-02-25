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
      <h2 className="text-lg font-bold mb-3">Nuestro Podcast</h2>
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
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-red-600 rounded-full p-3">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                PODCAST
              </span>
              <span>YouTube</span>
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
              {PODCAST_EPISODE.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {PODCAST_EPISODE.description}
            </p>
          </div>
        </article>
      </a>
    </div>
  );
}
