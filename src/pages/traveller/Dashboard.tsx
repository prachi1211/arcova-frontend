import { Link } from 'react-router-dom';
import { Search, Sparkles, CalendarCheck, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRecentBookings, useTravellerStats } from '@/hooks/useBookings';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { KPICardSkeleton, BookingCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TravellerDashboard() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useTravellerStats();
  const { data: recentBookings, isLoading: bookingsLoading } = useRecentBookings(3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'Traveller';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-navy-950">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-warm-500 mt-1">
          Here&apos;s a summary of your travel plans and bookings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statsLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          <>
            <KPICard
              label="Upcoming Trips"
              value={String(stats?.upcoming ?? 0)}
              icon={CalendarCheck}
              iconColor="bg-emerald-50"
            />
            <KPICard
              label="Total Bookings"
              value={String(stats?.total ?? 0)}
              icon={MapPin}
              iconColor="bg-blue-50"
            />
            <KPICard
              label="Total Spent"
              value={formatCurrency(stats?.spent ?? 0)}
              icon={Search}
              iconColor="bg-gold-100"
              className="col-span-2 md:col-span-1"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Search */}
        <Link
          to="/search"
          className="group bg-navy-950 rounded-2xl p-6 flex items-center justify-between hover:bg-navy-900 transition-colors"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-3">
              <Search size={18} className="text-gold-400" />
            </div>
            <h3 className="font-semibold text-white mb-0.5">Find a Hotel</h3>
            <p className="text-sm text-white/50">Search 500+ properties worldwide</p>
          </div>
          <ArrowRight size={18} className="text-white/30 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* AI Assistant */}
        <Link
          to="/traveller/assistant"
          className="group bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-6 flex items-center justify-between hover:from-gold-400 hover:to-gold-500 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-navy-950/10 flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-navy-950" />
            </div>
            <h3 className="font-semibold text-navy-950 mb-0.5">Plan with AI</h3>
            <p className="text-sm text-navy-950/60">Get a personalised itinerary</p>
          </div>
          <ArrowRight size={18} className="text-navy-950/30 group-hover:text-navy-950/70 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-navy-950">Recent Bookings</h2>
          <Link
            to="/traveller/bookings"
            className="text-sm font-medium text-gold-600 hover:text-gold-500 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            <BookingCardSkeleton />
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </div>
        ) : recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-warm-200 p-4 md:p-5 flex gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Hotel image */}
                <div className="shrink-0 w-20 md:w-24 h-16 md:h-20 rounded-xl overflow-hidden">
                  <img
                    src={booking.property?.thumbnailUrl}
                    alt={booking.property?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-navy-950 text-sm truncate">
                      {booking.property?.name}
                    </h3>
                    <StatusBadge status={booking.status} className="shrink-0" />
                  </div>
                  <p className="text-xs text-warm-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={11} />
                    {booking.property?.city}, {booking.property?.country}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-warm-500 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(booking.checkIn, 'MMM d')} – {formatDate(booking.checkOut, 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs font-semibold text-navy-950">
                      {formatCurrency(booking.totalPriceCents)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings yet"
            description="Start planning your next adventure."
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
      </div>
    </div>
  );
}
