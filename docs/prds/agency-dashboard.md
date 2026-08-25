# PRD: Dashboard de agencia — contenido orgánico de clientes + gestión de tareas con roles

## Problem Statement

La agencia maneja hoy las redes de sus clientes sin un lugar único donde ver ni el rendimiento ni el trabajo. El rendimiento orgánico (seguidores, alcance, qué pieza funcionó y cuál no) sólo existe adentro de cada app de cada red, cuenta por cuenta: para armar un reporte mensual alguien entra a Instagram, TikTok y YouTube de cada cliente y copia números a mano, sin historial —Instagram borra sus insights de posts viejos— y sin forma de comparar meses. El trabajo (qué pieza le debemos a qué cliente, para cuándo, quién la hace) vive en mensajes y planillas: nadie ve de un vistazo qué está vencido, el dueño de la agencia no sabe si el paquete del mes está completo, y el empleado no tiene una lista propia de pendientes.

Además el panel `/admin` actual es de un solo operador: la credencial es un par de variables de entorno (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) comparadas en texto plano, no hay tabla `User` y la sesión sólo guarda `isLoggedIn`. No se le puede dar acceso a un empleado sin darle también el control total del contenido de bitcoinarg.news, y no hay forma de saber quién hizo qué.

## Solution

Una sección nueva de `/admin`, `/admin/agencia/*`, con dos áreas y dos roles.

**Contenido orgánico** muestra, por cliente y por red, seguidores ganados en el período, alcance, y el ranking de mejores y peores piezas. Los números no se cargan a mano: un cron sincroniza desde **PostProxy** el catálogo de posts de cada cuenta conectada y la historia de contadores, y lo deja cacheado en nuestra Postgres. La agencia sigue publicando nativo desde cada app —acá sólo se mide—, y PostProxy importa esos posts igual.

**Clientes** es la agenda de trabajo: un `Paquete` mensual por cliente (p. ej. "12 piezas de octubre") que se abre en `Tareas` de una pieza cada una, con red, formato, deadline y responsable. El admin crea clientes, empleados, paquetes y tareas; el empleado ve sólo lo suyo, con el countdown al vencimiento, y marca la tarea como hecha pegando el permalink de la pieza publicada. Ese permalink es lo que después cruza la tarea con las métricas reales.

Cuando el paquete se completa, el admin genera un **reporte interno**: una foto congelada de lo comprometido contra lo entregado, más las métricas de cada pieza al momento de generarlo. Es interno: no hay portal para clientes, la agencia manda el reporte por su canal.

Para sostener esto, el login pasa de variables de entorno a una tabla `User` con rol (`ADMIN` | `EMPLOYEE`) y password hasheado con bcrypt. Es un solo login para todo el panel: el rol decide qué se ve.

## User Stories

### Cuentas y roles

1. Como admin, quiero entrar al panel con mi usuario y contraseña guardados en la base, para que las credenciales dejen de vivir en variables de entorno en texto plano.
2. Como admin, quiero crear empleados desde el panel con una contraseña temporal de un solo uso, para darles acceso sin compartir la mía.
3. Como empleado, quiero que el sistema me obligue a cambiar la contraseña temporal en el primer ingreso, para que nadie más que yo la sepa.
4. Como admin, quiero desactivar un empleado que dejó la agencia y que su sesión abierta deje de funcionar, para cortarle el acceso al instante.
5. Como empleado, quiero no ver las secciones de contenido de bitcoinarg.news (Notas, Categorías, Tags), para que el panel me muestre sólo mi trabajo.
6. Como admin, quiero que el rol se verifique contra la base en cada request y no contra lo que dice la cookie, para que cambiar un rol tenga efecto inmediato y no se pueda falsificar.
7. Como admin, quiero que el login rechace intentos repetidos desde la misma IP, para que nadie pruebe contraseñas a fuerza bruta.

### Clientes

8. Como admin, quiero dar de alta un cliente con nombre, estado (activo/pausado/baja) y monto mensual, para tener el padrón en un solo lugar.
9. Como admin, quiero conectar las cuentas de redes de un cliente indicando su perfil de PostProxy, para que las métricas que bajamos se atribuyan al cliente correcto.
10. Como admin, quiero ver si el token de una cuenta conectada está por vencer, para renovarlo antes de que las métricas se corten en silencio.
11. Como admin, quiero adjuntar el brief del cliente en PDF, para que el empleado tenga el contexto sin pedírmelo por mensaje.
12. Como empleado, quiero descargar el brief del cliente al que estoy asignado, para trabajar con la referencia a mano.
13. Como admin, quiero que el brief de un cliente no sea descargable por alguien sin sesión ni por un empleado que no tiene tareas de ese cliente, para que los documentos no queden expuestos por una URL suelta.

### Paquetes y tareas

14. Como admin, quiero crear un paquete mensual para un cliente indicando cuántas piezas incluye, para dejar registrado lo comprometido.
15. Como admin, quiero cargar las tareas del paquete una por una, cada una con red, formato, deadline y responsable, para repartir el trabajo con precisión.
16. Como admin, quiero ver el avance del paquete (hechas sobre comprometidas), para saber si llegamos a fin de mes.
17. Como empleado, quiero abrir "Mis tareas" y ver sólo las mías, ordenadas por urgencia, para saber qué hago ahora.
18. Como empleado, quiero ver cuánto falta para el vencimiento de cada tarea, para priorizar sin hacer la cuenta.
19. Como empleado, quiero que una tarea vencida se distinga visualmente de una que vence hoy y de una que vence la semana que viene, para no confundirlas de un vistazo.
20. Como empleado, quiero marcar la tarea como hecha pegando el link de la pieza publicada, para que quede el rastro de qué entregué.
21. Como admin, quiero ver todas las tareas de todos los clientes con filtros por cliente, responsable, estado y red, para hacer seguimiento general.
22. Como admin, quiero recibir un aviso diario en Discord con lo vencido y lo que vence en las próximas 48 horas, para enterarme sin tener que entrar al panel.

### Contenido orgánico

23. Como admin, quiero ver por cliente los seguidores ganados en el período elegido (7, 28 o 90 días), para mostrar crecimiento real y no un número suelto.
24. Como admin, quiero ver la serie de seguidores en el tiempo, para distinguir un crecimiento sostenido de un pico aislado.
25. Como admin, quiero ver el top de piezas por interacciones y también las peores, para saber qué repetir y qué dejar de hacer.
26. Como admin, quiero que una métrica que la red no informa se muestre como "—" y no como cero, para no leer "nadie lo vio" cuando en realidad es "no lo sabemos".
27. Como admin, quiero saber cuándo fue la última sincronización, para saber qué tan fresco es lo que estoy mirando.
28. Como admin, quiero poder disparar la sincronización a mano, para no esperar al cron cuando necesito el número ahora.
29. Como admin, quiero que si un cliente todavía no tiene cuentas conectadas la pantalla me lo diga y me ofrezca conectarlas, en vez de mostrarme un dashboard vacío sin explicación.

### Reportes

30. Como admin, quiero generar el reporte interno de un paquete cuando está completo, para cerrar el mes con un entregable.
31. Como admin, quiero que el reporte congele los números al momento de generarlo, para que un reporte de octubre no cambie si lo abro en diciembre.
32. Como admin, quiero que el reporte muestre comprometido contra entregado más las métricas de cada pieza, para justificar el trabajo con datos.
33. Como admin, quiero imprimir el reporte o guardarlo como PDF desde el navegador, para mandárselo al cliente por el canal que ya usamos.

## Implementation Decisions

### Ubicación y alcance

- **Mismo repo, misma base de datos.** El dashboard vive en `crypto-news` bajo `/admin/agencia/*` y usa la misma Postgres/Prisma. Decisión explícita del usuario por sobre la alternativa de una app separada: es la misma persona operando las dos cosas y no justifica un segundo deploy.
- Lo existente de bitcoinarg.news (`/admin/posts`, `/admin/categories`, `/admin/tags`) queda intacto y pasa a ser visible sólo para `ADMIN`.

### Auth y roles

- **Tabla `User`** con `email`, `passwordHash`, `name`, `role` (`ADMIN` | `EMPLOYEE`), `isActive`, `mustChangePassword`, `sessionVersion`. Un solo login para todo el panel.
- **bcrypt** (`bcryptjs`, cost 12) para hashear. Mínimo 8 caracteres, según AUTH.md. Nunca se loguea ni se devuelve el hash.
- La sesión iron-session pasa de `{ isLoggedIn, username }` a `{ userId, role, sessionVersion }`. El `role` de la cookie **no se confía**: `requireRole()` relee el `User` de la base en cada request y verifica `isActive` y que `sessionVersion` coincida. Cambiar la contraseña o desactivar un usuario incrementa `sessionVersion` e invalida todas las sesiones abiertas.
- El middleware sigue haciendo el gate barato de `/admin/*` con la cookie (sin tocar la base, porque corre en edge); la verificación real contra la base sucede en cada route handler y en cada page server-side.
- **Migración del admin actual**: un script de seed toma `ADMIN_USERNAME`/`ADMIN_PASSWORD` de las env vars existentes y crea el primer `User` con rol `ADMIN` y el password ya hasheado. Las env vars quedan sólo para ese bootstrap; el login deja de leerlas.
- **Rate limit del login**: 5 intentos por minuto por IP, en memoria (el deploy es una sola instancia). Devuelve 429 sin distinguir "usuario no existe" de "contraseña incorrecta".
- **Fix de seguridad incluido**: `middleware.ts` hoy valida el origen con `origin.includes(domain)`, así que `https://bitcoinarg.news.attacker.com` matchea y recibe `Access-Control-Allow-Credentials: true`. Pasa a comparación exacta contra una lista de orígenes completos. No es parte del feature pedido, pero el feature mete datos de clientes en la misma base, así que se arregla acá.

### Modelo de datos

Modelos nuevos, todos en la misma `schema.prisma`:

- `User` — cuentas del panel (arriba).
- `Client` — `name`, `slug`, `status` (`ACTIVE` | `PAUSED` | `CHURNED`), `monthlyAmount`, `notes`, `isActive`.
- `ClientProfile` — el mapeo local cliente ↔ cuenta de PostProxy: `clientId`, `postproxyProfileId`, `platform`, `handle`, `expiresAt`. **Nuestra base es la fuente de verdad del mapeo**, no los `profile_groups` de PostProxy: si mañana cambiamos de agregador, el mapeo sobrevive.
- `Package` — `clientId`, `month` (primer día del mes, UTC), `committedPieces`, `status`, `amount`. Único por `(clientId, month)`.
- `Task` — `packageId`, `assigneeId`, `title`, `network`, `format`, `dueDate`, `status`, `permalink`, `completedAt`.
- `Brief` — `clientId`, `filename`, `blobUrl`, `size`, `uploadedById`.
- `Report` — `packageId`, `generatedAt`, `snapshot` (Json), `generatedById`.
- `SocialPost` — catálogo de piezas bajadas de PostProxy: `postproxyPostId`, `network`, `clientProfileId`, `permalink`, `body`, `publishedAt`, `origin`. Único por `(postproxyPostId, network)`.
- `SocialPostMetric` — una lectura de contadores de una pieza. Único por `(socialPostId, recordedAt)`: re-sincronizar es idempotente.
- `SocialAccountMetric` — una lectura del estado de una cuenta. Único por `(clientProfileId, recordedAt)`.

Enums: `Role`, `ClientStatus`, `PackageStatus`, `TaskStatus`, `SocialNetwork`, `PostOrigin`.

- **Estados de tarea**: se guardan sólo `PENDING` y `DONE`. "Vencida" y el countdown se **derivan** de `dueDate` contra el ahora, nunca se persisten — un estado guardado se desactualiza solo y hay que ir a repararlo con un job.
- **Migración**: se escribe el archivo SQL en `prisma/migrations/`, **no se ejecuta**. La corre el usuario (convención del proyecto).

### Métricas: PostProxy

- **Se porta el adapter de Imperia casi textual** (`src/metricas/adapters/postproxy-social.ts`), cambiando sólo la persistencia de Drizzle a Prisma y el scheduler de Inngest a Vercel Cron. Es código ya probado contra la API real; reescribirlo sería regalar los bugs que ya pagó.
- Redes soportadas: se extiende el mapa `REDES` de Imperia (instagram/facebook/x) con **tiktok** y **youtube**, que son las que usa la agencia.
- **Doctrina de las métricas, heredada de Imperia y no negociable**: los contadores son acumulados desde que se publicó la pieza. El rendimiento de una pieza es su **última** lectura; el crecimiento de una cuenta es la **resta** entre dos lecturas. Nada se suma a lo largo del tiempo. Un `null` significa "la red no informa esta métrica", no cero: Facebook devuelve `impressions: 0` en todos los posts de página porque Meta no expone ese insight, y guardarlo como 0 afirmaría algo falso.
- **Paginación**: `/posts` de PostProxy arranca en `page=0`, no en `page=1`. Verificado contra la API en vivo.
- **Multi-cliente en una sola pasada**: se listan todos los posts de la cuenta de PostProxy una vez y se atribuyen al cliente cruzando `platforms[].profile_id` contra `ClientProfile`. Un post cuyo `profile_id` no está mapeado se ignora, y se loguea cuántos fueron.
- **Cron**: `/api/cron/sync-social`, protegido por `CRON_SECRET` en el header `Authorization`. Cadencia deseada **cada 6 horas** (`15 */6 * * *`) porque PostProxy fotografía los contadores cada ~2 h y los retiene un tiempo acotado: con un cron diario se pierden las lecturas de las primeras horas, que son justo cuando una pieza junta casi todo su alcance. **Vercel Hobby permite un solo cron diario**; `vercel.json` queda con la expresión de 6 h y el plan Pro es el requisito para que corra así. Con Hobby corre una vez al día y la curva fina se pierde, no los totales.
- **Tres pasos independientes** (catálogo → stats de piezas → stats de cuentas): si el segundo muere con un 429, el primero ya quedó guardado y el reintento no lo re-baja.
- **Topes**: 500 posts de catálogo por corrida, 90 días de historia de stats, lotes de 50 ids por llamada a `/posts/stats`. Si el catálogo llega al tope se reporta `truncado: true` — se dice, no se esconde.
- La API key sale de `POSTPROXY_API_KEY` (env var), se lee just-in-time en cada llamada para poder rotarla sin redeploy, y **nunca** se loguea.

### Tareas ↔ piezas

- El empleado pega el permalink al completar. Se normaliza (se le sacan query params de tracking) y se guarda en `Task.permalink`.
- El cruce con las métricas es por `permalink` contra `SocialPost.permalink`, resuelto **en tiempo de lectura**, no con una foreign key: la pieza puede tardar horas en aparecer en el catálogo de PostProxy y la tarea no puede quedar bloqueada esperándola. Si todavía no hay match, la tarea se ve completa y la métrica dice "pendiente de sincronizar".

### Briefs

- Ruta de upload separada de `/api/admin/upload` (que es para imágenes y rechaza PDFs): `/api/admin/agencia/briefs`, acepta `application/pdf` hasta 10 MB.
- **Se valida por magic bytes** (`%PDF-`), no sólo por el `Content-Type` que declara el cliente, que es texto que manda el atacante.
- El archivo va a Vercel Blob, pero **la URL del Blob nunca se expone**: es pública y no firmada. La descarga pasa por `/api/admin/agencia/briefs/[id]/download`, que valida sesión, rol y —si es empleado— que tenga al menos una tarea de ese cliente, y recién ahí hace de proxy del contenido.

### Alertas

- **Discord**, reusando la infraestructura que ya existe en `lib/services/discord.ts`. Webhook nuevo y propio (`DISCORD_TASKS_WEBHOOK_URL`) para no mezclar avisos internos con el canal público de noticias.
- Cron diario a las **9:00 hora argentina** (`0 12 * * *` UTC) con un digest: vencidas primero, después las que vencen en 48 h, agrupadas por responsable.
- **Sin estado**: el digest se arma leyendo la base en el momento. No hay tabla de "alertas enviadas" que mantener sincronizada, y una alerta que se repite es preferible a una que no llega porque una fila quedó mal marcada.

### Reportes

- **Generación manual**, no automática al cerrar la última tarea: el admin quiere mirar los números antes de que existan como entregable.
- El reporte guarda un **snapshot JSON congelado** con las piezas, sus métricas al momento y los totales. Regenerar crea una versión nueva, no pisa la anterior.
- Salida **HTML con CSS de impresión** (`@media print`), no una librería de PDF: el navegador ya imprime a PDF y agregar Puppeteer o `pdfkit` sería peso de deploy para resolver algo que el navegador hace gratis.

### Zona horaria

- Todo se guarda en **UTC**. Todo se muestra en `America/Argentina/Buenos_Aires`. Los deadlines se interpretan como fin del día argentino: una tarea que vence el 15 no está vencida a las 21:00 del 15 en Buenos Aires.

### Frontend

- Orden de construcción, según convención del proyecto: tipos → endpoints → hooks → componentes atómicos → páginas → navegación.
- Todo el data handling en hooks (`use-agency-clients`, `use-agency-tasks`, `use-agency-packages`, `use-agency-metrics`, `use-agency-reports`, `use-agency-users`) sobre TanStack Query. Ningún `fetch` dentro de un componente.
- Formularios con `react-hook-form` + resolver de `zod`. Toda entrada del servidor se valida con zod antes de tocar la base.
- Mobile-first: tabla en desktop, cards apiladas en mobile. El empleado va a mirar "Mis tareas" desde el celular.
- Animaciones con `framer-motion` y easing no lineal (`easeOut`, cubic-bezier). Nada de transiciones lineales.
- El sidebar arma su nav según el rol: `ADMIN` ve todo, `EMPLOYEE` ve sólo "Mis tareas" y "Clientes" en modo lectura.
- Se reusan los tokens `--admin-*` que ya existen; no se introduce una paleta nueva.

### API

- Todo bajo `/api/admin/agencia/*`, con el mismo contrato de respuesta del resto del proyecto: `{ data, error, message }`.
- Orden en cada handler: **auth primero, validación segunda, proceso tercero** (API.md).
- 401 sin sesión, 403 con sesión pero sin permiso, 404 cuando el recurso no existe o el empleado no debería saber que existe, 409 en colisiones.
- Listados paginados, default 20, máximo 100.
- Los errores internos nunca se filtran al cliente: se loguean con detalle y se devuelve un mensaje genérico.

## Testing Decisions

- **Sin runner de tests todavía en el repo** y este PRD no introduce uno: la convención vigente del proyecto (documentada en `CLAUDE.md`) es QA manual por Chrome MCP más `npx tsc --noEmit`. Meter Vitest acá sería introducir un seam nuevo en el mismo cambio que introduce el feature más grande del repo.
- **QA manual obligatorio antes de dar por cerrado**: login con cada rol, que el empleado no pueda entrar a `/admin/posts` ni a un cliente que no es suyo, alta de cliente/paquete/tarea, completar una tarea, generar un reporte, y la consola del navegador sin errores.
- **La verificación de permisos se prueba a mano por request**, no sólo por UI: esconder un link no es control de acceso. Se comprueba que `GET /api/admin/agencia/clients` con sesión de empleado devuelve lo que corresponde y que un `PUT` a un recurso ajeno devuelve 403/404.
- El adapter de PostProxy **llega con prior art probado** (Imperia lo corre en producción). Lo que se verifica acá es la capa nueva: el mapeo cliente ↔ perfil y la persistencia en Prisma.

## Out of Scope

- **CRM** (pipeline de ventas, contratos, cobros, alertas comerciales). Se dejan dos anclas baratas —`Client.status` y `Package.amount`— para que agregarlo después sea aditivo, pero no se construye nada de eso ahora.
- **Contabilidad** (facturación, ganancias, costos). Misma razón.
- **Portal para clientes.** Explícitamente descartado: la agencia prefiere mandar reportes periódicos.
- **Publicar desde el dashboard.** Se sigue publicando nativo en cada red; PostProxy sólo mide.
- **Generación de PDF server-side.** El reporte se imprime desde el navegador.
- **Aprobación de piezas / workflow de revisión** (borrador → revisión → aprobado). Una tarea está pendiente o hecha.
- **Registro de horas o time tracking.**
- **Notificaciones por email.** Sólo Discord.
- **Reset de contraseña self-service.** El admin regenera una temporal.
- **Multi-agencia / multi-tenant.** Una sola agencia, la de Max.
- **Tests automatizados.** QA manual, según la convención vigente.

## Further Notes

- **Bloqueante conocido, fuera de nuestro código**: la cuenta de PostProxy de crypto-news devuelve `records: []` en `/posts/stats`, `/profiles/{id}/stats` y `latest_stats` para las tres redes conectadas, sobre ~2 meses de posts. El catálogo sí llega (155 posts, todos `source: "imported"`, con permalink). Imperia corre el mismo código contra su cuenta y sí recibe lecturas, así que no es una limitación del producto: es plan o polling no habilitado en esta cuenta. **Hay que verificarlo en app.postproxy.dev o con soporte antes de esperar números en el dashboard.** El código se escribe igual y funciona el día que los snapshots aparezcan; mientras tanto, las pantallas muestran su estado vacío honesto ("todavía no hay lecturas").
- El perfil de Instagram conectado tiene `expires_at: 2026-10-24`. Por eso el vencimiento de token es un dato visible en la UI y no un detalle interno: sin eso, las métricas se cortan y nadie se entera hasta que alguien pregunta por qué el número no se mueve.
- La API key de PostProxy que se compartió en la conversación de diseño **quedó expuesta y hay que rotarla** en app.postproxy.dev/api_keys. La nueva va en `.env`, nunca en código.
- El adapter portado deja la puerta abierta a Facebook y X sin trabajo extra: el mapa de redes ya los contempla desde Imperia. Se soportan tiktok/youtube porque son los que la agencia usa hoy, no porque los otros requieran código nuevo.
