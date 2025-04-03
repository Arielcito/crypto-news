"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // TODO: Implementar suscripción al newsletter
    // Por ahora, simulamos un delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus("success");
    setEmail("");
  };

  return (
    <div className="bg-accent/50 p-8 rounded-lg">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Mantente Informado</h2>
        <p className="text-muted-foreground mb-6">
          Suscríbete a nuestro newsletter para recibir las últimas noticias, análisis de mercado y tendencias en criptomonedas.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Suscribiendo..." : "Suscribirse"}
          </Button>
        </form>
        {status === "success" && (
          <p className="text-green-500 mt-2">¡Suscripción exitosa!</p>
        )}
      </div>
    </div>
  );
} 