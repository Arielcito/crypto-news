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
import { useDeleteTaskEvidence, useSetTaskStatus, useUploadTaskEvidence } from '@/lib/use-agency-tasks';
import { MAX_EVIDENCE_SIZE } from '@/lib/agency/tasks';
import type { AgencyTask } from '@/lib/types/agency';

interface CompleteTaskDialogProps {
  task: AgencyTask | null;
  onOpenChange: (open: boolean) => void;
}

export function CompleteTaskDialog({ task, onOpenChange }: CompleteTaskDialogProps) {
  const mutation = useSetTaskStatus();
  const upload = useUploadTaskEvidence();
  const removeEvidence = useDeleteTaskEvidence();
  const [permalink, setPermalink] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = mutation.isPending || upload.isPending || removeEvidence.isPending;

  const close = (open: boolean) => {
    if (!open) {
      setPermalink('');
      setEvidence(null);
      setError(null);
    }
    onOpenChange(open);
  };

  const confirm = async () => {
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

    // La captura va antes que el estado: si falla, la tarea no queda hecha sin prueba.
    if (evidence) {
      try {
        const response = await upload.mutateAsync({ id: task.id, file: evidence });
        if (response.error) {
          setError(response.message || response.error);
          return;
        }
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la captura');
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

        <div className="space-y-2">
          <Label htmlFor="task-evidence">Captura</Label>
          {task?.evidenceUrl && !evidence && (
            <p className="flex items-center gap-2 text-sm">
              <a href={task.evidenceUrl} target="_blank" rel="noreferrer" className="underline">
                Ver la captura actual
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() =>
                  removeEvidence.mutate(task.id, {
                    onSuccess: (response) => {
                      if (response.error) toast.error(response.message || response.error);
                    },
                    onError: () => toast.error('No se pudo quitar la captura'),
                  })
                }
              >
                Quitar
              </Button>
            </p>
          )}
          <Input
            id="task-evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={ADMIN_INPUT_CLASS}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setError(null);
              if (file && file.size > MAX_EVIDENCE_SIZE) {
                setError('La captura pesa más de 4 MB');
                event.target.value = '';
                setEvidence(null);
                return;
              }
              setEvidence(file);
            }}
          />
          <p className="text-xs" style={MUTED_STYLE}>
            Para historias: a las 24 horas desaparecen y el link deja de servir como prueba.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => close(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={confirm} disabled={busy}>
            {upload.isPending ? 'Subiendo captura...' : busy ? 'Guardando...' : 'Marcar como hecha'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
