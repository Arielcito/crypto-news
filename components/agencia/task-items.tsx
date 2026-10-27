'use client';

import Link from 'next/link';
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Pencil,
  RotateCcw,
  Scissors,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  ClientAvatar,
  MUTED_STYLE,
  NetworkBadge,
  UrgencyBadge,
} from '@/components/agencia/agency-ui';
import { countdownLabel, formatDateAr, urgencyOf } from '@/lib/agency/dates';
import { OUTLET_LABELS, SPONSORSHIP_LABELS } from '@/lib/types/agency';
import type { AgencyTask } from '@/lib/types/agency';

export interface TaskActions {
  onComplete?: (task: AgencyTask) => void;
  onReopen?: (task: AgencyTask) => void;
  /** El editor avisa que terminó la pieza; sigue pendiente hasta publicarse. */
  onToggleEdited?: (task: AgencyTask) => void;
  /** Sólo el admin: cancelar cambia lo que se le debe al cliente. */
  onCancel?: (task: AgencyTask) => void;
  onEdit?: (task: AgencyTask) => void;
  onDelete?: (task: AgencyTask) => void;
}

/**
 * El countdown se calcula en cada render con la hora del navegador: guardarlo
 * en estado obligaría a un timer que sólo sirve para que un cartel envejezca.
 */
function statusLabel(task: AgencyTask): { urgency: ReturnType<typeof urgencyOf>; label: string } {
  if (task.status === 'CANCELLED') return { urgency: 'later', label: 'Cancelada' };
  const done = task.status === 'DONE';
  const urgency = urgencyOf(task.dueDate, done);
  if (done) {
    return {
      urgency,
      label: task.completedAt ? `Hecha ${formatDateAr(task.completedAt)}` : 'Hecha',
    };
  }
  return { urgency, label: countdownLabel(task.dueDate) };
}

/** Quién la hace: los dos responsables, o nada si no hay ninguno. */
function peopleOf(task: AgencyTask): string | null {
  return [task.assignee?.name, task.coAssignee?.name].filter(Boolean).join(' y ') || null;
}

/** Cliente que aprueba por escrito y esta pieza todavía no tiene el OK. */
function awaitingApproval(task: AgencyTask): boolean {
  return task.package.client.requiresApproval && !task.approvedAt && task.status !== 'CANCELLED';
}

/** Editada pero sin publicar: una vez hecha o cancelada deja de importar. */
function editedPending(task: AgencyTask): boolean {
  return task.status === 'PENDING' && !!task.editedAt;
}

/** "Reel · Bitcoin Argentina · Publicitario": lo que no está cargado no aparece. */
function formatLine(task: AgencyTask): string {
  return [
    task.format,
    task.outlet && OUTLET_LABELS[task.outlet],
    task.sponsorship && SPONSORSHIP_LABELS[task.sponsorship],
  ]
    .filter(Boolean)
    .join(' · ');
}

function ApprovalNote() {
  return (
    <span className="font-medium" style={{ color: 'hsl(var(--admin-warning))' }}>
      Falta aprobación
    </span>
  );
}

function TaskButtons({
  task,
  actions,
  compact = false,
}: {
  task: AgencyTask;
  actions: TaskActions;
  /** En la tabla todo va en una línea: "Completar" queda sólo con el ícono. */
  compact?: boolean;
}) {
  const pending = task.status === 'PENDING';
  const cancelled = task.status === 'CANCELLED';
  // Reabrir una cancelada es del admin, igual que cancelarla.
  const canReopen = cancelled ? !!actions.onCancel : task.status === 'DONE';
  // En la tabla entran cinco íconos sin desbordar la fila.
  const iconClass = compact ? 'h-8 w-8' : undefined;
  return (
    <div className={`flex items-center justify-end gap-1 ${compact ? 'flex-nowrap' : 'flex-wrap'}`}>
      {task.permalink && (
        <Button variant="ghost" size="icon" className={iconClass} asChild>
          <a href={task.permalink} target="_blank" rel="noreferrer" aria-label="Ver la pieza publicada">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
      {task.evidenceUrl && (
        <Button variant="ghost" size="icon" className={iconClass} asChild>
          <a href={task.evidenceUrl} target="_blank" rel="noreferrer" aria-label="Ver la captura">
            <ImageIcon className="h-4 w-4" />
          </a>
        </Button>
      )}
      {pending && actions.onComplete && (compact ? (
        <Button
          variant="ghost"
          size="icon"
          className={iconClass}
          onClick={() => actions.onComplete?.(task)}
          aria-label="Completar tarea"
          title="Completar"
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => actions.onComplete?.(task)}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Completar
        </Button>
      ))}
      {pending && actions.onToggleEdited && (
        <Button
          variant={task.editedAt ? 'secondary' : 'ghost'}
          size="icon"
          className={iconClass}
          onClick={() => actions.onToggleEdited?.(task)}
          aria-label="Editada"
          aria-pressed={!!task.editedAt}
          title={task.editedAt ? 'Desmarcar edición' : 'Marcar como editada'}
        >
          <Scissors className="h-4 w-4" />
        </Button>
      )}
      {pending && actions.onCancel && (
        <Button
          variant="ghost"
          size="icon"
          className={iconClass}
          onClick={() => actions.onCancel?.(task)}
          aria-label="Cancelar tarea"
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}
      {canReopen && actions.onReopen && (
        <Button
          variant="ghost"
          size="icon"
          className={iconClass}
          onClick={() => actions.onReopen?.(task)}
          aria-label="Reabrir tarea"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      {actions.onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className={iconClass}
          onClick={() => actions.onEdit?.(task)}
          aria-label="Editar tarea"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {actions.onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={iconClass}
          onClick={() => actions.onDelete?.(task)}
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function TaskCard({ task, actions }: { task: AgencyTask; actions: TaskActions }) {
  const status = statusLabel(task);
  const people = peopleOf(task);
  return (
    <li
      className="rounded-lg border p-3"
      style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <ClientAvatar
            name={task.package.client.name}
            seed={task.package.client.slug}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{task.title}</p>
            <Link
              href={`/admin/agencia/clientes/${task.package.clientId}`}
              className="text-xs hover:underline"
              style={MUTED_STYLE}
            >
              {task.package.client.name}
            </Link>
          </div>
        </div>
        <UrgencyBadge urgency={status.urgency} label={status.label} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={MUTED_STYLE}>
        <NetworkBadge network={task.network} />
        <span>{formatLine(task)}</span>
        <span>·</span>
        <span>{formatDateAr(task.dueDate)}</span>
        {people && (
          <>
            <span>·</span>
            <span>{people}</span>
          </>
        )}
        {awaitingApproval(task) && (
          <>
            <span>·</span>
            <ApprovalNote />
          </>
        )}
        {editedPending(task) && (
          <>
            <span>·</span>
            <span className="font-medium">Editada</span>
          </>
        )}
      </div>

      {task.notes && (
        <p className="mt-2 whitespace-pre-line text-xs" style={MUTED_STYLE}>
          {task.notes}
        </p>
      )}

      <div className="mt-2">
        <TaskButtons task={task} actions={actions} />
      </div>
    </li>
  );
}

export function TaskRow({ task, actions }: { task: AgencyTask; actions: TaskActions }) {
  const status = statusLabel(task);
  const people = peopleOf(task);
  return (
    <TableRow>
      <TableCell className="max-w-[200px]">
        <p className="truncate font-medium">{task.title}</p>
        {awaitingApproval(task) && (
          <p className="text-xs">
            <ApprovalNote />
          </p>
        )}
        {editedPending(task) && (
          <p className="text-xs font-medium" style={MUTED_STYLE}>
            Editada, falta publicar
          </p>
        )}
        {task.notes && (
          <p className="truncate text-xs" style={MUTED_STYLE}>
            {task.notes}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Link
          href={`/admin/agencia/clientes/${task.package.clientId}`}
          className="flex items-center gap-2 text-sm hover:underline"
        >
          <ClientAvatar
            name={task.package.client.name}
            seed={task.package.client.slug}
            size="sm"
          />
          <span className="truncate">{task.package.client.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1">
          <NetworkBadge network={task.network} />
          <span className="text-xs" style={MUTED_STYLE}>
            {formatLine(task)}
          </span>
        </div>
      </TableCell>
      <TableCell style={MUTED_STYLE}>{people ?? 'Sin asignar'}</TableCell>
      <TableCell>
        <UrgencyBadge urgency={status.urgency} label={status.label} />
      </TableCell>
      <TableCell className="text-right">
        <TaskButtons task={task} actions={actions} compact />
      </TableCell>
    </TableRow>
  );
}
