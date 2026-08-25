'use client';

import { useState } from 'react';
import { KeyRound, Plus, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { UserForm } from '@/components/agencia/user-form';
import { TemporaryPasswordDialog } from '@/components/agencia/temporary-password-dialog';
import {
  ADMIN_SURFACE_STYLE,
  AGENCY_SELECT_CLASS,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
} from '@/components/agencia/agency-ui';
import {
  useAgencyUsers,
  useCreateAgencyUser,
  useResetUserPassword,
  useUpdateAgencyUser,
} from '@/lib/use-agency-users';
import { ROLE_LABELS } from '@/lib/types/agency';
import type { AgencyUser, CreateUserInput } from '@/lib/types/agency';
import type { Role } from '@prisma/client';

export function TeamList({ currentUserId }: { currentUserId: number }) {
  const { data: users = [], isLoading, isError, error } = useAgencyUsers();
  const createMutation = useCreateAgencyUser();
  const updateMutation = useUpdateAgencyUser();
  const resetMutation = useResetUserPassword();

  const [createOpen, setCreateOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [deactivating, setDeactivating] = useState<AgencyUser | null>(null);

  const handleCreate = (input: CreateUserInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'No se pudo crear');
          return;
        }
        setCreateOpen(false);
        setCredentials({ email: response.data.email, password: response.data.temporaryPassword });
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al crear'),
    });
  };

  const handleRole = (user: AgencyUser, role: Role) => {
    updateMutation.mutate(
      { id: user.id, input: { role } },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success(`${user.name} ahora es ${ROLE_LABELS[role]}`);
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al actualizar'),
      }
    );
  };

  const handleReset = (user: AgencyUser) => {
    resetMutation.mutate(user.id, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'No se pudo regenerar');
          return;
        }
        setCredentials({ email: user.email, password: response.data.temporaryPassword });
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al regenerar'),
    });
  };

  const handleDeactivate = () => {
    if (!deactivating) return;
    updateMutation.mutate(
      { id: deactivating.id, input: { isActive: false } },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Usuario desactivado. Su sesión quedó cerrada.');
          setDeactivating(null);
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al desactivar'),
      }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} height="h-14" />
      ) : isError ? (
        <ErrorNote error={error} resource="el equipo" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No hay usuarios" />
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={ADMIN_SURFACE_STYLE}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs" style={MUTED_STYLE}>
                          (vos)
                        </span>
                      )}
                      {user.mustChangePassword && (
                        <p className="text-xs" style={{ color: 'hsl(var(--admin-warning))' }}>
                          Contraseña temporal sin cambiar
                        </p>
                      )}
                    </TableCell>
                    <TableCell style={MUTED_STYLE}>{user.email}</TableCell>
                    <TableCell>
                      <select
                        className={`${AGENCY_SELECT_CLASS} h-9 w-32`}
                        value={user.role}
                        disabled={isSelf || updateMutation.isPending}
                        onChange={(event) => handleRole(user, event.target.value as Role)}
                        aria-label={`Rol de ${user.name}`}
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReset(user)}
                          disabled={resetMutation.isPending}
                          aria-label={`Regenerar contraseña de ${user.name}`}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeactivating(user)}
                          disabled={isSelf}
                          aria-label={`Desactivar a ${user.name}`}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs" style={MUTED_STYLE}>
        Un admin no puede bajarse de rango ni desactivarse a sí mismo: sería quedarse afuera del panel.
      </p>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleCreate} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <TemporaryPasswordDialog
        credentials={credentials}
        onOpenChange={(open) => !open && setCredentials(null)}
      />

      <DeleteConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Desactivar usuario"
        description={`${deactivating?.name} deja de poder entrar y se le cierra la sesión abierta. Sus tareas quedan como están.`}
        onConfirm={handleDeactivate}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
