const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const domainCategories: Record<string, string[]> = {
  'bitcoinarg.news': [
    'Crisis Economica',
    'Fortaleza de Bitcoin',
    'Beneficios de Bitcoin',
    'Donaciones en Cripto',
    'Regulacion Cripto',
    'Prestamos P2P',
    'Investigacion',
    'Staking de Bitcoin',
    'Congelamiento de Fondos',
    'Ley Cripto',
    'Tokenizacion',
    'Noticias Semanales',
    'Pagos en Cripto',
    'Transparencia',
    'Inversiones Cripto',
    'Adopcion de Cripto',
    'Impuestos sobre Cripto',
    'Volatilidad',
    'Licencia de Activos Digitales',
    'Sandbox Regulatorio',
    'Embargo Cambiario',
    'Consorcio de Stablecoins',
    'Tendencias en Exchanges',
    'Descentralizacion de Mineria',
    'Regulacion y Politica',
    'Adopcion Cripto en LATAM',
    'Empresas y Startups',
    'Pagos y Casos de Uso',
    'Impuestos y Normativas',
    'Fraudes y Estafas',
    'Exchanges en LATAM',
    'Bitcoin y Stablecoins',
    'Educacion y Comunidad Cripto',
    'Eventos y Actualidad Cripto',
    'Stablecoins',
    'Hackeo',
    'Geopolitica',
  ],
  'localhost': [
    'Bitcoin y Finanzas Personales',
    'Economia y Crisis',
    'Regulacion y Politicas Cripto',
    'Mercado y Volatilidad',
    'Tecnologia y Mineria',
    'Pagos y Servicios en Cripto',
    'Geopolitica y Actualidad',
    'Adopcion y Comunidad',
  ],
};

async function main() {
  for (const [domain, categories] of Object.entries(domainCategories)) {
    for (const categoryName of categories) {
      const slug = removeAccents(categoryName)
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');

      await prisma.domainCategories.upsert({
        where: { domain_slug: { domain, slug } },
        update: {},
        create: { domain, name: categoryName, slug },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
