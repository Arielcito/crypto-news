# Gestión de Categorías

## Estructura de Categorías
- Las categorías están organizadas por dominio (cada sitio tiene sus propias categorías)
- Cada categoría tiene:
  - ID único
  - Nombre
  - Slug (URL amigable)
  - Estado activo/inactivo
  - Dominio asociado

## Relación con Posts
- Un post puede tener múltiples categorías
- La relación es many-to-many (muchos posts pueden tener muchas categorías)
- Las categorías son obligatorias para los posts

## API Endpoints

### 1. Obtener Categorías
```http
GET /api/wp/v2/categories?domain=bitcoinarg.news
```
Respuesta:
```json
{
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Bitcoin y Finanzas Personales",
        "slug": "bitcoin-finanzas",
        "domain": "bitcoinarg.news",
        "isActive": true
      }
    ],
    "total": 114
  },
  "error": null,
  "message": "Categories retrieved successfully"
}
```

### 2. Crear Nueva Categoría
```http
POST /api/wp/v2/categories
Content-Type: application/json
Authorization: Basic {credentials}

{
  "name": "Nueva Categoría",
  "domain": "bitcoinarg.news",
  "slug": "nueva-categoria" // opcional, se genera automáticamente si no se proporciona
}
```
Respuesta:
```json
{
  "data": {
    "id": 115,
    "name": "Nueva Categoría",
    "slug": "nueva-categoria",
    "domain": "bitcoinarg.news",
    "isActive": true
  },
  "error": null,
  "message": "Category created successfully"
}
```

### 3. Modificar Categoría
```http
PUT /api/wp/v2/categories/{id}
Content-Type: application/json
Authorization: Basic {credentials}

{
  "name": "Nombre Modificado",
  "isActive": false
}
```
Respuesta:
```json
{
  "data": {
    "id": 1,
    "name": "Nombre Modificado",
    "slug": "bitcoin-finanzas",
    "domain": "bitcoinarg.news",
    "isActive": false
  },
  "error": null,
  "message": "Category updated successfully"
}
```

### 4. Eliminar Categoría
```http
DELETE /api/wp/v2/categories/{id}
Authorization: Basic {credentials}
```
Respuesta:
```json
{
  "data": null,
  "error": null,
  "message": "Category deleted successfully"
}
```

### 5. Buscar Categorías
```http
GET /api/wp/v2/categories?domain=bitcoinarg.news&search=bitcoin
```
Respuesta:
```json
{
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Bitcoin y Finanzas Personales",
        "slug": "bitcoin-finanzas",
        "domain": "bitcoinarg.news",
        "isActive": true
      }
    ],
    "total": 1
  },
  "error": null,
  "message": "Categories retrieved successfully"
}
```

## Consideraciones Importantes

### Autenticación
- Todas las operaciones de escritura (POST, PUT, DELETE) requieren autenticación básica
- Las operaciones de lectura (GET) son públicas

### Validaciones
- El dominio es obligatorio al crear una categoría
- El slug debe ser único por dominio
- No se puede eliminar una categoría que tenga posts asociados

### Manejo de Errores
```json
{
  "data": null,
  "error": "Bad request",
  "message": "Category name is required"
}
```

## Proceso de Limpieza de Categorías

### 1. Identificar Categorías sin Uso
```http
# Obtener todas las categorías
GET /api/wp/v2/categories?domain=bitcoinarg.news
```

### 2. Marcar Categorías como Inactivas
```http
PUT /api/wp/v2/categories/{id}
Content-Type: application/json
Authorization: Basic {credentials}

{
  "isActive": false
}
```

### 3. Eliminar Categorías
```http
DELETE /api/wp/v2/categories/{id}
Authorization: Basic {credentials}
```

## Reasignación de Posts

### 1. Obtener Posts de una Categoría
```http
GET /api/wp/v2/posts?categories=1&domain=bitcoinarg.news
```

### 2. Actualizar Posts con Nueva Categoría
```http
PUT /api/wp/v2/posts/{post_id}
Content-Type: application/json
Authorization: Basic {credentials}

{
  "categories": [2, 3] // IDs de las nuevas categorías
}
```

## Mejores Prácticas

1. **Mantenimiento de Categorías**
   - Mantener un número manejable de categorías (8-12 por dominio)
   - Usar categorías amplias que puedan contener múltiples temas relacionados
   - Documentar la estructura de categorías para mantener consistencia

2. **Antes de Eliminar una Categoría**
   - Verificar si hay posts asociados
   - Reasignar los posts a otras categorías
   - Considerar marcar como inactiva en lugar de eliminar

3. **Organización por Dominio**
   - Cada dominio tiene su propio conjunto de categorías
   - Las categorías no se comparten entre dominios
   - Al crear/editar categorías, asegurarse de seleccionar el dominio correcto 