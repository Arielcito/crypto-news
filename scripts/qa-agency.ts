/**
 * Verificación de la lógica de servidor del dashboard de agencia contra una base
 * real. Siembra, ejercita y afirma la doctrina de métricas (contadores
 * acumulados, crecimiento por resta, null≠0), el scoping por rol y que un
 * reporte generado no cambia cuando llegan lecturas nuevas.
 *
 * BORRA TODAS LAS TABLAS DE AGENCIA antes de sembrar: correlo SIEMPRE contra una
 * base descartable, nunca contra la de producción.
 *
 *   createdb crypto_news_agencia_qa
 *   DATABASE_URL=postgresql://<user>@127.0.0.1:5432/crypto_news_agencia_qa \
 *     npx prisma migrate deploy
 *   DATABASE_URL=... npm run qa:agency
 */
import { prisma } from '@/lib/prisma';
import { buildSnapshot } from '@/lib/agency/reports';
import { organicMetrics } from '@/lib/agency/metrics';
import { progressOf } from '@/lib/agency/packages';
import { canAccessClient, clientIdsForUser } from '@/lib/agency/permissions';
import { parseDueDate, urgencyOf, countdownLabel } from '@/lib/agency/dates';
import type { SessionUser } from '@/lib/admin-auth';

let failures = 0;
function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}`, detail === undefined ? '' : JSON.stringify(detail));
  }
}

async function main() {
  console.log('\n== siembra ==');
  await prisma.$transaction([
    prisma.socialPostMetric.deleteMany(),
    prisma.socialAccountMetric.deleteMany(),
    prisma.socialPost.deleteMany(),
    prisma.report.deleteMany(),
    prisma.task.deleteMany(),
    prisma.package.deleteMany(),
    prisma.brief.deleteMany(),
    prisma.clientProfile.deleteMany(),
    prisma.client.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: { email: 'admin@qa.test', name: 'Admin QA', passwordHash: 'x', role: 'ADMIN' },
  });
  const employee = await prisma.user.create({
    data: { email: 'emp@qa.test', name: 'Empleado QA', passwordHash: 'x', role: 'EMPLOYEE' },
  });

  const clientA = await prisma.client.create({ data: { name: 'Cliente A', slug: 'cliente-a' } });
  const clientB = await prisma.client.create({ data: { name: 'Cliente B', slug: 'cliente-b' } });

  const profileIg = await prisma.clientProfile.create({
    data: { clientId: clientA.id, postproxyProfileId: 'pp-1', network: 'INSTAGRAM', handle: '@a' },
  });
  const profileFb = await prisma.clientProfile.create({
    data: { clientId: clientA.id, postproxyProfileId: 'pp-2', network: 'FACEBOOK', handle: 'A FB' },
  });

  const pkg = await prisma.package.create({
    data: { clientId: clientA.id, month: new Date(Date.UTC(2026, 6, 1)), committedPieces: 4 },
  });
  // Paquete de otro cliente, sin tareas del empleado: no tiene que verlo.
  await prisma.package.create({
    data: { clientId: clientB.id, month: new Date(Date.UTC(2026, 6, 1)), committedPieces: 2 },
  });

  const linkMatched = 'https://instagram.com/p/matched';
  const linkOrphan = 'https://instagram.com/p/todavia-no-en-catalogo';

  await prisma.task.create({
    data: {
      packageId: pkg.id, assigneeId: employee.id, title: 'Reel de lanzamiento',
      network: 'INSTAGRAM', format: 'Reel', dueDate: parseDueDate('2026-07-10'),
      status: 'DONE', permalink: linkMatched, completedAt: new Date('2026-07-09T18:00:00Z'),
    },
  });
  await prisma.task.create({
    data: {
      packageId: pkg.id, assigneeId: employee.id, title: 'Carrusel educativo',
      network: 'INSTAGRAM', format: 'Carrusel', dueDate: parseDueDate('2026-07-20'),
      status: 'DONE', permalink: linkOrphan, completedAt: new Date('2026-07-19T12:00:00Z'),
    },
  });
  await prisma.task.create({
    data: {
      packageId: pkg.id, assigneeId: employee.id, title: 'Post de cierre',
      network: 'FACEBOOK', format: 'Post', dueDate: parseDueDate('2026-07-28'),
    },
  });

  // La pieza cruzada tiene DOS lecturas acumuladas: el rendimiento es la última.
  const post = await prisma.socialPost.create({
    data: {
      postproxyPostId: 'ppp-1', network: 'INSTAGRAM', clientProfileId: profileIg.id,
      permalink: linkMatched, body: 'Lanzamiento', publishedAt: new Date('2026-07-09T18:05:00Z'),
    },
  });
  await prisma.socialPostMetric.createMany({
    data: [
      { socialPostId: post.id, recordedAt: new Date('2026-07-10T00:00:00Z'), impressions: 400, reach: 350, likes: 20, comments: 2, saves: 1, shares: 0 },
      { socialPostId: post.id, recordedAt: new Date('2026-07-12T00:00:00Z'), impressions: 1000, reach: 800, likes: 50, comments: 5, saves: 4, shares: 1 },
    ],
  });

  // Pieza de Facebook: Meta no expone impresiones de página → null, no 0.
  const postFb = await prisma.socialPost.create({
    data: {
      postproxyPostId: 'ppp-2', network: 'FACEBOOK', clientProfileId: profileFb.id,
      permalink: 'https://facebook.com/p/2', body: 'Nota de página', publishedAt: new Date('2026-07-11T10:00:00Z'),
    },
  });
  await prisma.socialPostMetric.create({
    data: { socialPostId: postFb.id, recordedAt: new Date('2026-07-12T00:00:00Z'), impressions: null, reach: null, likes: 7, comments: 1, saves: null, shares: null },
  });

  // Dos fotos de cuenta: el crecimiento es la RESTA.
  await prisma.socialAccountMetric.createMany({
    data: [
      { clientProfileId: profileIg.id, recordedAt: new Date('2026-07-01T06:00:00Z'), followers: 1000, posts: 40 },
      { clientProfileId: profileIg.id, recordedAt: new Date('2026-07-12T06:00:00Z'), followers: 1120, posts: 46 },
      { clientProfileId: profileFb.id, recordedAt: new Date('2026-07-12T06:00:00Z'), followers: 300, posts: 12 },
    ],
  });

  console.log('\n== progreso del paquete ==');
  const tasks = await prisma.task.findMany({ where: { packageId: pkg.id } });
  const progress = progressOf(pkg, tasks);
  check('done=2 total=3 committed=4 (la brecha con lo prometido no se esconde)',
    progress.done === 2 && progress.total === 3 && progress.committed === 4, progress);

  console.log('\n== permisos por rol ==');
  const adminSession: SessionUser = { id: admin.id, email: admin.email, name: admin.name, role: 'ADMIN', mustChangePassword: false };
  const empSession: SessionUser = { id: employee.id, email: employee.email, name: employee.name, role: 'EMPLOYEE', mustChangePassword: false };
  check("admin ve 'all'", (await clientIdsForUser(adminSession)) === 'all');
  const empIds = await clientIdsForUser(empSession);
  check('empleado ve sólo el cliente con tareas asignadas', Array.isArray(empIds) && empIds.length === 1 && empIds[0] === clientA.id, empIds);
  check('empleado accede al cliente A', await canAccessClient(empSession, clientA.id));
  check('empleado NO accede al cliente B', !(await canAccessClient(empSession, clientB.id)));

  console.log('\n== métricas orgánicas ==');
  const now = new Date('2026-07-13T12:00:00Z');
  const metrics = await organicMetrics({ clientId: clientA.id, allowedClientIds: 'all', days: 28, now });
  check('configured', metrics.configured);
  check('hasData', metrics.hasData);
  const ig = metrics.accounts.find((a) => a.network === 'INSTAGRAM');
  check('followersGained = 1120 - 1000 = 120 (resta, no suma)', ig?.followersGained === 120, ig?.followersGained);
  const fb = metrics.accounts.find((a) => a.network === 'FACEBOOK');
  check('una sola lectura → followersGained null, nunca 0', fb?.followersGained === null, fb?.followersGained);

  const piece = metrics.top.find((row) => row.permalink === linkMatched);
  check('rendimiento = ÚLTIMA lectura (1000), no la suma (1400)', piece?.impressions === 1000, piece?.impressions);
  check('interacciones de la última lectura = 60', piece?.interactions === 60, piece?.interactions);
  check('engagement = 60/1000', piece?.engagement !== null && Math.abs((piece?.engagement ?? 0) - 0.06) < 1e-9, piece?.engagement);

  const pieceFb = metrics.top.concat(metrics.worst).find((row) => row.network === 'FACEBOOK');
  check('sin impresiones → engagement null, no 0', pieceFb?.engagement === null, pieceFb?.engagement);
  check('sin impresiones → impressions null, no 0', pieceFb?.impressions === null, pieceFb?.impressions);

  check('totales sólo suman lo reportado (1000)', metrics.totals.impressions === 1000, metrics.totals);
  check('serie de seguidores con puntos', metrics.series.length > 0, metrics.series.length);

  const cutoff = await organicMetrics({ clientId: clientA.id, allowedClientIds: 'all', days: 7, now });
  const igCut = cutoff.accounts.find((a) => a.network === 'INSTAGRAM');
  check('rango de 7 días deja una sola punta → gained null', igCut?.followersGained === null, igCut?.followersGained);

  const scoped = await organicMetrics({ allowedClientIds: [clientB.id], days: 28, now });
  check('cliente sin cuentas → configured false', scoped.configured === false, scoped.configured);

  console.log('\n== snapshot del reporte ==');
  const snapshot = await buildSnapshot(pkg.id);
  check('snapshot existe', snapshot !== null);
  check('deliveredPieces = 2', snapshot?.deliveredPieces === 2, snapshot?.deliveredPieces);
  check('committedPieces = 4', snapshot?.committedPieces === 4);
  check('month = 2026-07', snapshot?.month === '2026-07', snapshot?.month);
  const matched = snapshot?.tasks.find((t) => t.permalink === linkMatched);
  check('tarea cruzada: matched true, impresiones 1000', matched?.metrics.matched === true && matched?.metrics.impressions === 1000, matched?.metrics);
  const orphan = snapshot?.tasks.find((t) => t.permalink === linkOrphan);
  check('pieza sin catálogo: matched false y métricas null, no 0',
    orphan?.metrics.matched === false && orphan?.metrics.impressions === null && orphan?.metrics.interactions === null, orphan?.metrics);
  check('totales del reporte cuentan sólo la pieza cruzada', snapshot?.totals.pieces === 1 && snapshot?.totals.impressions === 1000, snapshot?.totals);

  console.log('\n== congelado ==');
  const report = await prisma.report.create({ data: { packageId: pkg.id, generatedById: admin.id, snapshot: snapshot as object } });
  await prisma.socialPostMetric.create({
    data: { socialPostId: post.id, recordedAt: new Date('2026-07-20T00:00:00Z'), impressions: 9999, reach: 9000, likes: 500, comments: 50, saves: 40, shares: 10 },
  });
  const stored = await prisma.report.findUnique({ where: { id: report.id } });
  const frozen = stored?.snapshot as { totals: { impressions: number } };
  check('el reporte guardado no cambia al llegar lecturas nuevas', frozen.totals.impressions === 1000, frozen.totals);
  const rebuilt = await buildSnapshot(pkg.id);
  check('un snapshot nuevo sí ve la lectura nueva (9999)', rebuilt?.totals.impressions === 9999, rebuilt?.totals);

  console.log('\n== vencimientos ==');
  const ref = new Date('2026-07-15T12:00:00-03:00');
  check("deadline de ayer → 'overdue'", urgencyOf(parseDueDate('2026-07-14'), false, ref) === 'overdue');
  check("deadline de hoy 23:59 AR → 'today', no vencida", urgencyOf(parseDueDate('2026-07-15'), false, ref) === 'today');
  check("en 2 días → 'soon'", urgencyOf(parseDueDate('2026-07-17'), false, ref) === 'soon');
  check("en 10 días → 'later'", urgencyOf(parseDueDate('2026-07-25'), false, ref) === 'later');
  check("hecha → 'done' aunque esté vencida", urgencyOf(parseDueDate('2026-07-01'), true, ref) === 'done');
  check('countdown legible', countdownLabel(parseDueDate('2026-07-17'), ref).startsWith('En 2 día'), countdownLabel(parseDueDate('2026-07-17'), ref));

  console.log(failures === 0 ? '\nTODO OK\n' : `\n${failures} FALLAS\n`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
