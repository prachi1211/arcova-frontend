import { Link } from 'react-router-dom';
import {
  Users, Building2, CalendarCheck, DollarSign,
  AlertTriangle, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { useAdminStats, useAdminProperties } from '@/hooks/useAdmin';
import { KPICard } from '@/components/shared/KPICard';
import { KPICardSkeleton } from '@/components/shared/LoadingSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import type { PropertyStatus } from '@/types';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingData, isLoading: pendingLoading } = useAdminProperties({ status: 'pending_review', limit: 5 });

  const pendingProperties = pendingData?.results ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-navy-950">
          Admin Dashboard
        </h1>
        <p className="text-sm text-warm-500 mt-1">Platform overview and pending actions.</p>
      </div>

      {/* Pending alert banner */}
      {!statsLoading && (stats?.pendingProperties ?? 0) > 0 && (
        <div className="flex items-center justify-between gap-4 bg-gold-100 border border-gold-300 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-gold-600 shrink-0" />
            <p className="text-sm font-medium text-navy-950">
              <span className="font-bold">{stats!.pendingProperties}</span>{' '}
              {stats!.pendingProperties === 1 ? 'property is' : 'properties are'} waiting for review
            </p>
          </div>
          <Link
            to="/admin/properties?status=pending_review"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors shrink-0"
          >
            Review now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              label="Total Users"
              value={stats?.totalUsers.toLocaleString() ?? '0'}
              icon={Users}
              iconColor="bg-blue-50"
            />
            <KPICard
              label="Hosts"
              value={stats?.totalHosts.toLocaleString() ?? '0'}
              icon={Building2}
              iconColor="bg-purple-50"
            />
            <KPICard
              label="Travellers"
              value={stats?.totalTravellers.toLocaleString() ?? '0'}
              icon={Users}
              iconColor="bg-emerald-50"
            />
            <KPICard
              label="Total Bookings"
              value={stats?.totalBookings.toLocaleString() ?? '0'}
              icon={CalendarCheck}
              iconColor="bg-warm-100"
            />
            <KPICard
              label="Platform Revenue"
              value={formatCurrency((stats?.totalRevenueCents ?? 0) / 100)}
              icon={DollarSign}
              iconColor="bg-gold-100"
            />
          </>
        )}
      </div>

      {/* Properties status summary + pending list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property breakdown */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Properties</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span className="text-sm text-warm-700">Active</span>
              </div>
              <span className="text-sm font-semibold text-navy-950">
                {statsLoading ? '—' : stats?.activeProperties ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-gold-500" />
                <span className="text-sm text-warm-700">Pending Review</span>
              </div>
              <span className="text-sm font-semibold text-navy-950">
                {statsLoading ? '—' : stats?.pendingProperties ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={15} className="text-warm-400" />
                <span className="text-sm text-warm-700">Inactive / Rejected</span>
              </div>
              <span className="text-sm font-semibold text-navy-950">
                {statsLoading ? '—' : stats?.inactiveProperties ?? 0}
              </span>
            </div>
            <div className="pt-3 border-t border-warm-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-warm-700">Total</span>
                <span className="text-sm font-bold text-navy-950">
                  {statsLoading ? '—' : stats?.totalProperties ?? 0}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/admin/properties"
            className="mt-5 flex items-center gap-1.5 text-xs font-medium text-gold-600 hover:text-gold-500 transition-colors"
          >
            Manage properties <ArrowRight size={12} />
          </Link>
        </div>

        {/* Pending properties quick list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-base font-semibold text-navy-950">Awaiting Approval</h2>
            <Link
              to="/admin/properties?status=pending_review"
              className="text-xs font-medium text-gold-600 hover:text-gold-500 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-warm-100 animate-pulse" />
              ))}
            </div>
          ) : pendingProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
              <p className="text-sm font-medium text-navy-950">All caught up!</p>
              <p className="text-xs text-warm-500 mt-1">No properties waiting for review.</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-100">
              {pendingProperties.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3.5 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-950 truncate">{p.name}</p>
                    <p className="text-xs text-warm-500 truncate">
                      {p.city}, {p.country} · by {p.host?.fullName ?? p.host?.email ?? 'Unknown host'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={p.status as PropertyStatus} />
                    <Link
                      to="/admin/properties?status=pending_review"
                      className="text-xs font-medium text-gold-600 hover:text-gold-500 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
