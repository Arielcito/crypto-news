'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { AGENCY_SELECT_CLASS, MUTED_STYLE } from '@/components/agencia/agency-ui';
import { useAgencyClients } from '@/lib/use-agency-clients';
import { useAgencyPackages } from '@/lib/use-agency-packages';
import { useAgencyUserOptions } from '@/lib/use-agency-users';
import { NETWORK_LABELS, OUTLET_LABELS } from '@/lib/types/agency';
import { formatMonthLabel, toDateInput } from '@/lib/agency/dates';
import type { AgencyTask, CreateTaskInput } from '@/lib/types/agency';
import type { Outlet, SocialNetwork } from '@prisma/client';

/** Sugerencias, no una lista cerrada: cada red inventa formatos nuevos seguido. */
const FORMAT_SUGGESTIONS = [
  'Reel',
  'Carrusel',
  'Historia',
  'Post',
  'Video',
  'Short',
  'Tweet',
  'Hilo',
  'Vivo',
  'Nota web',
  'Nota de prensa',
  'Mención',
];

interface TaskFormFields {
  clientId: string;
  packageId: string;
  title: string;
  network: SocialNetwork;
  outlet: Outlet | '';
  format: string;
  dueDate: string;
  assigneeId: string;
  coAssigneeId: string;
  approved: boolean;
  notes: string;
}

interface TaskFormProps {
  /** Cuando se crea desde un paquete concreto no se elige cliente ni paquete. */
  initialPackageId?: number;
  initialClientId?: number;
  initialValues?: AgencyTask;
  onSubmit: (input: CreateTaskInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function TaskForm({
  initialPackageId,
  initialClientId,
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Crear tarea',
}: TaskFormProps) {
  const { data: clients = [] } = useAgencyClients();
  const { data: users = [] } = useAgencyUserOptions();

  const [clientId, setClientId] = useState<string>(
    String(initialValues?.package.clientId ?? initialClientId ?? '')
  );
  const { data: packages = [] } = useAgencyPackages(clientId ? Number(clientId) : undefined);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormFields>({
    defaultValues: {
      clientId,
      packageId: String(initialValues?.packageId ?? initialPackageId ?? ''),
      title: initialValues?.title ?? '',
      network: initialValues?.network ?? 'INSTAGRAM',
      outlet: initialValues?.outlet ?? '',
      format: initialValues?.format ?? 'Reel',
      dueDate: initialValues ? toDateInput(new Date(initialValues.dueDate)) : toDateInput(new Date()),
      assigneeId: initialValues?.assigneeId ? String(initialValues.assigneeId) : '',
      coAssigneeId: initialValues?.coAssigneeId ? String(initialValues.coAssigneeId) : '',
      approved: !!initialValues?.approvedAt,
      notes: initialValues?.notes ?? '',
    },
  });

  const lockedPackage = !!initialPackageId || !!initialValues;
  const approved = watch('approved');
  // Sólo se pregunta por la aprobación a los clientes que la exigen por contrato.
  const needsApproval =
    initialValues?.package.client.requiresApproval ??
    clients.find((client) => String(client.id) === clientId)?.requiresApproval ??
    false;

  const submit = handleSubmit((values) =>
    onSubmit({
      packageId: Number(values.packageId),
      title: values.title.trim(),
      network: values.network,
      outlet: values.outlet || null,
      format: values.format.trim(),
      dueDate: values.dueDate,
      assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
      coAssigneeId: values.coAssigneeId ? Number(values.coAssigneeId) : null,
      ...(needsApproval ? { approved: values.approved } : {}),
      notes: values.notes.trim() || null,
    })
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {!lockedPackage && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-client">Cliente</Label>
            <select
              id="task-client"
              className={AGENCY_SELECT_CLASS}
              {...register('clientId', {
                required: 'Elegí el cliente',
                onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
                  setClientId(event.target.value),
              })}
            >
              <option value="">Elegí un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-package">Paquete</Label>
            <select
              id="task-package"
              className={AGENCY_SELECT_CLASS}
              disabled={!clientId}
              {...register('packageId', { required: 'Elegí el paquete' })}
            >
              <option value="">{clientId ? 'Elegí un paquete' : 'Elegí un cliente primero'}</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {formatMonthLabel(pkg.month)} · {pkg.progress.done}/{pkg.progress.committed}
                </option>
              ))}
            </select>
            {errors.packageId && <p className="text-sm text-destructive">{errors.packageId.message}</p>}
            {clientId && packages.length === 0 && (
              <p className="text-xs" style={{ color: 'hsl(var(--admin-warning))' }}>
                Este cliente todavía no tiene paquetes. Creá uno desde su ficha.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="task-title">Título</Label>
        <Input
          id="task-title"
          className={ADMIN_INPUT_CLASS}
          placeholder="Reel de lanzamiento"
          {...register('title', { required: 'El título es obligatorio' })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-network">Red</Label>
          <select id="task-network" className={AGENCY_SELECT_CLASS} {...register('network')}>
            {Object.entries(NETWORK_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-format">Formato</Label>
          <Input
            id="task-format"
            list="task-format-options"
            className={ADMIN_INPUT_CLASS}
            {...register('format', { required: 'El formato es obligatorio' })}
          />
          <datalist id="task-format-options">
            {FORMAT_SUGGESTIONS.map((format) => (
              <option key={format} value={format} />
            ))}
          </datalist>
          {errors.format && <p className="text-sm text-destructive">{errors.format.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-outlet">Sale en</Label>
          <select id="task-outlet" className={AGENCY_SELECT_CLASS} {...register('outlet')}>
            <option value="">Sin definir</option>
            {Object.entries(OUTLET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-due">Vence</Label>
          <Input
            id="task-due"
            type="date"
            className={ADMIN_INPUT_CLASS}
            {...register('dueDate', { required: 'Poné una fecha de entrega' })}
          />
          {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          <p className="text-xs" style={MUTED_STYLE}>
            Vence al final de ese día, hora argentina.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-assignee">Responsable</Label>
          <select id="task-assignee" className={AGENCY_SELECT_CLASS} {...register('assigneeId')}>
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-co-assignee">Segundo responsable</Label>
          <select id="task-co-assignee" className={AGENCY_SELECT_CLASS} {...register('coAssigneeId')}>
            <option value="">Ninguno</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {needsApproval && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="task-approved"
            className="mt-0.5"
            checked={approved}
            onCheckedChange={(checked) => setValue('approved', checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor="task-approved" className="cursor-pointer">
              El cliente aprobó la pieza
            </Label>
            <p className="text-xs" style={MUTED_STYLE}>
              Este cliente aprueba cada pieza por escrito antes de publicarla.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="task-notes">Notas</Label>
        <Textarea id="task-notes" rows={3} className={ADMIN_INPUT_CLASS} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
