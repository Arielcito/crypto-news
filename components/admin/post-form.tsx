'use client';

import '@uiw/react-md-editor/markdown-editor.css';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCategories } from '@/lib/use-admin-categories';
import { useAdminTags, useCreateTag } from '@/lib/use-admin-tags';
import { useAdminAuthors } from '@/lib/use-admin-authors';
import { useUploadMedia } from '@/lib/use-admin-upload';
import { createPostSchema } from '@/lib/validations/admin';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import type { AdminPost, CreatePostInput } from '@/lib/types/admin';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const ADMIN_SURFACE_STYLE = {
  backgroundColor: 'hsl(var(--admin-surface))',
  borderColor: 'hsl(var(--admin-surface-border))',
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-5" style={ADMIN_SURFACE_STYLE}>
      <h2
        className="font-admin mb-4 text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'hsl(var(--admin-accent))' }}
      >
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type PostFormValues = z.input<typeof createPostSchema>;

interface PostFormProps {
  initialValues?: AdminPost;
  onSubmit: (input: CreatePostInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function PostForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Guardar',
}: PostFormProps) {
  const { resolvedTheme } = useTheme();
  const [slugTouched, setSlugTouched] = useState(!!initialValues);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categoriesData } = useAdminCategories();
  const { data: tagsData } = useAdminTags();
  const { data: authorsData } = useAdminAuthors();
  const uploadMutation = useUploadMedia();
  const createTagMutation = useCreateTag();

  const categories = categoriesData?.data ?? [];
  const tags = tagsData?.data ?? [];
  const authors = authorsData?.data ?? [];
  const visibleCategories = categoryFilter
    ? categories.filter((c) => c.name.toLowerCase().includes(categoryFilter.toLowerCase()))
    : categories;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      slug: initialValues?.slug ?? '',
      content: initialValues?.content ?? '',
      excerpt: initialValues?.excerpt ?? '',
      status: (initialValues?.status as 'publish' | 'draft') ?? 'draft',
      authorRefId: initialValues?.authorRefId ?? undefined,
      featuredMedia: initialValues?.featuredMedia ?? null,
      featured: initialValues?.featured ?? false,
      categories: initialValues?.categories.map((c) => c.id) ?? [],
      tags: initialValues?.tags.map((t) => t.id) ?? [],
    },
  });

  const title = watch('title');
  const content = watch('content');
  const featuredMedia = watch('featuredMedia');
  const featured = watch('featured');
  const selectedCategories = watch('categories') ?? [];
  const selectedTags = watch('tags') ?? [];

  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugify(title || ''));
    }
  }, [title, slugTouched, setValue]);

  const toggleCategory = (id: number) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    setValue('categories', next);
  };

  const toggleTag = (id: number) => {
    const next = selectedTags.includes(id)
      ? selectedTags.filter((t) => t !== id)
      : [...selectedTags, id];
    setValue('tags', next);
  };

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    createTagMutation.mutate(
      { name, slug: slugify(name) },
      {
        onSuccess: (response) => {
          if (response.error || !response.data) {
            toast.error(response.message || response.error || 'Error al crear el tag');
            return;
          }
          setValue('tags', [...selectedTags, response.data.id]);
          setNewTagName('');
          toast.success('Tag creado');
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear el tag'),
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'Error al subir la imagen');
          return;
        }
        setValue('featuredMedia', response.data.url);
        toast.success('Imagen subida');
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al subir la imagen'),
    });
    e.target.value = '';
  };

  const submit = (values: PostFormValues) => {
    onSubmit({
      ...values,
      status: values.status ?? 'draft',
      categories: values.categories ?? [],
      tags: values.tags ?? [],
    } as CreatePostInput);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6 pb-20">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <FormSection title="Contenido">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" type="text" className={ADMIN_INPUT_CLASS} {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                className={ADMIN_INPUT_CLASS}
                {...register('slug', { onChange: () => setSlugTouched(true) })}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumen</Label>
              <Textarea id="excerpt" rows={3} {...register('excerpt')} />
              {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
            </div>
          </FormSection>

          <div
            className="space-y-2 rounded-lg border p-5"
            style={ADMIN_SURFACE_STYLE}
            data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}
          >
            <Label htmlFor="content">Contenido de la nota</Label>
            <MDEditor
              id="content"
              value={content}
              onChange={(value) => setValue('content', value ?? '')}
              height={400}
              preview="live"
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <FormSection title="Publicación">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={ADMIN_INPUT_CLASS}>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent style={ADMIN_SURFACE_STYLE}>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="publish">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Autor</Label>
              <Controller
                control={control}
                name="authorRefId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className={ADMIN_INPUT_CLASS}>
                      <SelectValue placeholder="Seleccionar autor" />
                    </SelectTrigger>
                    <SelectContent style={ADMIN_SURFACE_STYLE}>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={String(author.id)}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setValue('featured', checked === true)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Destacado (Noticias Destacadas)
              </Label>
            </div>
          </FormSection>

          <FormSection title="Imagen destacada">
            {featuredMedia ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredMedia}
                  alt="Imagen destacada"
                  className="h-32 w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={() => setValue('featuredMedia', null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm transition-colors"
                style={{
                  borderColor: 'hsl(var(--admin-surface-border))',
                  color: 'hsl(var(--admin-muted-foreground))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--admin-accent))';
                  e.currentTarget.style.color = 'hsl(var(--admin-accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--admin-surface-border))';
                  e.currentTarget.style.color = 'hsl(var(--admin-muted-foreground))';
                }}
              >
                <ImagePlus className="h-6 w-6" />
                {uploadMutation.isPending ? 'Subiendo...' : 'Subir imagen'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </FormSection>

          <FormSection title="Categorías">
            {categories.length === 0 ? (
              <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                Sin categorías
              </p>
            ) : (
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Buscar categoría..."
                  className={ADMIN_INPUT_CLASS}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
                <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto pr-1">
                  {visibleCategories.length === 0 && (
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                      Sin resultados
                    </p>
                  )}
                  {visibleCategories.map((category) => {
                    const active = selectedCategories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        className="admin-chip"
                        data-active={active}
                        onClick={() => toggleCategory(category.id)}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Tags">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nuevo tag..."
                  className={ADMIN_INPUT_CLASS}
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateTag}
                  disabled={createTagMutation.isPending || !newTagName.trim()}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                    Sin tags todavía. Creá el primero arriba.
                  </p>
                )}
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className="admin-chip"
                      data-active={active}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-10 border-t px-4 py-3 md:pl-64"
        style={{ backgroundColor: 'hsl(var(--admin-bg))', borderColor: 'hsl(var(--admin-surface-border))' }}
      >
        <div className="mx-auto flex max-w-5xl justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
