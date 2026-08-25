'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MUTED_STYLE } from '@/components/agencia/agency-ui';

/**
 * La contraseña temporal se muestra UNA vez: el servidor guarda sólo el hash y
 * no hay forma de volver a leerla. Si se pierde, se regenera.
 */
export function TemporaryPasswordDialog({
  credentials,
  onOpenChange,
}: {
  credentials: { email: string; password: string } | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!credentials) return;
    await navigator.clipboard.writeText(credentials.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={!!credentials}
      onOpenChange={(open) => {
        if (!open) setCopied(false);
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" style={{ color: 'hsl(var(--admin-accent))' }} />
            Contraseña temporal
          </DialogTitle>
          <DialogDescription>
            Pasásela a {credentials?.email}. Se la va a pedir cambiar en el primer ingreso.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
        >
          <code className="break-all font-mono text-sm">{credentials?.password}</code>
          <Button variant="ghost" size="icon" onClick={copy} aria-label="Copiar contraseña">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <p className="text-xs" style={MUTED_STYLE}>
          Cerrá este cartel recién cuando la tengas copiada: no se puede volver a ver.
        </p>

        <Button onClick={() => onOpenChange(false)}>Listo, la copié</Button>
      </DialogContent>
    </Dialog>
  );
}
