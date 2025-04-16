const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const domainCategories = {
  'ultimahoracripto.com': [
    'Regulación Global',
    'Mercados y Macroeconomía',
    'Criptomonedas y Altcoins',
    'Hackeos y Ciberseguridad',
    'Inversiones y Finanzas',
    'Tecnología y Protocolos',
    'Crisis y Colapsos',
    'Tendencias y Proyecciones',
    'Anuncios y Última Hora'
  ],
  'tendenciascripto.com': [
    'Criptomonedas',
    'Blockchain & Desarrollo',
    'DeFi (Finanzas Descentralizadas)',
    'Web3 & Metaverso',
    'NFTs & Gaming',
    'Inteligencia Artificial',
    'Trading & Mercados'
  ],
  'bitcoinarg.news': [
    'Regulación y Política',
    'Adopción Cripto en LATAM',
    'Empresas y Startups',
    'Pagos y Casos de Uso',
    'Impuestos y Normativas',
    'Fraudes y Estafas',
    'Exchanges en LATAM',
    'Bitcoin y Stablecoins',
    'Educación y Comunidad Cripto',
    'Eventos y Actualidad Cripto'
  ]
}

async function main() {
  for (const [domain, categories] of Object.entries(domainCategories)) {
    for (const categoryName of categories) {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')

      await prisma.domainCategories.upsert({
        where: {
          domain_slug: {
            domain,
            slug
          }
        },
        update: {},
        create: {
          domain,
          name: categoryName,
          slug
        }
      })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 