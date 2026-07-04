'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { createTagSchema } from '@/lib/validations/admin';
import type { AdminTag, CreateTagInput } from '@/lib/types/admin';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface TagFormProps {
  initialValues?: AdminTag;
  onSubmit: (input: CreateTagInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function TagForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Guardar',
}: TagFormProps) {
  const [slugTouched, setSlugTouched] = useState(!!initialValues);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? '',
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
        <Input id="name" type="text" className={ADMIN_INPUT_CLASS} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          type="text"
          className={ADMIN_INPUT_CLASS}
          {...register('slug', {
            onChange: () => setSlugTouched(true),
          })}
        />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
