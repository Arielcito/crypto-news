import { Container } from "@/components/craft";

export function HeroHeader() {
  return (
    <header className="border-b">
      <Container>
        <div className="py-6">
          <h1 className="text-4xl font-bold text-center">
            Tu Fuente de Noticias Crypto
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Mantente informado con las últimas noticias, análisis de mercado y tendencias en criptomonedas.
          </p>
        </div>
      </Container>
    </header>
  );
} 