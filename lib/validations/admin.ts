import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
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
  featured: z.boolean().optional().default(false),
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

// ── Dashboard de agencia ─────────────────────────────────────────────────────

export const MIN_PASSWORD = 8;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD, `La contraseña nueva necesita al menos ${MIN_PASSWORD} caracteres`),
    confirmPassword: z.string().min(1, 'Repetí la contraseña nueva'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const roleEnum = z.enum(['ADMIN', 'EMPLOYEE']);
export const clientStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'CHURNED']);
export const packageStatusEnum = z.enum(['OPEN', 'COMPLETED']);
export const taskStatusEnum = z.enum(['PENDING', 'DONE']);
export const socialNetworkEnum = z.enum(['INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'YOUTUBE']);

export const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  email: z.string().email('Email inválido').max(160),
  role: roleEnum.default('EMPLOYEE'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  slug: z
    .string()
    .min(1, 'El slug es obligatorio')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Sólo minúsculas, números y guiones'),
  status: clientStatusEnum.default('ACTIVE'),
  monthlyAmount: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const createClientProfileSchema = z.object({
  postproxyProfileId: z.string().min(1, 'El ID de perfil de PostProxy es obligatorio').max(120),
  network: socialNetworkEnum,
  handle: z.string().max(120).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const updateClientProfileSchema = createClientProfileSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createPackageSchema = z.object({
  clientId: z.number().int().positive(),
  /** Mes del paquete en formato YYYY-MM. */
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Usá el formato YYYY-MM'),
  committedPieces: z.number().int().min(1, 'Al menos una pieza').max(500),
  amount: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updatePackageSchema = z.object({
  committedPieces: z.number().int().min(1).max(500).optional(),
  amount: z.number().int().min(0).nullable().optional(),
  status: packageStatusEnum.optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const createTaskSchema = z.object({
  packageId: z.number().int().positive(),
  title: z.string().min(1, 'El título es obligatorio').max(200),
  network: socialNetworkEnum,
  format: z.string().min(1, 'El formato es obligatorio').max(60),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usá el formato YYYY-MM-DD'),
  assigneeId: z.number().int().positive().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  network: socialNetworkEnum.optional(),
  format: z.string().min(1).max(60).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const completeTaskSchema = z.object({
  status: taskStatusEnum,
  permalink: z.string().url('Pegá el link de la pieza publicada').nullable().optional(),
});

export const taskFiltersSchema = z.object({
  clientId: z.number().int().positive().optional(),
  assigneeId: z.number().int().positive().optional(),
  status: taskStatusEnum.optional(),
  network: socialNetworkEnum.optional(),
  packageId: z.number().int().positive().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

export const metricsRangeSchema = z.object({
  clientId: z.number().int().positive().optional(),
  days: z.union([z.literal(7), z.literal(28), z.literal(90)]).default(28),
});
