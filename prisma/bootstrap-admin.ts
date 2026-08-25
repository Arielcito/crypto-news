/**
 * Crea (o repara) el primer usuario ADMIN del panel a partir de las variables
 * de entorno que hoy sostienen el login viejo. Corre una sola vez, después del
 * `prisma migrate deploy` de la migración `add_agency_dashboard`:
 *
 *   npm run bootstrap:admin
 *
 * Es idempotente: si el usuario ya existe, no lo pisa.
 *
 * Toma `ADMIN_EMAIL` (o `ADMIN_USERNAME` si ya es un email) y `ADMIN_PASSWORD`.
 * La contraseña se hashea con bcrypt: a partir de acá las variables de entorno
 * dejan de ser credenciales y sólo sirven para este bootstrap.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function resolveEmail(): string {
  const explicit = process.env.ADMIN_EMAIL?.trim();
  if (explicit) return explicit.toLowerCase();

  const username = process.env.ADMIN_USERNAME?.trim();
  if (username?.includes('@')) return username.toLowerCase();

  return 'admin@bitcoinarg.news';
}

async function main() {
  const email = resolveEmail();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error(
      'Falta ADMIN_PASSWORD, o tiene menos de 8 caracteres. Definila en .env antes de correr esto.'
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[bootstrap-admin] ${email} ya existe (id ${existing.id}). No se toca.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME?.trim() || 'Admin',
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log(`[bootstrap-admin] Admin creado: ${user.email} (id ${user.id})`);
  console.log('[bootstrap-admin] Entrá a /admin/login con ese email y la ADMIN_PASSWORD actual.');
}

main()
  .catch((error: unknown) => {
    console.error('[bootstrap-admin] Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

export {};
