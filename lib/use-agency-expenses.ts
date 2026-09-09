'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAgencyExpense,
  deleteAgencyExpense,
  fetchAgencyExpenses,
} from '@/lib/api/agency';
import type { CreateExpenseInput } from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'expenses'] as const;

export function useAgencyExpenses(month: string) {
  return useQuery({
    queryKey: [...KEY, month],
    queryFn: () => fetchAgencyExpenses(month),
    select: (response) => response.data ?? null,
    retry: false,
  });
}

/*
 * Se invalida todo el árbol y no sólo el mes tocado: el promedio y el acumulado
 * de cualquier mes cambian con un gasto cargado en otro.
 */
function useExpenseMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateExpense() {
  return useExpenseMutation((input: CreateExpenseInput) => createAgencyExpense(input));
}

export function useDeleteExpense() {
  return useExpenseMutation((id: number) => deleteAgencyExpense(id));
}
