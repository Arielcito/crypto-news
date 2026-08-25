'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { AGENCY_SELECT_CLASS, MUTED_STYLE } from '@/components/agencia/agency-ui';
import { createUserSchema } from '@/lib/validations/admin';
import { ROLE_LABELS } from '@/lib/types/agency';
import type { CreateUserInput } from '@/lib/types/agency';

type UserFormValues = z.input<typeof createUserSchema>;

interface UserFormProps {
  onSubmit: (input: CreateUserInput) => void;
  isPending?: boolean;
}

export function UserForm({ onSubmit, isPending = false }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues, unknown, CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', role: 'EMPLOYEE' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-name">Nombre</Label>
        <Input id="user-name" className={ADMIN_INPUT_CLASS} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input id="user-email" type="email" className={ADMIN_INPUT_CLASS} {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-role">Rol</Label>
        <select id="user-role" className={AGENCY_SELECT_CLASS} {...register('role')}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs" style={MUTED_STYLE}>
          Los empleados sólo ven los clientes donde tienen tareas asignadas.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear usuario'}
      </Button>
    </form>
  );
}
