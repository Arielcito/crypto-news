'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  ClientAvatar,
  MUTED_STYLE,
  NetworkBadge,
  UrgencyBadge,
} from '@/components/agencia/agency-ui';
import { countdownLabel, formatDateAr, urgencyOf } from '@/lib/agency/dates';
import type { AgencyTask } from '@/lib/types/agency';

export interface TaskActions {
  onComplete?: (task: AgencyTask) => void;
  onReopen?: (task: AgencyTask) => void;
  onEdit?: (task: AgencyTask) => void;
  onDelete?: (task: AgencyTask) => void;
}

/**
 * El countdown se calcula en cada render con la hora del navegador: guardarlo
 * en estado obligaría a un timer que sólo sirve para que un cartel envejezca.
 */
function statusLabel(task: AgencyTask): { urgency: ReturnType<typeof urgencyOf>; label: string } {
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

function TaskButtons({ task, actions }: { task: AgencyTask; actions: TaskActions }) {
  const done = task.status === 'DONE';
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {task.permalink && (
        <Button variant="ghost" size="icon" asChild>
          <a href={task.permalink} target="_blank" rel="noreferrer" aria-label="Ver la pieza publicada">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
      {!done && actions.onComplete && (
        <Button variant="ghost" size="sm" onClick={() => actions.onComplete?.(task)}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Completar
        </Button>
      )}
      {done && actions.onReopen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actions.onReopen?.(task)}
          aria-label="Reabrir tarea"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      {actions.onEdit && (
        <Button variant="ghost" size="icon" onClick={() => actions.onEdit?.(task)} aria-label="Editar tarea">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {actions.onDelete && (
        <Button
          variant="ghost"
          size="icon"
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
        <span>{task.format}</span>
        <span>·</span>
        <span>{formatDateAr(task.dueDate)}</span>
        {task.assignee && (
          <>
            <span>·</span>
            <span>{task.assignee.name}</span>
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
  return (
    <TableRow>
      <TableCell className="max-w-[240px]">
        <p className="truncate font-medium">{task.title}</p>
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
        <div className="flex items-center gap-2">
          <NetworkBadge network={task.network} />
          <span className="text-sm" style={MUTED_STYLE}>
            {task.format}
          </span>
        </div>
      </TableCell>
      <TableCell style={MUTED_STYLE}>{task.assignee?.name ?? 'Sin asignar'}</TableCell>
      <TableCell>
        <UrgencyBadge urgency={status.urgency} label={status.label} />
      </TableCell>
      <TableCell className="text-right">
        <TaskButtons task={task} actions={actions} />
      </TableCell>
    </TableRow>
  );
}
