'use client';

import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_SURFACE_STYLE, MUTED_STYLE } from '@/components/agencia/agency-ui';
import {
  calendarDays,
  currentMonthAr,
  formatMonthKey,
  formatMonthLabel,
  isoDay,
  parseMonth,
  toDateInput,
} from '@/lib/agency/dates';
import { CONTENT_KINDS, SPONSORSHIP_LABELS, contentKindOf } from '@/lib/types/agency';
import type { AgencyTask } from '@/lib/types/agency';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const dayLabel = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

function TaskChip({
  task,
  onSelect,
  roomy = false,
}: {
  task: AgencyTask;
  onSelect: (task: AgencyTask) => void;
  /** En mobile el chip es el blanco táctil: más alto y con letra legible. */
  roomy?: boolean;
}) {
  const kind = contentKindOf(task.format);
  const done = task.status === 'DONE';
  const cancelled = task.status === 'CANCELLED';
  const sponsorship = task.sponsorship ? ` · ${SPONSORSHIP_LABELS[task.sponsorship]}` : '';
  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      title={`${task.title} · ${task.package.client.name} · ${task.format}${sponsorship}`}
      className={`flex w-full min-w-0 items-center gap-1.5 rounded-md text-left transition-[filter] duration-150 ease-out hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${
        roomy ? 'px-3 py-2.5 text-sm' : 'px-1.5 py-1 text-xs'
      } ${cancelled ? 'line-through opacity-50' : done ? 'opacity-60' : ''}`}
      style={{ backgroundColor: `${kind.color}1F`, boxShadow: `inset 3px 0 0 ${kind.color}` }}
    >
      {done && <Check className="h-3 w-3 shrink-0" aria-label="Publicada" />}
      <span className="truncate">
        <span className="font-medium">{task.package.client.name}</span> · {task.title}
      </span>
    </button>
  );
}

export function TaskCalendar({
  tasks,
  month,
  onMonthChange,
  onSelect,
}: {
  tasks: AgencyTask[];
  /** Primer día del mes en UTC. */
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelect: (task: AgencyTask) => void;
}) {
  const { days } = calendarDays(month);
  const monthKey = formatMonthKey(month);
  const today = toDateInput(new Date());

  // El vencimiento se agrupa por día argentino: 23:59 AR del 15 es el 16 en UTC.
  const byDay = new Map<string, AgencyTask[]>();
  for (const task of tasks) {
    const key = toDateInput(new Date(task.dueDate));
    byDay.set(key, [...(byDay.get(key) ?? []), task]);
  }

  const monthTasks = tasks.filter((task) => toDateInput(new Date(task.dueDate)).startsWith(monthKey));
  const kindCounts = CONTENT_KINDS.map((entry) => ({
    ...entry,
    count: monthTasks.filter((task) => contentKindOf(task.format).kind === entry.kind).length,
  })).filter((entry) => entry.count > 0);
  const organic = monthTasks.filter((task) => task.sponsorship === 'ORGANIC').length;
  const paid = monthTasks.filter((task) => task.sponsorship === 'PAID').length;
  const agendaDays = days.filter((day) => isoDay(day).startsWith(monthKey) && byDay.has(isoDay(day)));

  const shift = (delta: number) =>
    onMonthChange(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + delta, 1)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="Mes anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-admin min-w-[10ch] text-center text-lg font-semibold capitalize">
            {formatMonthLabel(month)}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => shift(1)} aria-label="Mes siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2" onClick={() => onMonthChange(parseMonth(currentMonthAr()))}>
            Hoy
          </Button>
        </div>
        {(organic > 0 || paid > 0) && (
          <p className="text-sm" style={MUTED_STYLE}>
            Orgánico {organic} · Publicitario {paid}
          </p>
        )}
      </div>

      {kindCounts.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Tipos de contenido del mes">
          {kindCounts.map((entry) => (
            <li key={entry.kind} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label} <span style={MUTED_STYLE}>{entry.count}</span>
            </li>
          ))}
        </ul>
      )}

      <motion.div
        key={monthKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
      >
        {/* Mobile: agenda. Siete columnas en 360 px dejan chips de 40 px ilegibles. */}
        <div className="space-y-5 md:hidden">
          {agendaDays.length === 0 ? (
            <p className="text-sm" style={MUTED_STYLE}>
              No hay tareas que venzan este mes.
            </p>
          ) : (
            agendaDays.map((day) => (
              <section key={isoDay(day)}>
                <h3
                  className="mb-2 text-sm font-medium capitalize"
                  style={isoDay(day) === today ? { color: 'hsl(var(--admin-accent))' } : undefined}
                >
                  {dayLabel.format(day)}
                </h3>
                <div className="space-y-2">
                  {(byDay.get(isoDay(day)) ?? []).map((task) => (
                    <TaskChip key={task.id} task={task} onSelect={onSelect} roomy />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-lg border md:block" style={ADMIN_SURFACE_STYLE}>
          <div className="grid grid-cols-7 text-xs font-medium" style={MUTED_STYLE}>
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="px-2 py-2">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = isoDay(day);
              const outside = !key.startsWith(monthKey);
              return (
                <div
                  key={key}
                  className="min-h-28 space-y-1 border-t p-1.5"
                  style={{
                    borderColor: 'hsl(var(--admin-surface-border))',
                    opacity: outside ? 0.45 : 1,
                  }}
                >
                  <span
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs tabular-nums"
                    style={
                      key === today
                        ? { backgroundColor: 'hsl(var(--admin-accent))', color: 'white' }
                        : MUTED_STYLE
                    }
                  >
                    {day.getUTCDate()}
                  </span>
                  {(byDay.get(key) ?? []).map((task) => (
                    <TaskChip key={task.id} task={task} onSelect={onSelect} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
