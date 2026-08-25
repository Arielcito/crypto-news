'use client';

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { CompleteTaskDialog } from '@/components/agencia/complete-task-dialog';
import { TaskCard } from '@/components/agencia/task-items';
import {
  AgencyCard,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
} from '@/components/agencia/agency-ui';
import { useAgencyTasks, useSetTaskStatus } from '@/lib/use-agency-tasks';
import { urgencyOf } from '@/lib/agency/dates';
import type { AgencyTask } from '@/lib/types/agency';

/**
 * Tres cajones ordenados por urgencia. Un empleado que abre esto quiere saber
 * qué se le está quemando, no navegar una tabla con filtros.
 */
const GROUPS = [
  { key: 'overdue', title: 'Vencidas', description: 'Entregar hoy mismo.' },
  { key: 'now', title: 'Para los próximos días', description: 'Vencen dentro de 72 horas.' },
  { key: 'later', title: 'Más adelante', description: 'Todavía hay margen.' },
] as const;

export function MyTasks({ userId }: { userId: number }) {
  const { data, isLoading, isError, error } = useAgencyTasks({
    assigneeId: userId,
    status: 'PENDING',
    perPage: 100,
  });
  const statusMutation = useSetTaskStatus();
  const [completing, setCompleting] = useState<AgencyTask | null>(null);

  const doneQuery = useAgencyTasks({ assigneeId: userId, status: 'DONE', perPage: 5 });

  if (isLoading) return <ListSkeleton rows={4} height="h-24" />;
  if (isError) return <ErrorNote error={error} resource="tus tareas" />;

  const tasks = data?.tasks ?? [];
  const buckets: Record<(typeof GROUPS)[number]['key'], AgencyTask[]> = {
    overdue: [],
    now: [],
    later: [],
  };

  for (const task of tasks) {
    const urgency = urgencyOf(task.dueDate, false);
    if (urgency === 'overdue') buckets.overdue.push(task);
    else if (urgency === 'today' || urgency === 'soon') buckets.now.push(task);
    else buckets.later.push(task);
  }

  const handleReopen = (task: AgencyTask) => {
    statusMutation.mutate(
      { id: task.id, status: 'PENDING' },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Tarea reabierta');
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al reabrir'),
      }
    );
  };

  const recentlyDone = doneQuery.data?.tasks ?? [];

  return (
    <div className="space-y-5">
      {tasks.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="No tenés nada pendiente"
          description="Cuando te asignen una tarea nueva va a aparecer acá."
        />
      ) : (
        GROUPS.map((group) => {
          const groupTasks = buckets[group.key];
          if (groupTasks.length === 0) return null;
          return (
            <AgencyCard
              key={group.key}
              title={`${group.title} (${groupTasks.length})`}
              description={group.description}
            >
              <ul className="space-y-2">
                {groupTasks.map((task) => (
                  <TaskCard key={task.id} task={task} actions={{ onComplete: setCompleting }} />
                ))}
              </ul>
            </AgencyCard>
          );
        })
      )}

      {recentlyDone.length > 0 && (
        <AgencyCard title="Últimas entregadas" description="Por si cargaste el link equivocado.">
          <ul className="space-y-2">
            {recentlyDone.map((task) => (
              <TaskCard key={task.id} task={task} actions={{ onReopen: handleReopen }} />
            ))}
          </ul>
          <p className="mt-3 text-xs" style={MUTED_STYLE}>
            Reabrir una tarea no borra la fecha real de entrega.
          </p>
        </AgencyCard>
      )}

      <CompleteTaskDialog task={completing} onOpenChange={(open) => !open && setCompleting(null)} />
    </div>
  );
}
