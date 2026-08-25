/** Campos de un brief que sí pueden viajar al navegador: `blobUrl` no está. */
export const BRIEF_PUBLIC_SELECT = {
  id: true,
  clientId: true,
  filename: true,
  size: true,
  contentType: true,
  createdAt: true,
  uploadedBy: { select: { id: true, name: true } },
} as const;

export const MAX_BRIEF_SIZE = 10 * 1024 * 1024;

/** Los primeros bytes de todo PDF. */
const PDF_MAGIC = '%PDF-';

/**
 * El `content-type` del formulario lo elige quien sube: un .exe renombrado llega
 * como `application/pdf` sin despeinarse. Lo que no se puede falsificar tan
 * barato es el encabezado del archivo, así que se mira ahí.
 */
export function looksLikePdf(head: ArrayBuffer): boolean {
  const bytes = new Uint8Array(head.slice(0, PDF_MAGIC.length));
  return String.fromCharCode(...bytes) === PDF_MAGIC;
}

/** Nombre saneado: sin rutas ni caracteres raros que rompan el header de descarga. */
export function safeFilename(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? 'brief.pdf';
  const clean = base.replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  return clean.toLowerCase().endsWith('.pdf') ? clean : `${clean}.pdf`;
}
