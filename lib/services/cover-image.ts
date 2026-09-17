import { put } from '@vercel/blob';

/**
 * Genera la portada de un post con Gemini y la sube a Blob.
 *
 * La ingesta automática casi nunca trae `og:image` — el modelo devuelve el
 * campo vacío — y una nota sin portada queda con el placeholder gris en la
 * grilla. En vez de sumar un módulo más en Make (que cuesta operaciones del
 * plan Free y obliga a meter un base64 gigante en el body del POST), la imagen
 * se genera acá, del lado del servidor, para cualquier cliente que publique
 * sin `featured_media`.
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const TIMEOUT_MS = 45_000;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

interface InteractionContent {
  type?: string;
  data?: string;
  mime_type?: string;
}

interface InteractionResponse {
  steps?: { content?: InteractionContent[] }[];
  output_image?: InteractionContent;
}

export const canGenerateCover = (): boolean => Boolean(process.env.GEMINI_API_KEY);

// Con una lista abierta de opciones el modelo siempre elegía la más típica
// (una persona mirando el celular en la calle) y todas las portadas salían
// iguales. Cada nota recibe una sola escena, fija por titular.
const SCENES = [
  'la fachada o el interior de un edificio institucional (parlamento, banco central, tribunal, ministerio), sin personas en primer plano',
  'un primer plano de hardware: servidores, racks o máquinas de minería con cables y luces de estado',
  'un monitor de trading con gráficos de velas en una oficina en penumbra, visto de costado y desenfocado',
  'una sala de reuniones o conferencia de prensa vista desde el fondo, con micrófonos y sillas',
  'un plano detalle de documentos, carpetas y una lapicera sobre un escritorio de madera',
  'una vista aérea o panorámica de una ciudad o distrito financiero',
  'un comercio o mercado callejero con un cartel de pago en efectivo o terminal de cobro',
  'una planta industrial o de energía (represa, parque solar, galpón) en exteriores',
  'un plano detalle de una laptop con código o una terminal en un escritorio',
  'un pasillo de oficina corporativa vacío con paredes de vidrio',
];

// Segundo eje: con 10 escenas para decenas de notas la escena se repite, y dos
// notas con la misma escena salían casi idénticas. El encuadre las despega.
const FRAMINGS = [
  'plano general, cámara a la altura de los ojos, luz de mediodía',
  'plano detalle bien cerca del sujeto, luz cálida de tarde',
  'contrapicado desde abajo, cielo nublado',
  'picado desde arriba, luz difusa',
  'plano lateral con el sujeto descentrado a la izquierda, hora dorada',
  'plano a contraluz con la silueta recortada, interior en penumbra',
];

function hashOf(text: string, seed: number): number {
  let hash = seed;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function pickScene(title: string): string {
  const scene = SCENES[hashOf(title, 0) % SCENES.length];
  return `${scene}. Encuadre: ${FRAMINGS[hashOf(title, 7) % FRAMINGS.length]}`;
}

export function buildCoverPrompt(title: string, excerpt: string): string {
  return [
    // Fotográfica, no ilustración: el render 3D se veía genérico y "hecho con IA".
    'Fotografía periodística realista para la portada de una nota de un medio de criptomonedas.',
    `Titular: «${title}»`,
    excerpt ? `Contexto: ${excerpt.slice(0, 400)}` : '',
    `Escena: ${pickScene(title)}. Adaptala al tema del titular (país, sector, tipo de institución).`,
    'No muestres personas mirando o sosteniendo un celular.',
    'Estilo: foto documental con cámara réflex, lente 35 mm, luz natural, profundidad de campo baja, grano sutil, colores naturales.',
    'Evitá lo que delata una imagen generada: nada de monedas doradas flotando, hologramas, neón, brillos, render 3D ni estética de ciencia ficción.',
    'Sin texto, letras, números ni logos. Sin personas reales identificables. Sin marcas de agua.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** El primer bloque con bytes; los modelos intercalan texto antes de la imagen. */
export function extractImage(payload: InteractionResponse): Required<Pick<InteractionContent, 'data'>> & InteractionContent {
  const fromSteps = payload.steps?.flatMap((step) => step.content ?? []).find((content) => content.data);
  const image = fromSteps ?? payload.output_image;
  if (!image?.data) throw new Error('Gemini no devolvió ninguna imagen');
  return { ...image, data: image.data };
}

export async function generateCoverImage(title: string, excerpt: string, slug: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: MODEL,
      input: [{ type: 'text', text: buildCoverPrompt(title, excerpt) }],
      response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '16:9', image_size: '1K' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini respondió ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const image = extractImage((await response.json()) as InteractionResponse);
  const contentType = (image.mime_type || 'image/jpeg').toLowerCase();
  const buffer = Buffer.from(image.data, 'base64');
  if (buffer.byteLength === 0) throw new Error('La imagen generada vino vacía');

  const safeSlug = slug.slice(0, 60) || 'post';
  const blob = await put(`posts/${Date.now()}-${safeSlug}.${EXTENSIONS[contentType] ?? 'jpg'}`, buffer, {
    access: 'public',
    contentType,
  });

  return blob.url;
}
