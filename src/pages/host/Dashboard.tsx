import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Calendar, TrendingUp, Users, BarChart3, Building2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAnalyticsDashboard, useRevenueTimeSeries, useOccupancyTimeSeries } from '@/hooks/useAnalytics';
import { useRecentBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { KPICard } from '@/components/shared/KPICard';
import { KPICardSkeleton, TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RevenueChart } from '@/components/host/RevenueChart';
import { OccupancyChart } from '@/components/host/OccupancyChart';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BookingStatus } from '@/types';

type Period = '7d' | '30d' | '90d';
const PERIODS: { label: string; value: Period }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

export default function HostDashboard() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('30d');

  const { data: kpis, isLoading: kpisLoading } = useAnalyticsDashboard({ period });
  const { data: revenueData, isLoading: revenueLoading } = useRevenueTimeSeries({ period });
  const { data: occupancyData, isLoading: occupancyLoading } = useOccupancyTimeSeries({ period });
  const { data: recentBookings, isLoading: bookingsLoading } = useRecentBookings(5);
  const { data: properties, isLoading: propertiesLoading } = useProperties();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'Host';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-navy-950">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-warm-500 mt-1">Here's a performance overview of your properties.</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 p-1 bg-warm-100 rounded-xl w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-white text-navy-950 shadow-sm' : 'text-warm-600 hover:text-navy-950'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
        {kpisLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : kpis ? (
          <>
            <KPICard label="Total Revenue" value={formatCurrency(kpis.totalRevenueCents)} icon={DollarSign} iconColor="bg-gold-100" />
            <KPICard label="Net Revenue" value={formatCurrency(kpis.netRevenueCents)} icon={TrendingUp} iconColor="bg-emerald-50" />
            <KPICard label="Total Bookings" value={String(kpis.totalBookings)} icon={Calendar} iconColor="bg-blue-50" />
            <KPICard label="Confirmed" value={String(kpis.confirmedBookings)} icon={Users} iconColor="bg-emerald-50" />
            <KPICard label="Occupancy" value={`${kpis.occupancyRate}%`} icon={BarChart3} iconColor="bg-gold-100" />
            <KPICard label="Avg Daily Rate" value={formatCurrency(kpis.adr)} icon={DollarSign} iconColor="bg-blue-50" />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Revenue chart — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
          <h2 className="font-heading text-base font-semibold text-navy-950 mb-4">Revenue Trend</h2>
          <RevenueChart data={revenueData ?? []} isLoading={revenueLoading} />
        </div>

        {/* Occupancy chart — 1/3 */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
          <h2 className="font-heading text-base font-semibold text-navy-950 mb-4">Occupancy</h2>
          <OccupancyChart data={occupancyData ?? []} isLoading={occupancyLoading} />
          {kpis && (
            <div className="mt-3 text-center">
              <span className="text-2xl font-bold text-navy-950">{kpis.occupancyRate}%</span>
              <p className="text-xs text-warm-500">avg occupancy this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold text-navy-950">Recent Bookings</h2>
            <Link to="/host/bookings" className="text-xs font-medium text-gold-600 hover:text-gold-500 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {bookingsLoading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
            </div>
          ) : !recentBookings || recentBookings.length === 0 ? (
            <p className="text-sm text-warm-400 text-center py-8">No bookings yet</p>
          ) : (
            <div className="divide-y divide-warm-100">
              {recentBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-950 truncate">{b.property?.name ?? 'Property'}</p>
                    <p className="text-xs text-warm-500">
                      {formatDate(b.checkIn, 'MMM d')} – {formatDate(b.checkOut, 'MMM d')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-navy-950">{formatCurrency(b.totalPriceCents)}</span>
                    <StatusBadge status={b.status as BookingStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties quick-access */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold text-navy-950">Properties</h2>
            <Link to="/host/properties" className="text-xs font-medium text-gold-600 hover:text-gold-500 flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {propertiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-warm-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : !properties || properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-warm-400 mb-3">No properties yet</p>
              <Link to="/host/properties/new" className="text-xs font-medium text-gold-600 hover:text-gold-500">
                Add your first property →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {properties.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/host/properties/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-100 shrink-0">
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={16} className="text-warm-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-950 truncate">{p.name}</p>
                    <p className="text-xs text-warm-500">{p.city}, {p.country}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
