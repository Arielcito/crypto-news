'use client';

import { useState } from 'react';
import { Link2Off, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowersChart } from '@/components/agencia/followers-chart';
import { PiecesTable } from '@/components/agencia/pieces-table';
import {
  AGENCY_SELECT_CLASS,
  AgencyCard,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
  StatCard,
} from '@/components/agencia/agency-ui';
import { useOrganicMetrics, useSyncSocial } from '@/lib/use-agency-metrics';
import { useAgencyClients } from '@/lib/use-agency-clients';
import { formatDateTimeAr } from '@/lib/agency/dates';
import {
  NETWORK_LABELS,
  VALID_RANGES,
  formatMetric,
  formatPercent,
} from '@/lib/types/agency';
import type { MetricsRange } from '@/lib/types/agency';

const RANGE_LABELS: Record<MetricsRange, string> = {
  7: '7 días',
  28: '28 días',
  90: '90 días',
};

export function OrganicDashboard({
  canManage,
  initialClientId,
}: {
  canManage: boolean;
  initialClientId?: number;
}) {
  const [days, setDays] = useState<MetricsRange>(28);
  const [clientId, setClientId] = useState<number | undefined>(initialClientId);

  const { data: clients = [] } = useAgencyClients();
  const { data: metrics, isLoading, isError, error } = useOrganicMetrics(days, clientId);
  const syncMutation = useSyncSocial();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'No se pudo sincronizar');
          return;
        }
        const { posts, postReadings, accountReadings } = response.data;
        toast.success(
          `Sincronizado: ${posts} piezas, ${postReadings} lecturas de pieza, ${accountReadings} de cuenta`
        );
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al sincronizar'),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div
            className="inline-flex rounded-md border p-0.5"
            style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
            role="group"
            aria-label="Rango de fechas"
          >
            {VALID_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: days === range ? 'hsl(var(--admin-accent) / 0.14)' : 'transparent',
                  color:
                    days === range ? 'hsl(var(--admin-accent))' : 'hsl(var(--admin-muted-foreground))',
                }}
              >
                {RANGE_LABELS[range]}
              </button>
            ))}
          </div>

          <select
            className={`${AGENCY_SELECT_CLASS} sm:w-56`}
            value={clientId ?? ''}
            onChange={(event) => setClientId(event.target.value ? Number(event.target.value) : undefined)}
            aria-label="Filtrar por cliente"
          >
            <option value="">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="shrink-0"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar ahora'}
          </Button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} height="h-24" />
      ) : isError ? (
        <ErrorNote error={error} resource="las métricas" />
      ) : !metrics ? (
        <ErrorNote error={new Error('respuesta vacía')} resource="las métricas" />
      ) : !metrics.configured ? (
        <EmptyState
          icon={Link2Off}
          title="No hay cuentas conectadas"
          description="Conectá las redes del cliente desde su ficha para empezar a medir."
        />
      ) : !metrics.hasData ? (
        <EmptyState
          icon={RefreshCw}
          title="Todavía no se sincronizó nada"
          description="Las cuentas están conectadas pero no hay lecturas guardadas. Corré una sincronización o esperá al próximo cron."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.accounts.map((account) => (
              <StatCard
                key={account.profileId}
                network={account.network}
                label={`${NETWORK_LABELS[account.network]} · seguidores`}
                value={formatMetric(account.current?.followers ?? null)}
                delta={account.followersGained}
              />
            ))}
          </div>

          <AgencyCard
            title="Evolución de seguidores"
            description={`Del ${metrics.from.slice(0, 10)} al ${metrics.to.slice(0, 10)}.`}
          >
            <FollowersChart series={metrics.series} />
          </AgencyCard>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Piezas medidas" value={String(metrics.totals.pieces)} />
            <StatCard label="Impresiones" value={formatMetric(metrics.totals.impressions)} />
            <StatCard label="Interacciones" value={formatMetric(metrics.totals.interactions)} />
            <StatCard
              label="Engagement"
              value={formatPercent(metrics.totals.engagement)}
              hint={
                metrics.totals.interactionsPerPiece !== null
                  ? `${metrics.totals.interactionsPerPiece.toFixed(1)} interacciones por pieza`
                  : undefined
              }
            />
          </div>

          <AgencyCard title="Piezas" description="Ordenadas por interacciones de su última lectura.">
            <Tabs defaultValue="top">
              <TabsList>
                <TabsTrigger value="top">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Mejores
                </TabsTrigger>
                <TabsTrigger value="worst">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Peores
                </TabsTrigger>
              </TabsList>
              <TabsContent value="top" className="mt-4">
                <PiecesTable rows={metrics.top} />
              </TabsContent>
              <TabsContent value="worst" className="mt-4">
                <PiecesTable rows={metrics.worst} />
                <p className="mt-3 text-xs" style={MUTED_STYLE}>
                  Sólo entran piezas con lectura: una pieza sin medir no es una pieza mala.
                </p>
              </TabsContent>
            </Tabs>
          </AgencyCard>

          <p className="text-xs" style={MUTED_STYLE}>
            {metrics.syncedAt
              ? `Última sincronización: ${formatDateTimeAr(metrics.syncedAt)}`
              : 'Sin sincronizaciones registradas'}
          </p>
        </>
      )}
    </div>
  );
}
