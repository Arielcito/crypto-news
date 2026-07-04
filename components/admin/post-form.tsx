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
import { useAdminTags } from '@/lib/use-admin-tags';
import { useAdminAuthors } from '@/lib/use-admin-authors';
import { useUploadMedia } from '@/lib/use-admin-upload';
import { createPostSchema } from '@/lib/validations/admin';
import type { AdminPost, CreatePostInput } from '@/lib/types/admin';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categoriesData } = useAdminCategories();
  const { data: tagsData } = useAdminTags();
  const { data: authorsData } = useAdminAuthors();
  const uploadMutation = useUploadMedia();

  const categories = categoriesData?.data ?? [];
  const tags = tagsData?.data ?? [];
  const authors = authorsData?.data ?? [];

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
      categories: initialValues?.categories.map((c) => c.id) ?? [],
      tags: initialValues?.tags.map((t) => t.id) ?? [],
    },
  });

  const title = watch('title');
  const content = watch('content');
  const featuredMedia = watch('featuredMedia');
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
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" type="text" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              type="text"
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea id="excerpt" rows={3} {...register('excerpt')} />
            {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
          </div>

          <div className="space-y-2" data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}>
            <Label htmlFor="content">Contenido</Label>
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
          <div className="space-y-2">
            <Label>Estado</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar autor" />
                  </SelectTrigger>
                  <SelectContent>
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

          <div className="space-y-2">
            <Label>Imagen destacada</Label>
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
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-accent"
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
          </div>

          <div className="space-y-2">
            <Label>Categorías</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin categorías</p>
              )}
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label htmlFor={`category-${category.id}`} className="text-sm">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {tags.length === 0 && <p className="text-sm text-muted-foreground">Sin tags</p>}
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-sm">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
