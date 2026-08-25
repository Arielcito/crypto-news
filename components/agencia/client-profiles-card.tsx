'use client';

import { useState } from 'react';
import { AlertTriangle, Link2, Plus, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { ProfileForm } from '@/components/agencia/profile-form';
import { AgencyCard, EmptyState, MUTED_STYLE, NetworkBadge } from '@/components/agencia/agency-ui';
import { useCreateClientProfile, useDisconnectClientProfile } from '@/lib/use-agency-clients';
import { formatDateAr } from '@/lib/agency/dates';
import type { AgencyClientProfile, CreateClientProfileInput } from '@/lib/types/agency';

/** Se avisa con dos semanas: renovar un token de Meta no es instantáneo. */
const EXPIRY_WARNING_DAYS = 14;

function expiresSoon(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff < EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;
}

interface ClientProfilesCardProps {
  clientId: number;
  profiles: AgencyClientProfile[];
  canManage: boolean;
}

export function ClientProfilesCard({ clientId, profiles, canManage }: ClientProfilesCardProps) {
  const createMutation = useCreateClientProfile();
  const disconnectMutation = useDisconnectClientProfile();
  const [createOpen, setCreateOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState<AgencyClientProfile | null>(null);

  const handleCreate = (input: CreateClientProfileInput) => {
    createMutation.mutate(
      { clientId, input },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Cuenta conectada');
          setCreateOpen(false);
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Error al conectar la cuenta'),
      }
    );
  };

  const handleDisconnect = () => {
    if (!disconnecting) return;
    disconnectMutation.mutate(disconnecting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Cuenta desconectada. Las métricas históricas se mantienen.');
        setDisconnecting(null);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al desconectar'),
    });
  };

  return (
    <AgencyCard
      title="Cuentas conectadas"
      description="De acá salen los seguidores y el rendimiento de las piezas."
      action={
        canManage ? (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Conectar cuenta
          </Button>
        ) : undefined
      }
    >
      {profiles.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Sin cuentas conectadas"
          description="Mientras no haya cuentas, el área de orgánico de este cliente va a estar vacía."
        />
      ) : (
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <NetworkBadge network={profile.network} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{profile.handle ?? 'Sin usuario'}</p>
                  <p className="truncate font-mono text-xs" style={MUTED_STYLE}>
                    {profile.postproxyProfileId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {profile.expiresAt && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{
                      color: expiresSoon(profile.expiresAt)
                        ? 'hsl(var(--admin-danger))'
                        : 'hsl(var(--admin-muted-foreground))',
                    }}
                  >
                    {expiresSoon(profile.expiresAt) && <AlertTriangle className="h-3.5 w-3.5" />}
                    Vence {formatDateAr(profile.expiresAt)}
                  </span>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDisconnecting(profile)}
                    aria-label={`Desconectar ${profile.handle ?? profile.postproxyProfileId}`}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar cuenta</DialogTitle>
          </DialogHeader>
          <ProfileForm onSubmit={handleCreate} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!disconnecting}
        onOpenChange={(open) => !open && setDisconnecting(null)}
        title="Desconectar cuenta"
        description="Deja de sincronizarse desde ahora. Las lecturas ya guardadas se conservan para los reportes viejos."
        onConfirm={handleDisconnect}
        isPending={disconnectMutation.isPending}
      />
    </AgencyCard>
  );
}
