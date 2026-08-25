'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { MUTED_STYLE } from '@/components/agencia/agency-ui';
import { formatMonthKey } from '@/lib/agency/dates';
import type { AgencyPackage, CreatePackageInput } from '@/lib/types/agency';

interface PackageFormFields {
  month: string;
  committedPieces: number;
  amount: string;
  notes: string;
}

interface PackageFormProps {
  clientId: number;
  initialValues?: AgencyPackage;
  onSubmit: (input: CreatePackageInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function PackageForm({
  clientId,
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Crear paquete',
}: PackageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormFields>({
    defaultValues: {
      month: initialValues ? formatMonthKey(new Date(initialValues.month)) : formatMonthKey(new Date()),
      committedPieces: initialValues?.committedPieces ?? 8,
      amount: initialValues?.amount != null ? String(initialValues.amount) : '',
      notes: initialValues?.notes ?? '',
    },
  });

  const submit = handleSubmit((values) =>
    onSubmit({
      clientId,
      month: values.month,
      committedPieces: Number(values.committedPieces),
      amount: values.amount === '' ? null : Number(values.amount),
      notes: values.notes.trim() || null,
    })
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="package-month">Mes</Label>
          <Input
            id="package-month"
            type="month"
            className={ADMIN_INPUT_CLASS}
            disabled={!!initialValues}
            {...register('month', { required: 'Elegí el mes' })}
          />
          {errors.month && <p className="text-sm text-destructive">{errors.month.message}</p>}
          {initialValues && (
            <p className="text-xs" style={MUTED_STYLE}>
              El mes no se cambia: mové las tareas a otro paquete si te equivocaste.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="package-pieces">Piezas comprometidas</Label>
          <Input
            id="package-pieces"
            type="number"
            min={1}
            max={500}
            className={ADMIN_INPUT_CLASS}
            {...register('committedPieces', {
              valueAsNumber: true,
              required: 'Cuántas piezas se prometieron',
              min: { value: 1, message: 'Al menos una pieza' },
            })}
          />
          {errors.committedPieces && (
            <p className="text-sm text-destructive">{errors.committedPieces.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="package-amount">Monto del mes</Label>
        <Input id="package-amount" type="number" min={0} className={ADMIN_INPUT_CLASS} {...register('amount')} />
        <p className="text-xs" style={MUTED_STYLE}>
          Opcional. Queda guardado para cuando sumemos facturación.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="package-notes">Notas</Label>
        <Textarea id="package-notes" rows={3} className={ADMIN_INPUT_CLASS} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
