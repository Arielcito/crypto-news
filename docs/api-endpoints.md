# Documentación de Endpoints de la API

Esta documentación describe los endpoints disponibles para la gestión de posts en la plataforma.

## Autenticación

Todos los endpoints que modifican datos (POST, PUT, DELETE) requieren autenticación básica. Incluye las credenciales en el header de la petición:

```
Authorization: Basic <base64(username:password)>
```

## Endpoints de Posts

### Obtener Posts

```http
GET /api/wp/v2/posts
```

Obtiene una lista paginada de posts.

#### Parámetros de Query

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| per_page | number | Número de posts por página | 10 |
| page | number | Número de página | 1 |
| search | string | Término de búsqueda | '' |
| categories | string | IDs de categorías separados por coma | [] |
| tags | string | IDs de tags separados por coma | [] |
| domain | string | Dominio de los posts | 'default' |

#### Ejemplo de Respuesta

```json
{
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Título del Post",
        "content": "Contenido en Markdown...",
        "excerpt": "Resumen del post...",
        "slug": "titulo-del-post",
        "status": "publish",
        "author": 1,
        "featuredMedia": "https://ejemplo.com/imagen.jpg",
        "domain": "default",
        "categories": [
          {
            "id": 1,
            "name": "Categoría 1"
          }
        ],
        "tags": [
          {
            "id": 1,
            "name": "Tag 1"
          }
        ]
      }
    ],
    "total": 100,
    "totalPages": 10
  },
  "error": null,
  "message": "Posts retrieved successfully"
}
```

### Obtener Post por Slug

```http
GET /api/wp/v2/posts/by-slug/{slug}
```

Obtiene un post específico por su slug.

#### Ejemplo de Respuesta

```json
{
  "data": {
    "id": 1,
    "title": "Título del Post",
    "content": "Contenido en Markdown...",
    "excerpt": "Resumen del post...",
    "slug": "titulo-del-post",
    "status": "publish",
    "author": 1,
    "featuredMedia": "https://ejemplo.com/imagen.jpg",
    "domain": "default",
    "categories": [
      {
        "id": 1,
        "name": "Categoría 1"
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Tag 1"
      }
    ]
  },
  "error": null,
  "message": "Post retrieved successfully"
}
```

### Actualizar Post por Slug

```http
PUT /api/wp/v2/posts/by-slug/{slug}
```

Actualiza un post existente usando su slug.

#### Cuerpo de la Petición

```json
{
  "title": "Nuevo Título",
  "content": "Nuevo contenido en Markdown...",
  "excerpt": "Nuevo resumen...",
  "status": "draft",
  "author": 2,
  "featured_media": "https://ejemplo.com/nueva-imagen.jpg",
  "domain": "otro-dominio",
  "categories": [3, 4],
  "tags": [3, 4]
}
```

Todos los campos son opcionales. Solo se actualizarán los campos proporcionados.

#### Ejemplo de Respuesta

```json
{
  "data": {
    "id": 1,
    "title": "Nuevo Título",
    "content": "Nuevo contenido en Markdown...",
    "excerpt": "Nuevo resumen...",
    "slug": "titulo-del-post",
    "status": "draft",
    "author": 2,
    "featuredMedia": "https://ejemplo.com/nueva-imagen.jpg",
    "domain": "otro-dominio",
    "categories": [
      {
        "id": 3,
        "name": "Categoría 3"
      },
      {
        "id": 4,
        "name": "Categoría 4"
      }
    ],
    "tags": [
      {
        "id": 3,
        "name": "Tag 3"
      },
      {
        "id": 4,
        "name": "Tag 4"
      }
    ]
  },
  "error": null,
  "message": "Post updated successfully"
}
```

### Eliminar Post por Slug

```http
DELETE /api/wp/v2/posts/by-slug/{slug}
```

Elimina un post existente usando su slug.

#### Respuesta
- Status: 204 No Content (si se elimina correctamente)
- Status: 404 Not Found (si el post no existe)

### Crear Post

```http
POST /api/wp/v2/posts
```

Crea un nuevo post.

#### Cuerpo de la Petición

```json
{
  "title": "Título del Post",
  "content": "Contenido en Markdown...",
  "excerpt": "Resumen del post...",
  "status": "publish",
  "author": 1,
  "featured_media": "https://ejemplo.com/imagen.jpg",
  "domain": "default",
  "categories": [1, 2],
  "tags": [1, 2]
}
```

#### Campos Requeridos
- `title`: Título del post
- `content`: Contenido en formato Markdown

#### Campos Opcionales
- `excerpt`: Resumen del post (si no se proporciona, se genera automáticamente)
- `status`: Estado del post ('publish', 'draft', etc.)
- `author`: ID del autor
- `featured_media`: URL de la imagen destacada
- `domain`: Dominio del post
- `categories`: Array de IDs de categorías
- `tags`: Array de IDs de tags

### Actualizar Post por ID

```http
PUT /api/wp/v2/posts/{id}
```

Actualiza un post existente usando su ID.

#### Cuerpo de la Petición

```json
{
  "title": "Nuevo Título",
  "content": "Nuevo contenido en Markdown...",
  "excerpt": "Nuevo resumen...",
  "status": "draft",
  "author": 2,
  "featured_media": "https://ejemplo.com/nueva-imagen.jpg",
  "domain": "otro-dominio",
  "categories": [3, 4],
  "tags": [3, 4]
}
```

Todos los campos son opcionales. Solo se actualizarán los campos proporcionados.

### Eliminar Post por ID

```http
DELETE /api/wp/v2/posts/{id}
```

Elimina un post existente usando su ID.

#### Respuesta
- Status: 204 No Content (si se elimina correctamente)
- Status: 404 Not Found (si el post no existe)

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Autenticación requerida |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: slug duplicado) |
| 500 | Internal Server Error - Error del servidor |

## Ejemplos de Uso

### Crear un nuevo post

```bash
curl -X POST \
  -H "Authorization: Basic <credenciales>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Nuevo Post",
    "content": "# Título\n\nEste es un post de ejemplo con **formato Markdown**.",
    "categories": [1],
    "tags": [1, 2]
  }' \
  https://www.bitcoinarg.news/api/wp/v2/posts
```

### Actualizar un post por slug

```bash
curl -X PUT \
  -H "Authorization: Basic <credenciales>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Actualizado",
    "content": "Contenido actualizado..."
  }' \
  https://www.bitcoinarg.news/api/wp/v2/posts/by-slug/mi-post
```

### Eliminar un post por slug

```bash
curl -X DELETE \
  -H "Authorization: Basic <credenciales>" \
  https://www.bitcoinarg.news/api/wp/v2/posts/by-slug/mi-post
```

## Notas Importantes

1. El contenido de los posts debe estar en formato Markdown.
2. Los slugs se generan automáticamente a partir del título, pero pueden ser personalizados.
3. Las categorías deben existir en el dominio especificado.
4. Los tags son globales y no están asociados a un dominio específico.
5. La fecha de modificación se actualiza automáticamente al editar un post.
6. Puedes usar tanto el ID como el slug para actualizar o eliminar posts, según tu preferencia.
7. El campo `author` está preparado para una futura implementación de sistema de autores.
8. El campo `featured_media` es importante para la presentación visual del post en la web.
9. El campo `status` permite controlar la visibilidad y el flujo de trabajo de los posts.
10. El campo `domain` permite organizar el contenido en diferentes secciones del sitio.

## Campos Especiales

### Status
El campo `status` determina la visibilidad y el estado de publicación del post.

| Valor | Descripción | Comportamiento en la Web |
|-------|-------------|-------------------------|
| `publish` | Post publicado y visible | El post es visible públicamente en la web |
| `draft` | Borrador | El post no es visible públicamente, solo para administradores |
| `private` | Privado | El post solo es visible para usuarios autenticados |
| `pending` | Pendiente de revisión | El post está en espera de aprobación |

### Author
El campo `author` identifica al creador del post. Actualmente este campo no tiene soporte completo en la interfaz web, pero está preparado para una futura implementación.

| Valor | Descripción |
|-------|-------------|
| `1` | Autor por defecto del sistema |
| `n` | ID numérico del autor (para futura implementación) |

### Featured Media
El campo `featured_media` define la imagen principal del post.

| Valor | Descripción | Comportamiento en la Web |
|-------|-------------|-------------------------|
| `0` | Sin imagen destacada | No se muestra imagen principal |
| `URL` | URL de la imagen | La imagen se muestra como imagen principal del post |
| `null` | Sin imagen destacada | No se muestra imagen principal |

#### Ejemplo de uso de Featured Media
```json
{
  "featured_media": "https://www.bitcoinarg.news/images/mi-imagen.jpg"
}
```

### Domain
El campo `domain` permite organizar los posts por diferentes dominios o secciones del sitio.

| Valor | Descripción | Comportamiento en la Web |
|-------|-------------|-------------------------|
| `default` | Dominio principal | Posts visibles en la sección principal |
| `bitcoin` | Sección Bitcoin | Posts específicos de Bitcoin |
| `altcoins` | Sección Altcoins | Posts sobre otras criptomonedas |
| `mineria` | Sección Minería | Posts sobre minería de criptomonedas |

### Categories y Tags
Los campos `categories` y `tags` permiten organizar y clasificar los posts.

#### Categories
- Son específicas por dominio
- Se muestran en la navegación principal
- Permiten filtrar posts por categoría
- Ejemplo de uso:
```json
{
  "categories": [1, 2]  // IDs de las categorías
}
```

#### Tags
- Son globales (no dependen del dominio)
- Se muestran como etiquetas en los posts
- Permiten relacionar posts por temas
- Ejemplo de uso:
```json
{
  "tags": [1, 2]  // IDs de los tags
}
``` 