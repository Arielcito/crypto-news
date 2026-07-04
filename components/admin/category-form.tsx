'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategorySchema } from '@/lib/validations/admin';
import type { AdminCategory, CreateCategoryInput } from '@/lib/types/admin';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface CategoryFormProps {
  initialValues?: AdminCategory;
  onSubmit: (input: CreateCategoryInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function CategoryForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Guardar',
}: CategoryFormProps) {
  const [slugTouched, setSlugTouched] = useState(!!initialValues);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
    },
  });

  const name = watch('name');

  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugify(name || ''));
    }
  }, [name, slugTouched, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" type="text" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          type="text"
          {...register('slug', {
            onChange: () => setSlugTouched(true),
          })}
        />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
