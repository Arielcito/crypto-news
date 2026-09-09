import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireAdmin, serverError } from '@/lib/admin-auth';
import { summarizeExpenses } from '@/lib/agency/expenses';
import { currentMonthAr, parseCalendarDate } from '@/lib/agency/dates';
import { createExpenseSchema, expensesQuerySchema } from '@/lib/validations/admin';

/**
 * Los gastos son sólo del admin: un empleado no tiene por qué ver los sueldos
 * ni cuánto se lleva la pauta.
 */
export async function GET(request: NextRequest) {
  console.log('[GET] /api/admin/agencia/expenses - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const parsed = expensesQuerySchema.safeParse({
      month: request.nextUrl.searchParams.get('month') ?? currentMonthAr(),
    });
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    /*
     * Se traen todos los gastos y se agrupa en JS: el promedio y el acumulado
     * necesitan la historia entera igual, y una agencia carga decenas de filas
     * por mes.
     * ponytail: con más de ~50k filas, pasar a un groupBy por mes en SQL.
     */
    const expenses = await prisma.expense.findMany({ orderBy: [{ date: 'desc' }, { id: 'desc' }] });
    const data = summarizeExpenses(expenses, parsed.data.month);

    console.log(
      `[GET] /api/admin/agencia/expenses - ${expenses.length} gastos, ${data.expenses.length} en ${data.month}`
    );
    return NextResponse.json({ data, error: null, message: null });
  } catch (error) {
    return serverError('[GET] /api/admin/agencia/expenses', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/agencia/expenses - Request received');
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join('; '));
    }

    const expense = await prisma.expense.create({
      data: {
        date: parseCalendarDate(parsed.data.date),
        category: parsed.data.category.trim(),
        description: parsed.data.description.trim(),
        amount: parsed.data.amount,
      },
    });

    console.log(`[POST] /api/admin/agencia/expenses - Created expense ${expense.id}`);
    return NextResponse.json(
      { data: expense, error: null, message: 'Gasto cargado' },
      { status: 201 }
    );
  } catch (error) {
    return serverError('[POST] /api/admin/agencia/expenses', error);
  }
}
