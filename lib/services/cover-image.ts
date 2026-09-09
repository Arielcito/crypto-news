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

export function buildCoverPrompt(title: string, excerpt: string): string {
  return [
    'Ilustración editorial digital para la portada de una nota de un medio de criptomonedas.',
    `Titular: «${title}»`,
    excerpt ? `Contexto: ${excerpt.slice(0, 400)}` : '',
    'Estilo: render 3D moderno y limpio, iluminación cinematográfica, paleta oscura con acentos naranjas.',
    'Representá la idea de forma simbólica: gráficos, monedas, arquitectura, mapas, dispositivos.',
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
