import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  PostWithRelations,
  generateSlug,
  generateExcerpt,
  validateCategoriesForDomain,
  validateTagsExist,
} from '@/lib/services/posts-service';
import { notifyPostPublished } from '@/lib/services/notify';
import { isMirroredUrl, mirrorRemoteImage } from '@/lib/services/media-mirror';
import { canGenerateCover, generateCoverImage } from '@/lib/services/cover-image';
import { humanizeText } from '@/lib/services/humanize-text';
import { getDefaultAuthorId } from '@/lib/api/authors';

/**
 * Alta de un post publicado por una máquina: la ingesta RSS
 * (`news-ingest.ts`) o un cliente externo vía `POST /api/wp/v2/posts`.
 * Los dos tienen que pasar por la misma limpieza, portada y avisos.
 */
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  domain: string;
  status?: string;
  author?: number;
  /** Ids sueltos o en array: la ingesta vieja mandaba `"categories": 173`. */
  categories?: unknown;
  tags?: unknown;
  featuredMedia?: unknown;
  mirrorMedia?: boolean;
}

export interface CreatePostResult {
  post: PostWithRelations;
  /** Qué pasó con la portada. Va en la respuesta porque los logs de Vercel no están a mano. */
  cover: string;
}

/** Datos inválidos del cliente (400), a diferencia de una falla nuestra. */
export class PostInputError extends Error {}

const toIdArray = (value: unknown): number[] =>
  (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value])
    .map(Number)
    .filter(id => Number.isInteger(id));

/**
 * Lanza `PostInputError` si las categorías o tags no existen, y deja pasar el
 * P2002 de Prisma si el slug ya está tomado: cada llamador decide qué hacer.
 */
export async function createPost(input: CreatePostInput): Promise<CreatePostResult> {
  // El texto viene de una IA: se limpian los tics (raya, "Conclusión" genérica)
  // antes de que llegue al slug, a la portada y a la base.
  const title = humanizeText(input.title);
  const content = humanizeText(input.content);
  const excerpt = input.excerpt === undefined ? undefined : humanizeText(input.excerpt);
  if (content !== input.content) console.log('[createPost] Texto limpiado de marcas de IA');

  const { domain } = input;
  const categoryIds = toIdArray(input.categories);
  const tagIds = toIdArray(input.tags);

  if (categoryIds.length) {
    const categoryValidation = await validateCategoriesForDomain(categoryIds, domain);
    if (!categoryValidation.valid) {
      throw new PostInputError(`Categories not found for domain ${domain}: ${categoryValidation.missingIds.join(', ')}`);
    }
  }

  // Tags no son por dominio, por ahora.
  if (tagIds.length) {
    const tagValidation = await validateTagsExist(tagIds);
    if (!tagValidation.valid) {
      throw new PostInputError(`Tags not found: ${tagValidation.missingIds.join(', ')}`);
    }
  }

  const slug = generateSlug(title);

  /*
   * Una imagen que vive en el servidor de la fuente se copia a Blob para que el
   * post no dependa de que un tercero no rote ni borre la URL. Si el espejado
   * falla se guarda la original: una portada prestada es mejor que no publicar.
   */
  const rawMedia = input.featuredMedia;
  let featuredMedia: string | null =
    typeof rawMedia === 'string' && /^https?:\/\//i.test(rawMedia.trim()) ? rawMedia.trim() : null;

  if (featuredMedia && !isMirroredUrl(featuredMedia) && input.mirrorMedia !== false) {
    try {
      featuredMedia = await mirrorRemoteImage(featuredMedia, slug);
      console.log('[createPost] Imagen espejada en Blob:', featuredMedia);
    } catch (error) {
      console.warn(
        '[createPost] No se pudo espejar la imagen, se usa la original:',
        error instanceof Error ? error.message : error
      );
    }
  }

  /*
   * Sin portada la nota queda con el placeholder gris en la grilla, así que se
   * genera una. Si Gemini falla se publica igual: perder la noticia es peor
   * que publicarla sin imagen.
   */
  let cover = 'no hacía falta';

  if (!featuredMedia) {
    if (!canGenerateCover()) {
      cover = 'falta GEMINI_API_KEY';
      console.warn('[createPost] Sin GEMINI_API_KEY, se publica sin portada');
    } else {
      try {
        featuredMedia = await generateCoverImage(title, excerpt || '', slug);
        cover = 'generada';
        console.log('[createPost] Portada generada:', featuredMedia);
      } catch (error) {
        cover = error instanceof Error ? error.message : String(error);
        console.warn('[createPost] No se pudo generar la portada:', cover);
      }
    }
  }

  console.log('[createPost] Creando post:', {
    title,
    contentLength: content.length,
    excerpt: excerpt ? excerpt.length : 'auto-generated',
    slug,
    status: input.status || 'publish',
    featuredMedia,
    domain,
    categories: categoryIds.length,
    tags: tagIds.length,
  });

  const authorRefId = await getDefaultAuthorId(domain);

  const data: Prisma.PostCreateInput = {
    title,
    content,
    excerpt: excerpt || generateExcerpt(content),
    slug,
    status: input.status || 'publish',
    author: input.author || 1,
    featuredMedia,
    domain,
    ...(authorRefId && { authorRef: { connect: { id: authorRefId } } }),
    categories: { connect: categoryIds.map(id => ({ id })) },
    tags: { connect: tagIds.map(id => ({ id })) },
  };

  const post = await prisma.post.create({
    data,
    include: { categories: true, tags: true },
  });

  // Dispara los avisos a Discord, Telegram y X. Filtra por dominio y status, y nunca lanza.
  await notifyPostPublished(post);

  return { post: post as PostWithRelations, cover };
}
