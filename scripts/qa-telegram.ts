/**
 * Arma el mensaje de Telegram sin red: escapado HTML y link al post.
 *
 *   npm run qa:telegram
 */
import { buildTelegramMessage } from '@/lib/services/telegram';
import { buildTaskDigest, type DigestTask } from '@/lib/services/telegram-tasks';

const message = buildTelegramMessage({
  id: 1,
  title: 'S&P 500 <sube> con Bitcoin',
  slug: 'sp-500-sube',
  excerpt: '**Wall Street** & las cripto <en verde.',
  content: '',
  featuredMedia: null,
  status: 'publish',
  domain: 'bitcoinarg.news',
  discordPostedAt: null,
  telegramPostedAt: null,
  xPostedAt: null,
  categories: [{ name: 'Mercados', slug: 'mercados' }],
});

const checks: [string, boolean][] = [
  ['escapa el título', message.text.startsWith('<b>S&amp;P 500 &lt;sube&gt; con Bitcoin</b>')],
  ['escapa y limpia la bajada', message.text.includes('Wall Street &amp; las cripto &lt;en verde.')],
  ['termina con el link al post', message.text.endsWith('https://bitcoinarg.news/mercados/sp-500-sube')],
  ['la preview apunta al post', message.link_preview_options.url === 'https://bitcoinarg.news/mercados/sp-500-sube'],
];

// Digest de tareas: sin DB, con un "ahora" fijo.
const now = new Date('2026-10-27T12:00:00Z');
const task = (id: number, dueDate: string, title = 'Reel'): DigestTask => ({
  id,
  packageId: 1,
  assigneeId: 6,
  coAssigneeId: null,
  title,
  network: 'INSTAGRAM',
  outlet: null,
  sponsorship: null,
  format: 'reel',
  dueDate: new Date(dueDate),
  status: 'PENDING',
  permalink: null,
  completedAt: null,
  approvedAt: null,
  editedAt: null,
  evidenceUrl: null,
  notes: null,
  createdAt: now,
  updatedAt: now,
  assignee: { name: 'Felipe Mengoni' },
  coAssignee: null,
  package: { client: { name: 'Lemon & Co' } },
});
const tasks = [task(1, '2026-10-25T12:00:00Z', 'Story <promo>'), task(2, '2026-10-28T12:00:00Z')];
const employee = buildTaskDigest({ name: 'Felipe Mengoni', role: 'EMPLOYEE' }, tasks, now) ?? '';
const admin = buildTaskDigest({ name: 'Paul Roveda', role: 'ADMIN' }, tasks, now) ?? '';
const many = buildTaskDigest(
  { name: 'Paul', role: 'ADMIN' },
  Array.from({ length: 13 }, (_, i) => task(i, '2026-10-20T12:00:00Z')),
  now
) ?? '';

checks.push(
  ['digest: sin tareas no hay mensaje', buildTaskDigest({ name: 'Feli', role: 'EMPLOYEE' }, [], now) === null],
  ['digest: separa vencidas y próximas', employee.includes('⚠️ Vencidas (1)') && employee.includes('próximos 3 días (1)')],
  ['digest: escapa cliente y título', employee.includes('Lemon &amp; Co') && employee.includes('Story &lt;promo&gt;')],
  ['digest: equipo va a mis-tareas, sin responsable', employee.includes('/admin/agencia/mis-tareas') && !employee.includes('Felipe Mengoni')],
  ['digest: admin ve responsable y va a tareas', admin.includes('· Felipe Mengoni') && admin.includes('/admin/agencia/tareas"')],
  ['digest: corta a 10 y avisa el resto', many.includes('… y 3 más') && many.split('\n• ').length === 11],
);

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([label, ok]) => console.log(`${ok ? '  ok ' : 'FAIL '} ${label}`));
if (failed.length) {
  console.error(message.text);
  process.exit(1);
}
