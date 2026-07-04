import type { Post, DomainCategories, Tag, Author } from '@prisma/client';
import type { z } from 'zod';
import type {
  loginSchema,
  createPostSchema,
  updatePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  updateTagSchema,
} from '@/lib/validations/admin';

export type AdminPost = Post & {
  categories: DomainCategories[];
  tags: Tag[];
  authorRef: Author | null;
};

export type AdminCategory = DomainCategories;
export type AdminTag = Tag;
export type AdminAuthor = Author;

export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  totalPages: number;
}
