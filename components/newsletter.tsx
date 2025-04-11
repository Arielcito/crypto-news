"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTelegram } from "react-icons/fa";

export function TelegramChannel() {
  return (
    <Card className="bg-tertiary border-tertiary flex flex-col items-center text-center">
      <CardHeader>
        <CardTitle className="text-primary">Únete a nuestro canal de Telegram</CardTitle>
        <CardDescription>
          Mantente al día con las últimas noticias sobre Bitcoin y criptomonedas en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          asChild 
          className="w-fit bg-[#0088cc] hover:bg-[#0088cc]/90 text-white px-6"
        >
          <a href="https://t.me/bitcoinarg" target="_blank" rel="noopener noreferrer">
            <FaTelegram className="mr-2 h-4 w-4" />
            Unirse al canal
          </a>
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Más de 10,000 miembros ya están recibiendo nuestras actualizaciones diarias.
        </p>
      </CardFooter>
    </Card>
  );
} 