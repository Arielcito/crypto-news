import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strips accents/diacritics from a string: "regulación" → "regulacion" */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Returns both the original slug and the accent-stripped version (deduplicated) */
export function slugVariants(slug: string): string[] {
  const stripped = removeAccents(slug);
  return stripped === slug ? [slug] : [slug, stripped];
}

/** URL pública de una nota. Sin categoría cae en /notas/, igual que el preview del admin. */
export function postPath(post: { slug: string; categories: { slug: string }[] }): string {
  return `/${post.categories[0]?.slug ?? 'notas'}/${post.slug}`;
}
