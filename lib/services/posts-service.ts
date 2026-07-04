import { prisma } from '@/lib/prisma';
import { Post, DomainCategories, Tag } from '@prisma/client';

export type PostWithRelations = Post & {
  categories: DomainCategories[];
  tags: Tag[];
};

export function cleanUrls(text: string): string {
  return text.replace(/<(https?:\/\/[^>]+)>/g, '$1');
}

export function cleanPostData(post: PostWithRelations): PostWithRelations {
  return {
    ...post,
    content: cleanUrls(post.content),
    excerpt: post.excerpt ? cleanUrls(post.excerpt) : post.excerpt,
    featuredMedia: post.featuredMedia ? cleanUrls(post.featuredMedia) : post.featuredMedia,
  };
}

export function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function generateExcerpt(content: string): string {
  return content.substring(0, 200) + '...';
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; missingIds: number[] };

export async function validateCategoriesForDomain(
  categoryIds: number[],
  domain: string
): Promise<ValidationResult> {
  if (!categoryIds.length) {
    return { valid: true };
  }
  const existing = await prisma.domainCategories.findMany({
    where: { AND: [{ id: { in: categoryIds } }, { domain }] },
  });
  if (existing.length !== categoryIds.length) {
    const foundIds = existing.map((c) => c.id);
    const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
    return { valid: false, missingIds };
  }
  return { valid: true };
}

export async function validateTagsExist(tagIds: number[]): Promise<ValidationResult> {
  if (!tagIds.length) {
    return { valid: true };
  }
  const existing = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
  if (existing.length !== tagIds.length) {
    const foundIds = existing.map((t) => t.id);
    const missingIds = tagIds.filter((id) => !foundIds.includes(id));
    return { valid: false, missingIds };
  }
  return { valid: true };
}
