/**
 * Verifica el resumen de gastos. Es pura aritmética sobre filas en memoria, así
 * que no necesita base ni red:
 *
 *   npm run qa:gastos
 */
import type { Expense } from '@prisma/client';
import { summarizeExpenses, monthsBetween } from '@/lib/agency/expenses';
import { parseCalendarDate } from '@/lib/agency/dates';

let failures = 0;
function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ok   ${label}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL ${label}`, detail === undefined ? '' : JSON.stringify(detail));
}

const expense = (date: string, category: string, amount: number): Expense => ({
  id: amount,
  date: parseCalendarDate(date),
  category,
  description: `${category} ${date}`,
  amount,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Julio y septiembre con gastos, agosto en cero: tres meses transcurridos.
const rows = [
  expense('2026-07-05', 'Herramientas', 10_000),
  expense('2026-09-01', 'Herramientas', 20_000),
  expense('2026-09-20', 'Publicidad', 60_000),
];

console.log('\n== resumen ==');
// Un `now` fijo: sin esto el promedio cambia de mes en mes y el test se pudre.
const NOW = new Date('2026-09-20T12:00:00-03:00');
const septiembre = summarizeExpenses(rows, '2026-09', NOW);
check('total del mes', septiembre.monthTotal === 80_000, septiembre.monthTotal);
check('acumulado de toda la historia', septiembre.allTimeTotal === 90_000, septiembre.allTimeTotal);
check('sólo lista los gastos del mes', septiembre.expenses.length === 2, septiembre.expenses.length);
check(
  'las categorías van de mayor a menor',
  septiembre.byCategory.map((row) => row.category).join(',') === 'Publicidad,Herramientas',
  septiembre.byCategory
);

console.log('\n== promedio ==');
check('cuenta los meses transcurridos, no los que tienen filas', septiembre.monthsTracked === 3);
check('promedio = acumulado / meses', septiembre.monthlyAverage === 30_000, septiembre.monthlyAverage);

console.log('\n== bordes ==');
const agosto = summarizeExpenses(rows, '2026-08', NOW);
check('un mes sin gastos da cero, no rompe', agosto.monthTotal === 0 && agosto.byCategory.length === 0);
check('la serie trae los meses con gastos, ascendente', agosto.series.map((p) => p.month).join(',') === '2026-07,2026-09', agosto.series);
const vacio = summarizeExpenses([], '2026-09', NOW);
check('sin ningún gasto no divide por cero', vacio.monthlyAverage === 0 && vacio.monthsTracked === 0);
check('un solo mes cuenta como uno', monthsBetween('2026-09', '2026-09') === 1);
check('cruza el año', monthsBetween('2025-11', '2026-02') === 4);

// El día 1 no se puede caer al mes anterior: la columna es DATE y se guarda UTC.
const primero = summarizeExpenses([expense('2026-09-01', 'Oficina', 500)], '2026-09', NOW);
check('un gasto del día 1 cae en su mes', primero.monthTotal === 500, primero.monthTotal);

console.log(failures === 0 ? '\nTODO OK\n' : `\n${failures} FALLAS\n`);
process.exit(failures === 0 ? 0 : 1);
