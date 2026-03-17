import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useAdminBookings } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
];

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminBookings({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const bookings = data?.results ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Bookings"
        description="All bookings across the platform."
      />

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(0); }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === tab.value
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-warm-100 animate-pulse bg-warm-50" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description={statusFilter ? `No ${statusFilter} bookings.` : 'No bookings on the platform yet.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[1fr_1fr_120px_120px_80px_120px] gap-4 px-5 py-3 bg-warm-50 border-b border-warm-200 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>Traveller</span>
            <span>Property</span>
            <span>Check-in</span>
            <span>Check-out</span>
            <span>Nights</span>
            <span className="text-right">Amount · Status</span>
          </div>

          <div className="divide-y divide-warm-100">
            {bookings.map((b) => (
              <div key={b.id} className="px-5 py-4">
                {/* Mobile */}
                <div className="lg:hidden space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-950">
                        {b.traveller?.fullName ?? b.traveller?.email ?? '—'}
                      </p>
                      <p className="text-xs text-warm-500">{b.property?.name ?? '—'} · {b.property?.city}</p>
                    </div>
                    <StatusBadge status={b.status as BookingStatus} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-warm-500">
                    <span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                    <span>{b.nights}n</span>
                    <span className="font-semibold text-navy-950">{formatCurrency(b.totalPriceCents / 100)}</span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[1fr_1fr_120px_120px_80px_120px] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-950 truncate">
                      {b.traveller?.fullName ?? '—'}
                    </p>
                    <p className="text-xs text-warm-400 truncate">{b.traveller?.email ?? '—'}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-navy-950 truncate">{b.property?.name ?? '—'}</p>
                    <p className="text-xs text-warm-400 truncate">{b.property?.city}</p>
                  </div>

                  <p className="text-sm text-warm-700">{formatDate(b.checkIn)}</p>
                  <p className="text-sm text-warm-700">{formatDate(b.checkOut)}</p>
                  <p className="text-sm text-warm-700">{b.nights}</p>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-navy-950">
                      {formatCurrency(b.totalPriceCents / 100)}
                    </span>
                    <StatusBadge status={b.status as BookingStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(data?.totalCount ?? 0) > 20 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-warm-100">
              <p className="text-xs text-warm-500">
                Showing {page * 20 + 1}–{Math.min((page + 1) * 20, data!.totalCount)} of {data!.totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasNextPage}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
