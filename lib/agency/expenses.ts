import type { Expense } from '@prisma/client';
import { currentMonthAr, formatMonthKey } from '@/lib/agency/dates';
import type { ExpensesOverview } from '@/lib/types/agency';

/**
 * Resumen de gastos: lo del mes elegido, el promedio mensual y el acumulado.
 *
 * El promedio se divide por los meses TRANSCURRIDOS desde el primer gasto, no
 * por los meses que tienen filas cargadas: un mes en el que no se gastó nada
 * sigue siendo un mes, y saltearlo infla el promedio justo cuando la agencia
 * gastó menos.
 */
export function summarizeExpenses(
  expenses: Expense[],
  month: string,
  now = new Date()
): ExpensesOverview {
  const byMonth = new Map<string, number>();
  const byCategory = new Map<string, number>();
  let allTimeTotal = 0;

  for (const expense of expenses) {
    const key = formatMonthKey(expense.date);
    byMonth.set(key, (byMonth.get(key) ?? 0) + expense.amount);
    allTimeTotal += expense.amount;

    if (key === month) {
      byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount);
    }
  }

  const series = [...byMonth.entries()]
    .map(([key, total]) => ({ month: key, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const monthsTracked =
    series.length > 0 ? monthsBetween(series[0].month, latestMonth(series, now)) : 0;

  return {
    month,
    monthTotal: byMonth.get(month) ?? 0,
    monthlyAverage: monthsTracked > 0 ? Math.round(allTimeTotal / monthsTracked) : 0,
    allTimeTotal,
    monthsTracked,
    series,
    byCategory: [...byCategory.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    expenses: expenses.filter((expense) => formatMonthKey(expense.date) === month),
  };
}

/** El mes que cierra el promedio: el actual, salvo que haya gastos futuros. */
function latestMonth(series: { month: string }[], now: Date): string {
  const current = currentMonthAr(now);
  const last = series[series.length - 1].month;
  return last > current ? last : current;
}

/** Meses de `from` a `to`, ambos incluidos. Nunca menos de uno. */
export function monthsBetween(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number);
  const [toYear, toMonth] = to.split('-').map(Number);
  return Math.max(1, (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1);
}
