"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Newsletter() {
  return (
    <Card className="bg-tertiary border-tertiary">
      <CardHeader>
        <CardTitle className="text-primary">Suscríbete a nuestro newsletter</CardTitle>
        <CardDescription>
          Recibe las últimas noticias sobre Bitcoin y criptomonedas directamente en tu correo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="email" 
            placeholder="Tu correo electrónico" 
            className="flex-1"
            required
          />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Suscribirse
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Al suscribirte, aceptas recibir comunicaciones de marketing de BITCOINARG.news.
          Puedes darte de baja en cualquier momento.
        </p>
      </CardFooter>
    </Card>
  );
} 