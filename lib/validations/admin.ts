import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const postStatusEnum = z.enum(['publish', 'draft']);

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  status: postStatusEnum.default('draft'),
  authorRefId: z.number().int().positive().optional(),
  featuredMedia: z.string().url().optional().nullable(),
  categories: z.array(z.number().int().positive()).optional().default([]),
  tags: z.array(z.number().int().positive()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
});

export const updateTagSchema = createTagSchema.partial();
