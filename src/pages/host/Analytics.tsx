import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useAnalyticsDashboard, useRevenueTimeSeries, useOccupancyTimeSeries } from '@/hooks/useAnalytics';
import { KPICard } from '@/components/shared/KPICard';
import { KPICardSkeleton } from '@/components/shared/LoadingSkeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { RevenueChart } from '@/components/host/RevenueChart';
import { OccupancyChart } from '@/components/host/OccupancyChart';
import { formatCurrency } from '@/lib/utils';

type Period = '7d' | '30d' | '90d';
const PERIODS: { label: string; value: Period }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data: kpis, isLoading: kpisLoading } = useAnalyticsDashboard({ period });
  const { data: revenueData, isLoading: revenueLoading } = useRevenueTimeSeries({ period });
  const { data: occupancyData, isLoading: occupancyLoading } = useOccupancyTimeSeries({ period });

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Track revenue, occupancy, and performance metrics."
        actions={
          <div className="flex gap-1 p-1 bg-warm-100 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.value ? 'bg-white text-navy-950 shadow-sm' : 'text-warm-600 hover:text-navy-950'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpisLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : kpis ? (
          <>
            <KPICard label="Total Revenue" value={formatCurrency(kpis.totalRevenueCents)} icon={DollarSign} iconColor="bg-gold-100" />
            <KPICard label="Net Revenue" value={formatCurrency(kpis.netRevenueCents)} icon={TrendingUp} iconColor="bg-emerald-50" />
            <KPICard label="Total Bookings" value={String(kpis.totalBookings)} icon={Calendar} iconColor="bg-blue-50" />
            <KPICard label="Confirmed" value={String(kpis.confirmedBookings)} icon={Calendar} iconColor="bg-emerald-50" />
            <KPICard label="Occupancy" value={`${kpis.occupancyRate}%`} icon={BarChart3} iconColor="bg-gold-100" />
            <KPICard label="RevPAR" value={formatCurrency(kpis.revpar)} icon={DollarSign} iconColor="bg-blue-50" />
          </>
        ) : null}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-base font-semibold text-navy-950 mb-4">Revenue Trend</h2>
        <RevenueChart data={revenueData ?? []} isLoading={revenueLoading} />
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-navy-950">Daily Occupancy</h2>
          {kpis && <span className="text-sm text-warm-500">Avg: <strong className="text-navy-950">{kpis.occupancyRate}%</strong></span>}
        </div>
        <OccupancyChart data={occupancyData ?? []} isLoading={occupancyLoading} />
      </div>
    </div>
  );
}
