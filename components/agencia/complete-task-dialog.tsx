'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { MUTED_STYLE } from '@/components/agencia/agency-ui';
import { useSetTaskStatus } from '@/lib/use-agency-tasks';
import type { AgencyTask } from '@/lib/types/agency';

interface CompleteTaskDialogProps {
  task: AgencyTask | null;
  onOpenChange: (open: boolean) => void;
}

export function CompleteTaskDialog({ task, onOpenChange }: CompleteTaskDialogProps) {
  const mutation = useSetTaskStatus();
  const [permalink, setPermalink] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = (open: boolean) => {
    if (!open) {
      setPermalink('');
      setError(null);
    }
    onOpenChange(open);
  };

  const confirm = () => {
    if (!task) return;
    const trimmed = permalink.trim();
    // El link es opcional, pero si lo pegan tiene que ser una URL: el reporte
    // cruza la pieza con el catálogo por permalink exacto.
    if (trimmed) {
      try {
        new URL(trimmed);
      } catch {
        setError('Pegá el link completo, con https://');
        return;
      }
    }

    mutation.mutate(
      { id: task.id, status: 'DONE', permalink: trimmed || null },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Tarea completada');
          close(false);
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al completar'),
      }
    );
  };

  return (
    <Dialog open={!!task} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar tarea</DialogTitle>
          <DialogDescription>{task?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="task-permalink">Link de la pieza publicada</Label>
          <Input
            id="task-permalink"
            className={ADMIN_INPUT_CLASS}
            placeholder="https://instagram.com/p/..."
            value={permalink}
            onChange={(event) => {
              setPermalink(event.target.value);
              setError(null);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs" style={MUTED_STYLE}>
            Opcional, pero sin el link el reporte no puede traer las vistas de esta pieza.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => close(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={confirm} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Marcar como hecha'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
