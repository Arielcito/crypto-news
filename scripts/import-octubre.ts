/**
 * Carga única de lo que se gestionaba en el Excel de octubre 2026 (una hoja por
 * marca). Lee el JSON que sale de parsear el .xlsx — filas con sus celdas por
 * columna y el link de cada celda — y crea clientes, el paquete 2026-10 y sus
 * tareas.
 *
 * Por defecto sólo muestra lo que haría. Con `--apply` escribe. Se puede correr
 * dos veces: cliente por slug, paquete por cliente+mes y tarea por paquete+título
 * existentes se saltean.
 *
 *   TS_NODE_PROJECT=tsconfig.qa.json npx ts-node -r tsconfig-paths/register \
 *     scripts/import-octubre.ts <sheets.json> [--apply]
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Outlet, SocialNetwork, TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { parseCalendarDate, parseDueDate } from '@/lib/agency/dates';

const MONTH = '2026-10-01';
/** Exness #1 no tiene fecha: se hizo al arrancar el mes. */
const FALLBACK_DATE = '2026-10-01';
const TEAM = /^(Feli|Maxi|Armel|Enzo)\b/;

const CLIENTS: Record<string, { name: string; slug: string; requiresApproval?: boolean }> = {
  'Capital.com': { name: 'Capital.com', slug: 'capital-com', requiresApproval: true },
  Exness: { name: 'Exness', slug: 'exness' },
  SimpleFX: { name: 'SimpleFX', slug: 'simplefx' },
  Bingx: { name: 'BingX', slug: 'bingx' },
  Decibel: { name: 'Decibel', slug: 'decibel' },
  EMCD: { name: 'EMCD', slug: 'emcd' },
  Bitget: { name: 'Bitget', slug: 'bitget' },
  Ondo: { name: 'Ondo', slug: 'ondo' },
  GrabFi: { name: 'GrabFi', slug: 'grabfi' },
};

const sheetsSchema = z.record(
  z.string(),
  z.object({
    rows: z.array(
      z.object({
        r: z.number(),
        cells: z.record(z.string(), z.object({ v: z.string().optional(), link: z.string().optional() })),
      })
    ),
  })
);
type Row = z.infer<typeof sheetsSchema>[string]['rows'][number];

interface ImportedTask {
  title: string;
  network: SocialNetwork;
  outlet: Outlet | null;
  format: string;
  dueDate: Date;
  status: TaskStatus;
  completedAt: Date | null;
  permalink: string | null;
  evidenceUrl: string | null;
  notes: string | null;
}

/** Serial de Excel (días desde 1899-12-30) → `YYYY-MM-DD`. */
function serialToIso(serial: string): string {
  const days = Math.floor(Number(serial));
  return new Date(Date.UTC(1899, 11, 30) + days * 86_400_000).toISOString().slice(0, 10);
}

/** El catálogo guarda `https://www.instagram.com/p/<código>`, también para reels. */
function normalizePermalink(url: string): string {
  const ig = url.match(/instagram\.com\/(?:p|reels?)\/([\w-]+)/);
  return ig ? `https://www.instagram.com/p/${ig[1]}` : url;
}

/** El prefijo del título dice dónde sale la pieza; el campo Tipo, el formato. */
function placementOf(prefix: string, format: string): { outlet: Outlet | null; network: SocialNetwork } {
  const p = prefix.toLowerCase();
  if (p.startsWith('btcarg_instagram') || p.includes('x btcarg')) return { outlet: 'BTCARG', network: 'INSTAGRAM' };
  if (p.startsWith('btcarg_youtube')) return { outlet: 'BTCARG', network: 'YOUTUBE' };
  if (p.startsWith('tev_instagram')) return { outlet: 'TEV', network: 'INSTAGRAM' };
  if (p.startsWith('tev_youtube') || p.startsWith('tev - semana')) return { outlet: 'TEV', network: 'YOUTUBE' };
  if (p.startsWith('capital.com_instagram')) return { outlet: 'CLIENT', network: 'INSTAGRAM' };
  if (p.startsWith('bitcoinarg.news') || p.startsWith('btcarg')) return { outlet: 'BTCARG', network: 'WEB' };
  if (p.startsWith('discord')) return { outlet: 'TEV', network: 'DISCORD' };
  if (p === 'tev') return { outlet: 'TEV', network: 'OTHER' };
  // Sin prefijo: un post, reel o historia sólo puede ser de Instagram.
  if (!p && ['Post', 'Reel', 'Historia'].includes(format)) return { outlet: null, network: 'INSTAGRAM' };
  return { outlet: null, network: 'OTHER' };
}

function parseSheet(rows: Row[]): { tasks: ImportedTask[]; sources: Set<string>; clientNotes: Set<string> } {
  const [header, ...body] = rows;
  // SimpleFX tiene todo corrido una columna: se ubica cada campo por su encabezado.
  const col = Object.fromEntries(Object.entries(header.cells).map(([letter, cell]) => [cell.v?.trim(), letter]));
  const sources = new Set<string>();
  const clientNotes = new Set<string>();
  const tasks: ImportedTask[] = [];

  for (const row of body) {
    const text = (field: string) => row.cells[col[field]]?.v?.trim() ?? '';
    const estado = text('Estado');
    if (!estado) continue; // filas de relleno

    const rawType = text('Tipo');
    const optional = /\(opcional\)/i.test(rawType);
    const format = rawType.replace(/\s*\((Instagram|Web|opcional)\)/i, '').trim();
    const rawTitle = text('Tema / título');
    const [prefix, ...rest] = rawTitle.includes('|') ? rawTitle.split('|') : [rawTitle];
    const week = prefix.match(/Semana \d+/)?.[0];
    const topic = rest.join('|').trim();
    const replaced = /reemplazad/i.test(rawTitle);

    const notes: string[] = [];
    for (const segment of text('Observaciones').split(' | ').map((s) => s.trim()).filter(Boolean)) {
      if (TEAM.test(segment)) {
        const [who, ...why] = segment.split(' - ');
        notes.push(`Responsable: ${who.trim()}`, ...why);
      } else if (/^Fuentes? oficial/i.test(segment) || /^https?:\/\//.test(segment)) {
        segment.match(/https?:\/\/\S+/g)?.forEach((url) => sources.add(url));
      } else if (/aprobado por escrito/i.test(segment)) {
        clientNotes.add(segment);
      } else {
        notes.push(segment);
      }
    }
    if (estado === 'En proceso') notes.push('En proceso según el Excel.');
    if (optional) notes.push('Opcional.');
    if (replaced) notes.push('Reemplazada por un reel.');

    const dueDate = parseDueDate(text('Fecha') ? serialToIso(text('Fecha')) : FALLBACK_DATE);
    const link = row.cells[col['Enlace']]?.link ?? (text('Enlace').startsWith('http') ? text('Enlace') : '');
    const isEvidence = link.includes('drive.google.com');
    const status: TaskStatus = replaced ? 'CANCELLED' : estado === 'Realizado' ? 'DONE' : 'PENDING';

    tasks.push({
      title: topic ? (week ? `${week} · ${topic}` : topic) : `${format} #${parseInt(text('Contenido'), 10)}`,
      ...placementOf(prefix.trim(), format),
      format,
      dueDate,
      status,
      completedAt: status === 'DONE' ? new Date(Math.min(dueDate.getTime(), Date.now())) : null,
      permalink: link && !isEvidence ? normalizePermalink(link) : null,
      evidenceUrl: isEvidence ? link : null,
      notes: notes.length ? notes.join('\n') : null,
    });
  }
  return { tasks, sources, clientNotes };
}

async function main() {
  const [path, flag] = process.argv.slice(2);
  if (!path) throw new Error('Falta el path al JSON de las hojas');
  const apply = flag === '--apply';
  const sheets = sheetsSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
  console.log(`[import-octubre] ${apply ? 'APLICANDO' : 'dry-run'} desde ${path}`);

  let created = 0;
  for (const [sheetName, sheet] of Object.entries(sheets)) {
    const meta = CLIENTS[sheetName.trim()];
    if (!meta) continue; // "Panel general" es un resumen, no una marca
    const { tasks, sources, clientNotes } = parseSheet(sheet.rows);
    const live = tasks.filter((task) => task.status !== 'CANCELLED').length;

    console.log(`\n== ${meta.name} (${meta.slug}): ${tasks.length} tareas, ${live} comprometidas`);
    for (const task of tasks) {
      console.log(
        `  ${task.status.padEnd(9)} ${task.dueDate.toISOString().slice(0, 10)} ${(task.outlet ?? '-').padEnd(6)} ${task.network.padEnd(9)} ${task.format.padEnd(24)} ${task.title.slice(0, 60)}${task.permalink ? ' [link]' : ''}${task.evidenceUrl ? ' [captura]' : ''}`
      );
      if (task.notes) console.log(`      ↳ ${task.notes.replaceAll('\n', ' / ').slice(0, 140)}`);
    }
    if (clientNotes.size || sources.size) console.log(`  ficha: ${[...clientNotes].join(' / ')} · ${sources.size} fuentes`);
    if (!apply) continue;

    const clientNotesText = [
      'Importado del Excel de octubre 2026.',
      ...clientNotes,
      ...(sources.size ? ['Fuentes oficiales para validar datos:', ...[...sources].map((url) => `- ${url}`)] : []),
    ].join('\n');
    const client = await prisma.client.upsert({
      where: { slug: meta.slug },
      create: { name: meta.name, slug: meta.slug, requiresApproval: meta.requiresApproval ?? false, notes: clientNotesText },
      update: {},
    });
    const month = parseCalendarDate(MONTH);
    const pkg = await prisma.package.upsert({
      where: { clientId_month: { clientId: client.id, month } },
      create: { clientId: client.id, month, committedPieces: live },
      update: {},
    });
    const existing = new Set(
      (await prisma.task.findMany({ where: { packageId: pkg.id }, select: { title: true } })).map((t) => t.title)
    );
    const fresh = tasks.filter((task) => !existing.has(task.title));
    const result = await prisma.task.createMany({ data: fresh.map((task) => ({ ...task, packageId: pkg.id })) });
    created += result.count;
    console.log(`  → cliente ${client.id}, paquete ${pkg.id}: ${result.count} creadas, ${tasks.length - fresh.length} ya estaban`);
  }
  console.log(`\n[import-octubre] listo: ${apply ? `${created} tareas creadas` : 'nada escrito (sumá --apply)'}`);
}

main()
  .catch((error) => {
    console.error('[import-octubre] error', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
