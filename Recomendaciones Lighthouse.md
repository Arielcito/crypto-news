
# Auditoría Lighthouse — Recomendaciones para Puntaje 100

Auditoría realizada sobre: [ultimahoracripto.com](https://www.ultimahoracripto.com)

---

## 🔧 PERFORMANCE (48/100)

### 1. Reducir el tiempo de carga del LCP (Largest Contentful Paint)
- LCP actual: **7.4 s** (objetivo: <2.5 s).
- **Acciones:**
  - Mover la imagen LCP al HTML directamente y evitar lazy-loading en ella.
  - Usar `priority` en Next.js (`<Image priority />`).
  - Evitar bloqueos por fuentes o CSS.

### 2. Reducir JavaScript innecesario
- Ahorro estimado: **~182 KB**
- **Acciones:**
  - Eliminar JS no utilizado (`next-purgecss`, `babel-plugin-transform-remove-console`).
  - Minificar JS.
  - Reemplazar librerías pesadas si es posible.

### 3. Optimizar imágenes
- Ahorro estimado: **+10 MB**
- **Acciones:**
  - Usar `next/image` y formatos modernos como WebP o AVIF.
  - Ajustar tamaños según visualización real.

### 4. Evitar requests bloqueantes
- **Acciones:**
  - Implementar `rel="preload"` o `async`.
  - Usar `critical CSS` y carga diferida del resto.

### 5. Reducir trabajo en el main thread
- Tareas largas: más de 4.4 s.
- **Acciones:**
  - Usar Web Workers.
  - Fragmentar JS con `dynamic import()`.

### 6. Usar caché efectivo
- TTL actual: solo 1h para imágenes.
- **Acciones:**
  - Configurar `Cache-Control: max-age=31536000, immutable`.
  - Aplicar también en CDN.

---

## ♿️ ACCESIBILIDAD (88/100)

### 1. Contraste insuficiente
- Ej: `.bg-red-100.text-red-600` y `.bg-primary/10.text-primary`
- **Acción:** Ajustar colores para ratio mínimo de 4.5:1.

### 2. Links sin texto discernible
- Algunos `<a>` no son claros para lectores de pantalla.
- **Acción:** Asegurar texto claro y único.

### 3. Orden incorrecto de headings
- **Acción:** Mantener jerarquía `<h1>` a `<h6>` sin saltos.

### 4. Alt de imágenes redundantes
- **Acción:** Evitar alt duplicado, usar `aria-hidden="true"` o alt="".

---

## ✅ BEST PRACTICES (96/100)

### 1. Errores React en consola
- `Minified React error #418` y `#423`
- **Acción:**
  - Ejecutar `next dev` y revisar errores con [React Error Decoder](https://reactjs.org/docs/error-decoder.html).

---

## 📈 SEO (100/100)

✅ No se requieren mejoras. ¡Buen trabajo!

---

## 🎯 EXTRAS Y BUENAS PRÁCTICAS

- Usar SSR (`getServerSideProps` o `getStaticProps`) para contenido crítico.
- Habilitar HTTP/2 o HTTP/3.
- Ejecutar auditoría en modo incógnito sin extensiones.
- Implementar `preconnect` y `dns-prefetch` para Coingecko y Google Cloud Storage.

---

> Generado automáticamente por ChatGPT a partir del informe Lighthouse.
