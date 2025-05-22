const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Function to remove accents from text
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const domainCategories = {
  'ultimahoracripto.com': [
    'Ethereum',
    'Bitcoin',
    'Regulacion',
    'Mercados',
    'Tarifas',
    'Criptomonedas',
    'Inversion',
    'Analisis',
    'Mineria',
    'Tecnologia',
    'Economia',
    'Estabilidad',
    'Blockchain',
    'Riesgos',
    'Desarrollo',
    'Tendencias',
    'Colapso',
    'Estrategia',
    'Crisis',
    'Proyecciones',
    'Regulacion Global',
    'Mercados y Macroeconomia',
    'Criptomonedas y Altcoins',
    'Hackeos y Ciberseguridad',
    'Inversiones y Finanzas',
    'Tecnologia y Protocolos',
    'Crisis y Colapsos',
    'Tendencias y Proyecciones',
    'Anuncios y Ultima Hora',
    'Altcoins',
    'Politica',
    'Crimen',
    'Empresas'
  ],
  'tendenciascripto.com': [
    'Inteligencia Artificial',
    'Regulacion',
    'ETF',
    'Cripto Trading',
    'Politica Cripto',
    'Tokenizacion',
    'Pagos P2P',
    'Mercados',
    'Ethereum',
    'Criptomonedas',
    'Bitcoin',
    'Stablecoins',
    'Inversiones',
    'Innovacion',
    'Minado',
    'Descentralizacion',
    'Adopcion',
    'Finanzas',
    'Desarrollo',
    'Proyectos',
    'Crisis',
    'Tecnologia',
    'Nuevos Activos',
    'Colapso',
    'Comunidad Cripto',
    'Educacion',
    'Sostenibilidad',
    'Seguridad',
    'Economia Digital',
    'Criptomonedas',
    'Blockchain & Desarrollo',
    'DeFi (Finanzas Descentralizadas)',
    'Web3 & Metaverso',
    'NFTs & Gaming',
    'Inteligencia Artificial',
    'Trading & Mercados',
    'Regulacion & Politica Cripto',
    'Adopcion & Comunidad',
    'Innovacion & Tecnologia',
    'Solana',
    'DeFi',
    'NFT'
  ],
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
    'Cambio en SEC',
    'Explosion de Bitcoin',
    'Acuerdo Ripple',
    'Tokenizacion',
    'Noticias Semanales',
    'Pagos en Cripto',
    'Transparencia',
    'Inversiones Cripto',
    'Adopcion de Cripto',
    'Impuestos sobre Cripto',
    'Analisis del Dolar',
    'Volatilidad',
    'Licencia de Activos Digitales',
    'Colapso de Cripto',
    'Tokenizacion de Recursos',
    'Incremento de Mineria',
    'Sandbox Regulatorio',
    'Embargo Cambiario',
    'Consorcio de Stablecoins',
    'Tendencias en Exchanges',
    'Descentralizacion de Mineria',
    'Caos Monetario',
    'Incorporacion a Camara Fintech',
    'Promesas de Inversion',
    'Entrevista sobre Bitcoin',
    'Surge de Trading',
    'Explotacion de Cripto',
    'Cumbre Trump-Bukele',
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
    'Geopolitica'
  ],
  'localhost': [
    'Bitcoin y Finanzas Personales',
    'Economia y Crisis',
    'Regulacion y Politicas Cripto',
    'Mercado y Volatilidad',
    'Tecnologia y Mineria',
    'Pagos y Servicios en Cripto',
    'Geopolitica y Actualidad',
    'Adopcion y Comunidad'
  ]
}

async function main() {
  for (const [domain, categories] of Object.entries(domainCategories)) {
    for (const categoryName of categories) {
      const slug = removeAccents(categoryName)
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