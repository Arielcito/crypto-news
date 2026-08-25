'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { AGENCY_SELECT_CLASS, MUTED_STYLE } from '@/components/agencia/agency-ui';
import { NETWORK_LABELS } from '@/lib/types/agency';
import { parseDueDate, toDateInput } from '@/lib/agency/dates';
import type { AgencyClientProfile, CreateClientProfileInput } from '@/lib/types/agency';
import type { SocialNetwork } from '@prisma/client';

interface ProfileFormFields {
  postproxyProfileId: string;
  network: SocialNetwork;
  handle: string;
  expiresAt: string;
}

interface ProfileFormProps {
  initialValues?: AgencyClientProfile;
  onSubmit: (input: CreateClientProfileInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function ProfileForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = 'Conectar',
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormFields>({
    defaultValues: {
      postproxyProfileId: initialValues?.postproxyProfileId ?? '',
      network: initialValues?.network ?? 'INSTAGRAM',
      handle: initialValues?.handle ?? '',
      expiresAt: initialValues?.expiresAt ? toDateInput(new Date(initialValues.expiresAt)) : '',
    },
  });

  const submit = handleSubmit((values) =>
    onSubmit({
      postproxyProfileId: values.postproxyProfileId.trim(),
      network: values.network,
      handle: values.handle.trim() || null,
      // El token de Meta vence al final del día que dice el panel de PostProxy,
      // no a la medianoche UTC: se guarda con el cierre del día argentino.
      expiresAt: values.expiresAt ? parseDueDate(values.expiresAt).toISOString() : null,
    })
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-network">Red</Label>
        <select id="profile-network" className={AGENCY_SELECT_CLASS} {...register('network')}>
          {Object.entries(NETWORK_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-id">ID de perfil en PostProxy</Label>
        <Input
          id="profile-id"
          className={ADMIN_INPUT_CLASS}
          placeholder="prof_..."
          {...register('postproxyProfileId', { required: 'El ID de perfil es obligatorio' })}
        />
        {errors.postproxyProfileId && (
          <p className="text-sm text-destructive">{errors.postproxyProfileId.message}</p>
        )}
        <p className="text-xs" style={MUTED_STYLE}>
          Se copia del panel de PostProxy, en la cuenta conectada del cliente.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-handle">Usuario</Label>
        <Input id="profile-handle" className={ADMIN_INPUT_CLASS} placeholder="@cliente" {...register('handle')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-expires">Vence el token</Label>
        <Input id="profile-expires" type="date" className={ADMIN_INPUT_CLASS} {...register('expiresAt')} />
        <p className="text-xs" style={MUTED_STYLE}>
          Opcional. Sirve para avisar antes de que la cuenta deje de reportar datos.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
