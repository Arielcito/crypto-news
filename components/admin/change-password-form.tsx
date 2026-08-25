'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { changePasswordSchema } from '@/lib/validations/admin';
import { useChangePassword, useCurrentUser } from '@/lib/use-admin-auth';
import type { ChangePasswordInput } from '@/lib/types/agency';

export function ChangePasswordForm() {
  const router = useRouter();
  const { mutate, isPending } = useChangePassword();
  const { data: me } = useCurrentUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (input: ChangePasswordInput) => {
    mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        // Cambiar la contraseña invalida la sesión del lado del servidor: se
        // vuelve al login para entrar con la nueva.
        toast.success('Contraseña actualizada. Entrá de nuevo.');
        router.push('/admin/login');
        router.refresh();
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al cambiar'),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Contraseña actual</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          className={ADMIN_INPUT_CLASS}
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Contraseña nueva</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className={ADMIN_INPUT_CLASS}
          {...register('newPassword')}
        />
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Repetir contraseña nueva</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className={ADMIN_INPUT_CLASS}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Cambiar contraseña'}
      </Button>

      {me?.data?.mustChangePassword === false && (
        <Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>
          Volver
        </Button>
      )}
    </form>
  );
}
