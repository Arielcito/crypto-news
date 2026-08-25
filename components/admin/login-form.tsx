'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminLogin } from '@/lib/use-admin-auth';
import { loginSchema } from '@/lib/validations/admin';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import type { LoginInput } from '@/lib/types/admin';

export function LoginForm() {
  const router = useRouter();
  const { mutate, isPending } = useAdminLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (input: LoginInput) => {
    mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success(`Hola, ${response.data?.name ?? ''}`.trim());
        if (response.data?.mustChangePassword) {
          router.push('/admin/cambiar-password');
        } else {
          router.push(response.data?.role === 'EMPLOYEE' ? '/admin/agencia/mis-tareas' : '/admin/agencia');
        }
        router.refresh();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" style={{ color: 'hsl(var(--admin-bg-foreground))' }}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className={ADMIN_INPUT_CLASS}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" style={{ color: 'hsl(var(--admin-bg-foreground))' }}>
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className={ADMIN_INPUT_CLASS}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
