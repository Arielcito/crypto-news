# Guía de Deployment por Dominio

Esta guía te ayudará a configurar correctamente las variables de entorno para cada dominio en producción.

## Variables de Entorno Requeridas

### Para bitcoinarg.news
```bash
NEXT_PUBLIC_DOMAIN=bitcoinarg.news
```

### Para tendenciascripto.com
```bash
NEXT_PUBLIC_DOMAIN=tendenciascripto.com
```

### Para ultimahoracripto.com
```bash
NEXT_PUBLIC_DOMAIN=ultimahoracripto.com
```

## Configuración en Vercel

Para cada deployment en Vercel:

1. Ve a tu proyecto en Vercel
2. Configuración → Environment Variables
3. Añade la variable `NEXT_PUBLIC_DOMAIN` con el valor correspondiente
4. Selecciona el ambiente (Production, Preview, Development)
5. Guarda y redespliega

## Configuración en Netlify

```bash
# En netlify.toml o en la interfaz web
[build.environment]
  NEXT_PUBLIC_DOMAIN = "bitcoinarg.news"
```

## Configuración en Docker

```dockerfile
# En tu Dockerfile o docker-compose.yml
ENV NEXT_PUBLIC_DOMAIN=bitcoinarg.news
```

## Testing Local

Para probar cada dominio localmente:

```bash
# BitcoinArg
NEXT_PUBLIC_DOMAIN=bitcoinarg.news npm run dev

# TendenciasCripto
NEXT_PUBLIC_DOMAIN=tendenciascripto.com npm run dev

# UltimaHoraCripto
NEXT_PUBLIC_DOMAIN=ultimahoracripto.com npm run dev
```

## Debugging en Producción

Los logs incluyen información detallada sobre la detección de dominio:

- `🔍 Middleware processing request` - Información del middleware
- `🌐 Domain configuration loaded` - Configuración final cargada
- `🔧 Generating metadata for` - Metadata generada

Revisa los logs de tu plataforma de hosting para verificar que el dominio se está detectando correctamente.

## Fallbacks Automáticos

El sistema tiene múltiples fallbacks:

1. **Variable de entorno** `NEXT_PUBLIC_DOMAIN`
2. **Headers del middleware** (X-Detected-Domain)
3. **Headers de la request** (host, x-forwarded-host)
4. **Localhost** como último recurso

## Cache de Favicons

Los favicons están configurados para cache agresivo:
- **1 año** para archivos estáticos
- **1 día** con revalidación para logos

Para forzar actualización de favicons:
1. Cambia el nombre del archivo
2. Actualiza las rutas en `getFaviconPath()`
3. Redespliega 