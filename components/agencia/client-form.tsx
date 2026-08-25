'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { createClientSchema } from '@/lib/validations/admin';
import { CLIENT_STATUS_LABELS } from '@/lib/types/agency';
import type { AgencyClient, CreateClientInput } from '@/lib/types/agency';
import { AGENCY_SELECT_CLASS, MUTED_STYLE } from '@/components/agencia/agency-ui';

/*
 * Lo que el formulario tiene ANTES de que zod aplique los `.default()`: el
 * `status` todavía puede faltar. El tercer genérico de `useForm` es lo que sale
 * después de validar, que es lo que viaja al API.
 */
type ClientFormValues = z.input<typeof createClientSchema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface ClientFormProps {
  initialValues?: AgencyClient;
  onSubmit: (input: CreateClientInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function ClientForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Guardar',
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<ClientFormValues, unknown, CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      status: initialValues?.status ?? 'ACTIVE',
      monthlyAmount: initialValues?.monthlyAmount ?? null,
      notes: initialValues?.notes ?? '',
    },
  });

  const name = watch('name');
  // El slug de un cliente que ya existe no se autogenera: cambiarlo sin querer
  // rompería cualquier link guardado a su ficha.
  const autoSlug = !initialValues && !dirtyFields.slug;

  /*
   * El slug se escribe en el form, no se muestra de placeholder: zod valida
   * antes de que corra el submit, así que un slug que sólo existe como pista
   * visual hace fallar el alta con "El slug es obligatorio" teniéndolo a la
   * vista. `shouldDirty: false` para que siga siendo automático hasta que
   * alguien lo toque.
   */
  useEffect(() => {
    if (!autoSlug) return;
    setValue('slug', slugify(name || ''), { shouldDirty: false, shouldValidate: false });
  }, [name, autoSlug, setValue]);

  const submit = handleSubmit((values) =>
    onSubmit({
      ...values,
      monthlyAmount: values.monthlyAmount ?? null,
      notes: values.notes?.trim() ? values.notes : null,
    })
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name">Nombre</Label>
        <Input id="client-name" className={ADMIN_INPUT_CLASS} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-slug">Slug</Label>
        <Input
          id="client-slug"
          className={ADMIN_INPUT_CLASS}
          {...register('slug', {
            onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
              setValue('slug', event.target.value, { shouldDirty: true }),
          })}
        />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-status">Estado</Label>
          <select id="client-status" className={AGENCY_SELECT_CLASS} {...register('status')}>
            {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-amount">Abono mensual</Label>
          <Input
            id="client-amount"
            type="number"
            min={0}
            step={1}
            className={ADMIN_INPUT_CLASS}
            {...register('monthlyAmount', {
              setValueAs: (value: string) => (value === '' ? null : Number(value)),
            })}
          />
          <p className="text-xs" style={MUTED_STYLE}>
            Opcional. Sólo se usa como referencia interna.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-notes">Notas</Label>
        <Textarea id="client-notes" rows={3} className={ADMIN_INPUT_CLASS} {...register('notes')} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
