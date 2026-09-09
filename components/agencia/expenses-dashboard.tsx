'use client';

import { useState } from 'react';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { ExpenseForm } from '@/components/agencia/expense-form';
import {
  AgencyCard,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
  StatCard,
} from '@/components/agencia/agency-ui';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { useAgencyExpenses, useCreateExpense, useDeleteExpense } from '@/lib/use-agency-expenses';
import { currentMonthAr, formatCalendarDate, formatMonthLabel } from '@/lib/agency/dates';
import { formatMoney, type AgencyExpense, type CreateExpenseInput } from '@/lib/types/agency';

/** `YYYY-MM` → el 1 de ese mes en UTC, que es como se rotulan los paquetes. */
const monthLabel = (month: string) => formatMonthLabel(`${month}-01T00:00:00.000Z`);

export function ExpensesDashboard() {
  const [month, setMonth] = useState(currentMonthAr);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<AgencyExpense | null>(null);

  const { data, isLoading, isError, error } = useAgencyExpenses(month);
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const handleCreate = (input: CreateExpenseInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Gasto cargado');
        setCreateOpen(false);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al cargar'),
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Gasto eliminado');
        setDeleting(null);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al eliminar'),
    });
  };

  if (isError) return <ErrorNote error={error} resource="los gastos" />;

  // El pico del mes marca el 100% de las barras: comparar categorías entre sí
  // es lo que sirve, y una escala contra el total deja todo en un hilo.
  const topCategory = data?.byCategory[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="expenses-month">Mes</Label>
          <Input
            id="expenses-month"
            type="month"
            value={month}
            onChange={(event) => event.target.value && setMonth(event.target.value)}
            className={`${ADMIN_INPUT_CLASS} w-full sm:w-48`}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      {isLoading || !data ? (
        <ListSkeleton rows={3} height="h-28" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={`Gastado en ${monthLabel(month)}`}
              value={formatMoney(data.monthTotal)}
              hint={`${data.expenses.length} ${data.expenses.length === 1 ? 'gasto cargado' : 'gastos cargados'}`}
            />
            <StatCard
              label="Promedio mensual"
              value={formatMoney(data.monthlyAverage)}
              hint={
                data.monthsTracked > 0
                  ? `Sobre ${data.monthsTracked} ${data.monthsTracked === 1 ? 'mes' : 'meses'} desde el primer gasto`
                  : 'Todavía no hay historial'
              }
              trend={data.series.map((point) => point.total)}
            />
            <StatCard
              label="Total acumulado"
              value={formatMoney(data.allTimeTotal)}
              hint="Todo lo cargado hasta hoy"
            />
          </div>

          <AgencyCard
            title="Por categoría"
            description={`En qué se fue la plata de ${monthLabel(month)}.`}
          >
            {data.byCategory.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Sin gastos este mes"
                description="Cargá el primero y acá vas a ver cómo se reparte."
              />
            ) : (
              <ul className="space-y-3">
                {data.byCategory.map((row) => (
                  <li key={row.category} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{row.category}</span>
                      <span className="text-sm tabular-nums">{formatMoney(row.total)}</span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{
                          width: `${topCategory > 0 ? Math.round((row.total / topCategory) * 100) : 0}%`,
                          backgroundColor: 'hsl(var(--admin-accent))',
                        }}
                      />
                    </div>
                    <p className="text-xs" style={MUTED_STYLE}>
                      {data.monthTotal > 0
                        ? `${Math.round((row.total / data.monthTotal) * 100)}% del mes`
                        : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AgencyCard>

          <AgencyCard title="Detalle" description={`Gastos cargados en ${monthLabel(month)}.`}>
            {data.expenses.length === 0 ? (
              <EmptyState icon={Receipt} title="Nada cargado en este mes" />
            ) : (
              <ul className="space-y-2">
                {data.expenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                    style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{expense.description}</p>
                      <p className="text-xs" style={MUTED_STYLE}>
                        {formatCalendarDate(expense.date)} · {expense.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(expense.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(expense)}
                        aria-label={`Eliminar ${expense.description}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AgencyCard>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo gasto</DialogTitle>
          </DialogHeader>
          <ExpenseForm month={month} onSubmit={handleCreate} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar gasto"
        description={
          deleting
            ? `Se borra "${deleting.description}" por ${formatMoney(deleting.amount)}. No se puede deshacer.`
            : ''
        }
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
