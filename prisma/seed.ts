const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const domainCategories = {
  'ultimahoracripto.com': [
    'Ethereum',
    'Bitcoin',
    'Regulación',
    'Mercados',
    'Tarifas',
    'Criptomonedas',
    'Inversión',
    'Análisis',
    'Minería',
    'Tecnología',
    'Economía',
    'Estabilidad',
    'Blockchain',
    'Riesgos',
    'Desarrollo',
    'Tendencias',
    'Colapso',
    'Estrategia',
    'Crisis',
    'Proyecciones',
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
    'Inteligencia Artificial',
    'Regulación',
    'ETF',
    'Cripto Trading',
    'Política Cripto',
    'Tokenización',
    'Pagos P2P',
    'Mercados',
    'Ethereum',
    'Criptomonedas',
    'Bitcoin',
    'Stablecoins',
    'Inversiones',
    'Innovación',
    'Minado',
    'Descentralización',
    'Adopción',
    'Finanzas',
    'Desarrollo',
    'Proyectos',
    'Crisis',
    'Tecnología',
    'Nuevos Activos',
    'Colapso',
    'Comunidad Cripto',
    'Educación',
    'Sostenibilidad',
    'Seguridad',
    'Economía Digital',
    'Criptomonedas',
    'Blockchain & Desarrollo',
    'DeFi (Finanzas Descentralizadas)',
    'Web3 & Metaverso',
    'NFTs & Gaming',
    'Inteligencia Artificial',
    'Trading & Mercados',
    'Regulación & Política Cripto',
    'Adopción & Comunidad',
    'Innovación & Tecnología'
  ],
  'bitcoinarg.news': [
    'Crisis Económica',
    'Fortaleza de Bitcoin',
    'Beneficios de Bitcoin',
    'Donaciones en Cripto',
    'Regulación Cripto',
    'Préstamos P2P',
    'Investigación',
    'Staking de Bitcoin',
    'Congelamiento de Fondos',
    'Ley Cripto',
    'Cambio en SEC',
    'Explosión de Bitcoin',
    'Acuerdo Ripple',
    'Tokenización',
    'Noticias Semanales',
    'Pagos en Cripto',
    'Transparencia',
    'Inversiones Cripto',
    'Adopción de Cripto',
    'Impuestos sobre Cripto',
    'Análisis del Dólar',
    'Volatilidad',
    'Licencia de Activos Digitales',
    'Colapso de Cripto',
    'Tokenización de Recursos',
    'Incremento de Minería',
    'Sandbox Regulatorio',
    'Embargo Cambiario',
    'Consorcio de Stablecoins',
    'Tendencias en Exchanges',
    'Descentralización de Minería',
    'Caos Monetario',
    'Incorporación a Cámara Fintech',
    'Promesas de Inversión',
    'Entrevista sobre Bitcoin',
    'Surge de Trading',
    'Explotación de Cripto',
    'Cumbre Trump-Bukele',
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