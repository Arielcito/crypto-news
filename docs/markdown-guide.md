# Guía de Formato Markdown para Posts

Esta guía muestra todos los formatos de texto disponibles para escribir posts en nuestra plataforma. Todos los posts utilizan Markdown como formato base, lo que permite una rica experiencia de escritura con múltiples opciones de formato.

## Formato de Texto Básico

### Negrita
Para hacer texto en **negrita**, encierra el texto entre dos asteriscos `**`.

**Ejemplo:**
```
Este es un texto **en negrita**
```
Se verá así: Este es un texto **en negrita**

### Cursiva
Para hacer texto en *cursiva*, encierra el texto entre un asterisco `*`.

**Ejemplo:**
```
Este es un texto *en cursiva*
```
Se verá así: Este es un texto *en cursiva*

### Tachado
Para ~~tachar~~ texto, encierra el texto entre dos tildes `~~`.

**Ejemplo:**
```
Este es un texto ~~tachado~~
```
Se verá así: Este es un texto ~~tachado~~

## Encabezados

Los encabezados se crean usando el símbolo `#`. El número de `#` determina el nivel del encabezado.

**Ejemplo:**
```
# Encabezado 1
## Encabezado 2
### Encabezado 3
#### Encabezado 4
##### Encabezado 5
###### Encabezado 6
```

## Enlaces

Para crear enlaces, usa la siguiente sintaxis: `[texto del enlace](URL)`.

**Ejemplo:**
```
[Visita nuestra página](https://ejemplo.com)
```
Se verá así: [Visita nuestra página](https://ejemplo.com)

## Imágenes

Para insertar imágenes, usa la siguiente sintaxis: `![texto alternativo](URL de la imagen)`.

**Ejemplo:**
```
![Descripción de la imagen](https://ejemplo.com/imagen.jpg)
```

---

### Imágenes en el contenido de noticias

Puedes incluir imágenes en cualquier parte del cuerpo de la noticia usando Markdown. Las imágenes se mostrarán en el orden en que aparecen en el texto.

#### Ejemplo de noticia con varias imágenes:
```
# Título de la noticia

Primer párrafo introductorio.

![Imagen principal](https://www.bitcoinarg.news/images/portada.jpg)

Segundo párrafo con más información.

![Gráfico de precios](https://www.bitcoinarg.news/images/grafico.jpg)

Conclusión de la noticia.
```

#### Imágenes con enlace
Puedes hacer que una imagen sea clickeable:
```
[![Texto alternativo](https://www.bitcoinarg.news/images/miniatura.jpg)](https://www.bitcoinarg.news/noticia-completa)
```

#### Imágenes con título (tooltip)
```
![Descripción](https://www.bitcoinarg.news/images/ejemplo.jpg "Título de la imagen")
```

#### Imágenes con tamaño personalizado (usando HTML)
```
<img src="https://www.bitcoinarg.news/images/infografia.jpg" alt="Infografía" width="600" height="400">
```

---

### Recomendaciones y consideraciones
- **Orden:** Las imágenes se renderizan en el orden en que aparecen en el Markdown.
- **Formatos soportados:** JPG, PNG, WebP, GIF.
- **Tamaños recomendados:**
  - Imágenes principales: 1200x630px
  - Imágenes en contenido: 800x600px
- **Optimización:** Comprime las imágenes antes de subirlas y usa URLs HTTPS.
- **Accesibilidad:** Siempre incluye texto alternativo descriptivo.
- **Flexibilidad:** Puedes mezclar texto, imágenes, listas, tablas y otros elementos Markdown libremente.
- **Limitaciones:** Las imágenes deben estar alojadas en un servidor accesible públicamente. Si necesitas mayor control sobre el tamaño o alineación, puedes usar HTML dentro del Markdown.

---

## Listas

### Listas no ordenadas
Usa `-`, `*`, o `+` para crear listas no ordenadas.

**Ejemplo:**
```
- Primer elemento
- Segundo elemento
- Tercer elemento
```

### Listas ordenadas
Usa números seguidos de punto para crear listas ordenadas.

**Ejemplo:**
```
1. Primer elemento
2. Segundo elemento
3. Tercer elemento
```

## Citas

Para crear citas, usa el símbolo `>` al inicio de la línea.

**Ejemplo:**
```
> Esta es una cita importante
> que puede ocupar múltiples líneas
```
Se verá así:
> Esta es una cita importante
> que puede ocupar múltiples líneas

## Código

### Código en línea
Para código en línea, encierra el texto entre comillas invertidas `` ` ``.

**Ejemplo:**
```
Usa el comando `npm install` para instalar dependencias
```
Se verá así: Usa el comando `npm install` para instalar dependencias

### Bloques de código
Para bloques de código, usa tres comillas invertidas ``` al inicio y al final del bloque.

**Ejemplo:**
````
```javascript
function saludar() {
  console.log("¡Hola mundo!");
}
```
````

## Tablas

Las tablas se crean usando `|` para separar columnas y `-` para la línea de encabezado.

**Ejemplo:**
```
| Nombre | Edad | Ciudad |
|--------|------|--------|
| Juan   | 25   | Madrid |
| María  | 30   | París  |
```

Se verá así:

| Nombre | Edad | Ciudad |
|--------|------|--------|
| Juan   | 25   | Madrid |
| María  | 30   | París  |

## Líneas horizontales

Para crear una línea horizontal, usa tres o más guiones `-`, asteriscos `*`, o guiones bajos `_`.

**Ejemplo:**
```
---
```
o
```
***
```
o
```
___
```

## Notas importantes

1. Todos los posts soportan la sintaxis de GitHub Flavored Markdown (GFM), que incluye:
   - Tablas
   - Tachado
   - Listas de tareas
   - Resaltado de sintaxis para bloques de código

2. Para escapar caracteres especiales de Markdown, usa la barra invertida `\` antes del carácter.

3. Los espacios al final de las líneas son importantes para algunos formatos, especialmente para los saltos de línea.

## Ejemplos de uso común

### Combinación de formatos
```
**Texto en negrita** y *cursiva* pueden combinarse para crear ***texto en negrita y cursiva***.
```

### Lista de tareas
```
- [x] Tarea completada
- [ ] Tarea pendiente
```

### Enlaces con títulos
```
[Enlace con título](https://ejemplo.com "Título del enlace")
```

### Imágenes con enlaces
```
[![Texto alternativo](imagen.jpg)](https://ejemplo.com)
```

---

Recuerda que puedes combinar estos formatos para crear contenido rico y bien estructurado. Si tienes dudas sobre algún formato específico, consulta con el equipo de soporte. 