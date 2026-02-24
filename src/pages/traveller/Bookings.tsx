import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MapPin, Clock, ChevronRight, X, Search } from 'lucide-react';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { BookingCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

type FilterTab = 'all' | BookingStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useBookings(activeTab === 'all' ? undefined : activeTab);
  const { mutate: cancelBooking, isPending } = useCancelBooking();

  const handleCancel = (id: string) => {
    cancelBooking(id, {
      onSuccess: () => setCancellingId(null),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="My Bookings"
        description="Manage your upcoming trips and view past stays."
        actions={
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
          >
            <Search size={15} />
            New Search
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-warm-100 rounded-xl mb-6 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-warm-500 hover:text-warm-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-warm-200 p-4 md:p-5 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="shrink-0 w-20 md:w-28 h-16 md:h-24 rounded-xl overflow-hidden">
                  <img
                    src={booking.property?.thumbnailUrl}
                    alt={booking.property?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-navy-950 text-sm leading-snug truncate">
                      {booking.property?.name}
                    </h3>
                    <StatusBadge status={booking.status} className="shrink-0" />
                  </div>

                  <p className="text-xs text-warm-500 flex items-center gap-1 mb-2">
                    <MapPin size={11} />
                    {booking.property?.city}, {booking.property?.country}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs text-warm-600 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(booking.checkIn, 'MMM d')} – {formatDate(booking.checkOut, 'MMM d, yyyy')}
                      <span className="text-warm-400">· {booking.nights} nights</span>
                    </span>
                    <span className="text-xs text-warm-600">
                      {booking.roomType?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-100">
                <div>
                  <span className="text-base font-bold text-navy-950">
                    {formatCurrency(booking.totalPriceCents)}
                  </span>
                  <span className="text-xs text-warm-500 ml-1">
                    · Booked {formatDate(booking.bookedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => setCancellingId(booking.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <X size={12} /> Cancel
                    </button>
                  )}
                  <Link
                    to={`/traveller/hotel/${booking.propertyId}`}
                    className="text-xs font-medium text-navy-950 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-200 hover:bg-warm-50 transition-colors"
                  >
                    View hotel <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={activeTab === 'all' ? 'No bookings yet' : `No ${activeTab} bookings`}
          description="Start planning your next getaway."
          action={
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
            >
              <Search size={15} /> Search Hotels
            </Link>
          }
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setCancellingId(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <X size={20} className="text-red-500" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-navy-950 text-center mb-1">
              Cancel Booking
            </h3>
            <p className="text-sm text-warm-500 text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-warm-200 text-sm font-medium text-navy-950 hover:bg-warm-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancellingId)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
