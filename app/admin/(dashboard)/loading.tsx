/**
 * Suspense boundary de todo el panel. Sin esto, App Router no cambia de pantalla
 * hasta que el servidor termina de resolver la página —y todas son
 * `force-dynamic` con una consulta de sesión adelante—, así que el click parecía
 * no hacer nada. Con este archivo la navegación se compromete al instante: queda
 * el sidebar, entra el esqueleto y el contenido llega cuando llega.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div
          className="h-3 w-24 rounded"
          style={{ backgroundColor: 'hsl(var(--admin-muted-foreground) / 0.2)' }}
        />
        <div
          className="h-8 w-56 rounded"
          style={{ backgroundColor: 'hsl(var(--admin-muted-foreground) / 0.16)' }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="h-28 rounded-lg border"
            style={{
              backgroundColor: 'hsl(var(--admin-surface))',
              borderColor: 'hsl(var(--admin-surface-border))',
            }}
          />
        ))}
      </div>
    </div>
  );
}
