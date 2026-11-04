/**
 * Limpieza anti-IA de la ingesta, sin red. Casos sacados de notas reales.
 *
 *   npm run qa:humanize
 */
import { humanizeText } from '@/lib/services/humanize-text';

const cases: [string, string, string][] = [
  [
    'inciso pegado entre rayas → comas',
    'factores inesperados —tanto geopolíticos como regulatorios— podrían alterar',
    'factores inesperados, tanto geopolíticos como regulatorios, podrían alterar',
  ],
  ['inciso con espacios → comas', 'Bitcoin — la moneda dura — sube', 'Bitcoin, la moneda dura, sube'],
  ['raya antes de un punto se va', 'cerró en verde —.', 'cerró en verde.'],
  ['raya después de coma no duplica', 'el exchange, —uno de los más antiguos— opera', 'el exchange, uno de los más antiguos, opera'],
  ['raya de diálogo al inicio de línea', '— Vamos a comprar, dijo.', 'Vamos a comprar, dijo.'],
  ['título "Conclusión" se va, el párrafo queda', 'Fin.\n\n### Conclusión \nLa iniciativa refuerza.', 'Fin.\n\nLa iniciativa refuerza.'],
  ['título específico queda', '### Conclusiones de una investigación\nTexto', '### Conclusiones de una investigación\nTexto'],
  ['"En conclusión," se va y capitaliza', 'los estados.\n\nEn conclusión, el debate sigue.', 'los estados.\n\nEl debate sigue.'],
  ['apertura a mitad de párrafo', 'Sube. En resumen, el mercado aguanta.', 'Sube. El mercado aguanta.'],
  ['"en conclusión" sin coma no se toca', 'llegó en conclusión de la auditoría', 'llegó en conclusión de la auditoría'],
  ['negritas, links y emojis de tutorial quedan', '- **Cómo empezar:** tocá (☰) en [Exness](https://x.co/a-b)', '- **Cómo empezar:** tocá (☰) en [Exness](https://x.co/a-b)'],
];

let failed = 0;
for (const [label, input, expected] of cases) {
  const got = humanizeText(input);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? '  ok ' : 'FAIL '} ${label}${ok ? '' : `\n       got:      ${JSON.stringify(got)}\n       expected: ${JSON.stringify(expected)}`}`);
}
if (failed) process.exit(1);
