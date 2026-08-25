'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAgencyTask,
  deleteAgencyTask,
  fetchAgencyTasks,
  setTaskStatus,
  updateAgencyTask,
  type TaskListFilters,
} from '@/lib/api/agency';
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'tasks'] as const;

export function useAgencyTasks(filters: TaskListFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAgencyTasks(filters),
    select: (response) => response.data ?? { tasks: [], total: 0, page: 1, perPage: 20 },
    retry: false,
  });
}

function useTaskMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      // El progreso del paquete se deriva de las tareas: si no se invalida,
      // la barra queda mintiendo hasta el próximo refetch.
      queryClient.invalidateQueries({ queryKey: ['admin', 'agency', 'packages'] });
    },
  });
}

export function useCreateTask() {
  return useTaskMutation((input: CreateTaskInput) => createAgencyTask(input));
}

export function useUpdateTask() {
  return useTaskMutation(({ id, input }: { id: number; input: UpdateTaskInput }) =>
    updateAgencyTask(id, input)
  );
}

export function useSetTaskStatus() {
  return useTaskMutation(
    ({ id, status, permalink }: { id: number; status: 'PENDING' | 'DONE'; permalink?: string | null }) =>
      setTaskStatus(id, status, permalink)
  );
}

export function useDeleteTask() {
  return useTaskMutation((id: number) => deleteAgencyTask(id));
}
