'use client';

import { useRef, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { AgencyCard, EmptyState, MUTED_STYLE } from '@/components/agencia/agency-ui';
import { useDeleteBrief, useUploadBrief } from '@/lib/use-agency-clients';
import { briefDownloadUrl } from '@/lib/api/agency';
import { MAX_BRIEF_SIZE } from '@/lib/agency/briefs';
import { formatDateAr } from '@/lib/agency/dates';
import type { AgencyBrief } from '@/lib/types/agency';

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface BriefsCardProps {
  clientId: number;
  briefs: AgencyBrief[];
  canManage: boolean;
}

export function BriefsCard({ clientId, briefs, canManage }: BriefsCardProps) {
  const uploadMutation = useUploadBrief();
  const deleteMutation = useDeleteBrief();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState<AgencyBrief | null>(null);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // El input se limpia siempre: si no, subir el mismo archivo dos veces
    // seguidas no dispara el evento la segunda vez.
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_BRIEF_SIZE) {
      toast.error(`El archivo supera los ${Math.round(MAX_BRIEF_SIZE / (1024 * 1024))} MB`);
      return;
    }

    uploadMutation.mutate(
      { clientId, file },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Brief subido');
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al subir'),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Brief eliminado');
        setDeleting(null);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar'),
    });
  };

  return (
    <AgencyCard
      title="Briefs"
      description="PDFs del cliente. La descarga pide sesión: el link no sirve fuera del panel."
      action={
        canManage ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? 'Subiendo...' : 'Subir PDF'}
            </Button>
          </>
        ) : undefined
      }
    >
      {briefs.length === 0 ? (
        <EmptyState icon={FileText} title="Sin briefs cargados" />
      ) : (
        <ul className="space-y-2">
          {briefs.map((brief) => (
            <li
              key={brief.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0" style={MUTED_STYLE} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{brief.filename}</p>
                  <p className="text-xs" style={MUTED_STYLE}>
                    {formatSize(brief.size)} · {formatDateAr(brief.createdAt)}
                    {brief.uploadedBy ? ` · ${brief.uploadedBy.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={briefDownloadUrl(brief.id)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir ${brief.filename}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(brief)}
                    aria-label={`Eliminar ${brief.filename}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar brief"
        description={`Se borra "${deleting?.filename}" y deja de estar disponible para el equipo.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </AgencyCard>
  );
}
