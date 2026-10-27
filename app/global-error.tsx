"use client";

import { useEffect } from "react";

// Sólo entra si falla el layout raíz; reemplaza <html>, así que no hay estilos globales.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] El layout raíz falló:", error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, padding: 16, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>No pudimos cargar esta página</h1>
          <button type="button" onClick={reset} style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
