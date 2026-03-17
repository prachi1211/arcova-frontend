import { useState, useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
];

const SELECT_CLASS = 'h-9 rounded-xl border border-warm-200 bg-white px-3 text-sm text-navy-950 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15';

export default function HostBookings() {
  const { data: bookings, isLoading } = useBookings();
  const { data: properties } = useProperties();
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      if (propertyFilter && b.propertyId !== propertyFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      if (dateFrom && b.checkIn < dateFrom) return false;
      if (dateTo && b.checkIn > dateTo) return false;
      return true;
    });
  }, [bookings, propertyFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Bookings" description="All bookings across your properties." />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={propertyFilter} onChange={(e) => { setPropertyFilter(e.target.value); setPage(0); }} className={SELECT_CLASS}>
          <option value="">All Properties</option>
          {properties?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className={SELECT_CLASS}>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          className={SELECT_CLASS}
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          className={SELECT_CLASS}
          placeholder="To"
        />

        {(propertyFilter || statusFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setPropertyFilter(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(0); }}
            className="px-3 py-1.5 rounded-xl border border-warm-200 text-xs text-warm-600 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_80px_100px] gap-4 px-5 py-3 border-b border-warm-100 bg-warm-50">
          {['Property', 'Room', 'Check-In', 'Check-Out', 'Nights', 'Amount', 'Status'].map((h) => (
            <div key={h} className="text-xs font-semibold text-warm-500 uppercase tracking-wide">{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
          </div>
        ) : paged.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings found"
            description="Try adjusting your filters."
          />
        ) : (
          <div className="divide-y divide-warm-100">
            {paged.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_80px_100px] gap-2 md:gap-4 px-5 py-4 hover:bg-warm-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-navy-950 truncate">{b.property?.name ?? '—'}</p>
                  <p className="text-xs text-warm-400 md:hidden">ID: {b.id.slice(0, 8)}…</p>
                </div>
                <p className="text-sm text-warm-700 truncate hidden md:block">{b.roomType?.name ?? '—'}</p>
                <p className="text-sm text-warm-700">{formatDate(b.checkIn, 'MMM d, yyyy')}</p>
                <p className="text-sm text-warm-700 hidden md:block">{formatDate(b.checkOut, 'MMM d, yyyy')}</p>
                <p className="text-sm text-warm-700 hidden md:block">{b.nights}n</p>
                <p className="text-sm font-semibold text-navy-950">{formatCurrency(b.totalPriceCents)}</p>
                <StatusBadge status={b.status as BookingStatus} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-warm-500">{filtered.length} bookings · Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm text-warm-700 disabled:opacity-40 hover:border-warm-300 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm text-warm-700 disabled:opacity-40 hover:border-warm-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
