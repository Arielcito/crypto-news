"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] La página falló al renderizar:", error);
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-4">No pudimos cargar esta página</h1>
          <p className="mb-8 text-muted-foreground">Probá de nuevo en unos segundos.</p>
          <div className="flex gap-3">
            <Button onClick={reset}>Reintentar</Button>
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
