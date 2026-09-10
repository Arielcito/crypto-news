'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { MUTED_STYLE } from '@/components/agencia/agency-ui';
import { toDateInput } from '@/lib/agency/dates';
import { EXPENSE_CATEGORIES, type CreateExpenseInput } from '@/lib/types/agency';

interface ExpenseFormFields {
  date: string;
  category: string;
  description: string;
  amount: string;
}

interface ExpenseFormProps {
  /** Mes que se está mirando: el gasto nuevo cae ahí, no en el de hoy. */
  month: string;
  onSubmit: (input: CreateExpenseInput) => void;
  isPending?: boolean;
}

/** Día por defecto: hoy si el mes abierto es el actual, si no el día 1. */
function defaultDate(month: string): string {
  const today = toDateInput(new Date());
  return today.startsWith(month) ? today : `${month}-01`;
}

export function ExpenseForm({ month, onSubmit, isPending = false }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormFields>({
    defaultValues: { date: defaultDate(month), category: '', description: '', amount: '' },
  });

  const submit = handleSubmit((values) =>
    onSubmit({
      date: values.date,
      category: values.category.trim(),
      description: values.description.trim(),
      amount: Number(values.amount),
    })
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-date">Fecha</Label>
          <Input
            id="expense-date"
            type="date"
            className={ADMIN_INPUT_CLASS}
            {...register('date', { required: 'Elegí la fecha' })}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-amount">Monto</Label>
          <Input
            id="expense-amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="0"
            className={ADMIN_INPUT_CLASS}
            {...register('amount', {
              required: 'Cuánto se gastó',
              min: { value: 1, message: 'Tiene que ser mayor a cero' },
            })}
          />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          <p className="text-xs" style={MUTED_STYLE}>
            En dólares, sin centavos.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category">Herramienta</Label>
        {/* Lista nativa: sugiere las de siempre y deja escribir una nueva. */}
        <Input
          id="expense-category"
          list="expense-categories"
          autoComplete="off"
          placeholder="Anthropic"
          className={ADMIN_INPUT_CLASS}
          {...register('category', { required: 'Elegí o escribí una categoría' })}
        />
        <datalist id="expense-categories">
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-description">Detalle</Label>
        <Input
          id="expense-description"
          placeholder="Plan Max de Claude"
          className={ADMIN_INPUT_CLASS}
          {...register('description', { required: 'Describí el gasto' })}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Cargar gasto'}
      </Button>
    </form>
  );
}
