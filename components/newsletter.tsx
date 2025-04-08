"use client";

import { Button } from "@/components/ui/button";

export function Newsletter() {
  return (
    <div className="bg-accent/50 p-8 rounded-lg">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Únete a Nuestra Comunidad</h2>
        <p className="text-muted-foreground mb-6">
          Mantente al día con las últimas noticias, análisis de mercado y tendencias en criptomonedas. Únete a nuestro canal de Telegram.
        </p>
        <Button 
          asChild
          className="bg-[#0088cc] hover:bg-[#0088cc]/90"
        >
          <a 
            href="https://t.me/tucanal" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Unirse a Telegram
          </a>
        </Button>
      </div>
    </div>
  );
} 