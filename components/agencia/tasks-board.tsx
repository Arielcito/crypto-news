'use client';

import { useState } from 'react';
import { CalendarDays, List, ListChecks, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { TaskForm } from '@/components/agencia/task-form';
import { CompleteTaskDialog } from '@/components/agencia/complete-task-dialog';
import { TaskCard, TaskRow } from '@/components/agencia/task-items';
import { TaskCalendar } from '@/components/agencia/task-calendar';
import {
  ADMIN_SURFACE_STYLE,
  AGENCY_SELECT_CLASS,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
} from '@/components/agencia/agency-ui';
import {
  useAgencyTasks,
  useCreateTask,
  useDeleteTask,
  useSetTaskEdited,
  useSetTaskStatus,
  useUpdateTask,
} from '@/lib/use-agency-tasks';
import { useAgencyClients } from '@/lib/use-agency-clients';
import { useAgencyUsers } from '@/lib/use-agency-users';
import { NETWORK_LABELS } from '@/lib/types/agency';
import { calendarDays, currentMonthAr, parseMonth } from '@/lib/agency/dates';
import { taskStatusEnum } from '@/lib/validations/admin';
import type { AgencyTask, CreateTaskInput } from '@/lib/types/agency';
import type { TaskStatus } from '@prisma/client';
import type { TaskListFilters } from '@/lib/api/agency';

const PER_PAGE = 20;
/** ponytail: tope del mes en calendario; hoy un mes lleno ronda las 150 tareas. Paginar si pasa 500. */
const CALENDAR_LIMIT = 500;

export function TasksBoard({
  canManage,
  initialPackageId,
}: {
  canManage: boolean;
  initialPackageId?: number;
}) {
  const [filters, setFilters] = useState<TaskListFilters>({
    packageId: initialPackageId,
    status: 'PENDING',
    page: 1,
    perPage: PER_PAGE,
  });

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [month, setMonth] = useState(() => parseMonth(currentMonthAr()));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const range = calendarDays(month);

  // El calendario trae el mes visible entero (con los días de relleno) en una sola página.
  const { data, isLoading, isError, error } = useAgencyTasks(
    view === 'calendar'
      ? { ...filters, page: 1, perPage: CALENDAR_LIMIT, from: range.from, to: range.to }
      : filters
  );
  const { data: clients = [] } = useAgencyClients();
  const { data: users = [] } = useAgencyUsers();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const statusMutation = useSetTaskStatus();
  const editedMutation = useSetTaskEdited();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AgencyTask | null>(null);
  const [deleting, setDeleting] = useState<AgencyTask | null>(null);
  const [completing, setCompleting] = useState<AgencyTask | null>(null);

  const tasks = data?.tasks ?? [];
  const selected = tasks.find((task) => task.id === selectedId) ?? null;
  const total = data?.total ?? 0;
  const page = filters.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  /** Cambiar cualquier filtro vuelve a la página 1: si no, la lista queda vacía. */
  const patchFilters = (patch: Partial<TaskListFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));

  const handleCreate = (input: CreateTaskInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Tarea creada');
        setCreateOpen(false);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al crear'),
    });
  };

  const handleUpdate = (input: CreateTaskInput) => {
    if (!editing) return;
    // El paquete no se edita desde acá: mover una tarea de mes cambiaría el
    // avance de dos paquetes a la vez sin que se vea.
    const { packageId: _packageId, ...rest } = input;
    updateMutation.mutate(
      { id: editing.id, input: rest },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Tarea actualizada');
          setEditing(null);
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al actualizar'),
      }
    );
  };

  // El mensaje de éxito lo arma el server según el estado nuevo.
  const changeStatus = (task: AgencyTask, status: TaskStatus) => {
    statusMutation.mutate(
      { id: task.id, status },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success(response.message || 'Tarea actualizada');
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al actualizar'),
      }
    );
  };

  const toggleEdited = (task: AgencyTask) => {
    editedMutation.mutate(
      { id: task.id, edited: !task.editedAt },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success(response.message || 'Tarea actualizada');
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al actualizar'),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Tarea eliminada');
        setDeleting(null);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al eliminar'),
    });
  };

  const actions = {
    onComplete: setCompleting,
    onReopen: (task: AgencyTask) => changeStatus(task, 'PENDING'),
    onToggleEdited: toggleEdited,
    onCancel: canManage ? (task: AgencyTask) => changeStatus(task, 'CANCELLED') : undefined,
    onEdit: canManage ? setEditing : undefined,
    onDelete: canManage ? setDeleting : undefined,
  };

  /** Desde el detalle del calendario: el diálogo de la acción reemplaza al del detalle. */
  const closeThen = <T,>(fn?: (task: T) => void) =>
    fn
      ? (task: T) => {
          setSelectedId(null);
          fn(task);
        }
      : undefined;
  const detailActions = {
    ...actions,
    onComplete: closeThen(actions.onComplete) ?? actions.onComplete,
    onEdit: closeThen(actions.onEdit),
    onDelete: closeThen(actions.onDelete),
  };

  const switchView = (next: 'list' | 'calendar') => {
    setView(next);
    // En calendario se ven todas: una publicada en el día 3 también cuenta para el mes.
    if (next === 'calendar') patchFilters({ status: undefined });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className={AGENCY_SELECT_CLASS}
            value={filters.status ?? ''}
            onChange={(event) =>
              patchFilters({ status: taskStatusEnum.optional().catch(undefined).parse(event.target.value || undefined) })
            }
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="DONE">Publicadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>

          <select
            className={AGENCY_SELECT_CLASS}
            value={filters.clientId ?? ''}
            onChange={(event) =>
              patchFilters({ clientId: event.target.value ? Number(event.target.value) : undefined })
            }
            aria-label="Filtrar por cliente"
          >
            <option value="">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          {canManage && (
            <select
              className={AGENCY_SELECT_CLASS}
              value={filters.assigneeId ?? ''}
              onChange={(event) =>
                patchFilters({ assigneeId: event.target.value ? Number(event.target.value) : undefined })
              }
              aria-label="Filtrar por responsable"
            >
              <option value="">Todo el equipo</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          <select
            className={AGENCY_SELECT_CLASS}
            value={filters.network ?? ''}
            onChange={(event) => patchFilters({ network: event.target.value || undefined })}
            aria-label="Filtrar por red"
          >
            <option value="">Todas las redes</option>
            {Object.entries(NETWORK_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex shrink-0 gap-2">
          <div className="flex rounded-md border p-0.5" role="group" aria-label="Vista">
            {([
              ['list', 'Lista', List],
              ['calendar', 'Calendario', CalendarDays],
            ] as const).map(([value, label, Icon]) => (
              <Button
                key={value}
                variant={view === value ? 'secondary' : 'ghost'}
                size="sm"
                aria-pressed={view === value}
                onClick={() => switchView(value)}
              >
                <Icon className="mr-1.5 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
          {canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </Button>
          )}
        </div>
      </div>

      {filters.packageId && (
        <p className="text-sm" style={MUTED_STYLE}>
          Mostrando sólo las tareas de un paquete.{' '}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => patchFilters({ packageId: undefined })}
          >
            Ver todas
          </button>
        </p>
      )}

      {isLoading ? (
        <ListSkeleton rows={4} height="h-14" />
      ) : isError ? (
        <ErrorNote error={error} resource="las tareas" />
      ) : view === 'calendar' ? (
        <TaskCalendar
          tasks={tasks}
          month={month}
          onMonthChange={setMonth}
          onSelect={(task) => setSelectedId(task.id)}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No hay tareas con estos filtros"
          description="Probá cambiando el estado o el cliente."
        />
      ) : (
        <>
          {/* Mobile: tarjetas. Una tabla de 6 columnas en 360 px no se lee. */}
          <ul className="space-y-2 md:hidden">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} actions={actions} />
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border md:block" style={ADMIN_SURFACE_STYLE}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Red / formato</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} actions={actions} />
                ))}
              </TableBody>
            </Table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={MUTED_STYLE}>
                Página {page} de {pages} · {total} tareas
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setFilters((current) => ({ ...current, page: page - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setFilters((current) => ({ ...current, page: page + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialPackageId={filters.packageId}
            initialClientId={filters.clientId}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
          </DialogHeader>
          {editing && (
            <TaskForm
              initialValues={editing}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tarea</DialogTitle>
          </DialogHeader>
          {selected && (
            <ul>
              <TaskCard task={selected} actions={detailActions} />
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <CompleteTaskDialog task={completing} onOpenChange={(open) => !open && setCompleting(null)} />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar tarea"
        description={`Se borra "${deleting?.title}" del paquete. Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
