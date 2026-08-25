'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, BarChart3, Building2, ListChecks } from 'lucide-react';
import { TaskCard } from '@/components/agencia/task-items';
import {
  ADMIN_SURFACE_STYLE,
  AgencyCard,
  EmptyState,
  ListSkeleton,
  MUTED_STYLE,
  StatCard,
} from '@/components/agencia/agency-ui';
import { useAgencyTasks } from '@/lib/use-agency-tasks';
import { useAgencyClients } from '@/lib/use-agency-clients';
import { urgencyOf } from '@/lib/agency/dates';

const SHORTCUTS = [
  { href: '/admin/agencia/tareas', label: 'Tareas', icon: ListChecks },
  { href: '/admin/agencia/clientes', label: 'Clientes', icon: Building2 },
  { href: '/admin/agencia/organico', label: 'Orgánico', icon: BarChart3 },
];

/** Lo primero que ve un admin al entrar: qué se está quemando y dónde ir. */
export function AgencyOverview() {
  const { data, isLoading } = useAgencyTasks({ status: 'PENDING', perPage: 100 });
  const { data: clients = [] } = useAgencyClients();

  const tasks = data?.tasks ?? [];
  const overdue = tasks.filter((task) => urgencyOf(task.dueDate, false) === 'overdue');
  const soon = tasks.filter((task) => {
    const urgency = urgencyOf(task.dueDate, false);
    return urgency === 'today' || urgency === 'soon';
  });

  if (isLoading) return <ListSkeleton rows={3} height="h-24" />;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Pendientes" value={String(tasks.length)} />
        <StatCard label="Vencidas" value={String(overdue.length)} />
        <StatCard label="Clientes activos" value={String(clients.length)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-[hsl(var(--admin-accent))]"
              style={ADMIN_SURFACE_STYLE}
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <Icon className="h-4 w-4" style={{ color: 'hsl(var(--admin-accent))' }} />
                {shortcut.label}
              </span>
              <ArrowRight className="h-4 w-4" style={MUTED_STYLE} />
            </Link>
          );
        })}
      </div>

      <AgencyCard
        title={`Vencidas (${overdue.length})`}
        description="Deberían haberse entregado. El bot de Discord las repite todos los días hasta que se cierren."
      >
        {overdue.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Nada vencido" description="El equipo está al día." />
        ) : (
          <ul className="space-y-2">
            {overdue.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} actions={{}} />
            ))}
          </ul>
        )}
      </AgencyCard>

      {soon.length > 0 && (
        <AgencyCard title={`Vencen en 72 horas (${soon.length})`}>
          <ul className="space-y-2">
            {soon.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} actions={{}} />
            ))}
          </ul>
        </AgencyCard>
      )}
    </div>
  );
}
