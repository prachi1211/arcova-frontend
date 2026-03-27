import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  MapPin,
  ArrowRight,
  CalendarCheck,
  Sparkles,
  Plane,
  CreditCard,
  Hotel,
  Globe2,
  Bot,
  Clock,
  ChevronRight,
  Banknote,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRecentBookings, useTravellerStats } from '@/hooks/useBookings';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Status pill styles ─────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-gold-500/10 text-gold-400 border border-gold-500/20' },
  pending:   { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  no_show:   { label: 'No Show',   cls: 'bg-[#25293a] text-[#e3e3db]/40 border border-white/[0.08]' },
};

export default function TravellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useTravellerStats();
  const { data: recentBookings, isLoading: bookingsLoading } = useRecentBookings(3);

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState('2');
  const today = new Date().toISOString().split('T')[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'Traveller';

  const handleSearch = () => {
    if (!destination.trim()) return;
    const p = new URLSearchParams({ tab: 'hotels', destination, guests });
    if (checkIn) p.set('checkIn', checkIn);
    navigate(`/search?${p.toString()}`);
  };

  const kpis: {
    icon: LucideIcon;
    bgIcon: LucideIcon;
    bgRotate: string;
    bgPosition: string;
    label: string;
    value: string;
    small: boolean;
  }[] = [
    {
      icon: CalendarCheck,
      bgIcon: Plane,
      bgRotate: '-18deg',
      bgPosition: '-bottom-3 -right-3',
      label: 'Upcoming Trips',
      value: statsLoading ? '—' : String(stats?.upcoming ?? 0).padStart(2, '0'),
      small: false,
    },
    {
      icon: MapPin,
      bgIcon: Globe2,
      bgRotate: '0deg',
      bgPosition: '-bottom-5 -right-5',
      label: 'Total Bookings',
      value: statsLoading ? '—' : String(stats?.total ?? 0).padStart(2, '0'),
      small: false,
    },
    {
      icon: CreditCard,
      bgIcon: Banknote,
      bgRotate: '-12deg',
      bgPosition: '-bottom-3 -right-3',
      label: 'Total Spent',
      value: statsLoading ? '—' : formatCurrency(stats?.spent ?? 0),
      small: true,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-12">

      {/* ── Hero Header ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gold-500/60" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-400">Overview</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-[#e3e3db] italic leading-[1.1]">
            {greeting()}, {firstName}.
          </h1>
          <p className="text-[#e3e3db]/50 mt-3 max-w-lg leading-relaxed text-sm">
            Your next journey awaits. Explore upcoming trips, plan new adventures, or let our AI concierge craft your ideal escape.
          </p>
        </div>

        {/* Profile pill */}
        <div className="flex items-center gap-3 bg-[#161b2b] p-2 rounded-full pr-5 border border-white/[0.08] shrink-0 self-start sm:self-auto">
          <div className="w-11 h-11 rounded-full bg-[#25293a] border border-gold-500/20 flex items-center justify-center shrink-0">
            <span className="font-heading text-lg font-semibold text-gold-400">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e3e3db] leading-tight">{user?.fullName ?? firstName}</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-400/70 mt-0.5">Arcova Member</p>
          </div>
        </div>
      </motion.section>

      {/* ── KPI Bento Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, ease }}
            className="relative bg-[#161b2b] rounded-2xl p-7 flex flex-col gap-5 hover:bg-[#25293a] transition-colors duration-300 group cursor-default overflow-hidden"
          >
            {/* Decorative background icon */}
            <kpi.bgIcon
              size={118}
              strokeWidth={0.8}
              style={{ transform: `rotate(${kpi.bgRotate})` }}
              className={cn(
                'absolute pointer-events-none select-none text-gold-500/[0.06] group-hover:text-gold-500/[0.11] transition-colors duration-300',
                kpi.bgPosition,
              )}
            />

            <div className="w-12 h-12 rounded-xl bg-[#25293a] group-hover:bg-[#2f3445] flex items-center justify-center text-gold-400 transition-colors shrink-0 relative z-10">
              <kpi.icon size={20} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/35 mb-2">{kpi.label}</p>
              <p className={cn('font-heading font-semibold text-[#e3e3db]', kpi.small ? 'text-2xl md:text-3xl' : 'text-4xl')}>
                {kpi.value}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── 12-column Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* ── Left: 8 cols ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Recent Journeys */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-semibold text-[#e3e3db]">Recent Journeys</h2>
              <Link
                to="/traveller/bookings"
                className="text-xs uppercase tracking-widest text-gold-400/60 hover:text-gold-400 transition-colors"
              >
                View All →
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#161b2b] rounded-xl p-5 flex items-center gap-5 animate-pulse">
                    <div className="w-20 h-20 rounded-xl bg-[#25293a] shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-[#25293a] rounded w-3/4" />
                      <div className="h-3 bg-[#25293a] rounded w-1/2" />
                      <div className="h-3 bg-[#25293a] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking, i) => {
                  const s = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 + i * 0.07, ease }}
                    >
                      <Link
                        to="/traveller/bookings"
                        className="group bg-[#161b2b] hover:bg-[#25293a] rounded-xl p-5 flex items-center gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                      >
                        {/* Thumbnail — grayscale until hover */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#25293a] flex items-center justify-center">
                          {booking.property?.thumbnailUrl ? (
                            <img
                              src={booking.property.thumbnailUrl}
                              alt={booking.property.name}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.parentElement as HTMLElement).setAttribute('data-fallback', 'true'); }}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                          ) : (
                            <Hotel size={28} className="text-[#e3e3db]/20" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <h3 className="font-heading text-base font-semibold text-[#e3e3db] leading-tight truncate">
                              {booking.property?.name}
                            </h3>
                            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0', s.cls)}>
                              {s.label}
                            </span>
                          </div>
                          <p className="text-[#e3e3db]/45 text-xs flex items-center gap-1.5 mb-2">
                            <MapPin size={10} className="shrink-0 text-gold-500/50" />
                            {booking.property?.city}, {booking.property?.country}
                          </p>
                          <div className="flex items-center gap-2.5 text-xs">
                            <span className="text-[#e3e3db]/40 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(booking.checkIn, 'MMM d')} – {formatDate(booking.checkOut, 'MMM d, yyyy')}
                            </span>
                            <span className="w-px h-3 bg-white/[0.10]" />
                            <span className="font-semibold text-gold-400">{formatCurrency(booking.totalPriceCents)}</span>
                          </div>
                        </div>

                        <ChevronRight size={16} className="text-[#e3e3db]/15 group-hover:text-gold-400 transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-[#161b2b] rounded-xl border border-dashed border-white/[0.07] p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#25293a] border border-gold-500/[0.15] flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck size={22} className="text-gold-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#e3e3db] mb-2">No journeys yet</h3>
                <p className="text-[#e3e3db]/40 text-sm mb-5">Discover your first extraordinary stay.</p>
                <Link
                  to="/search"
                  style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#0e1322] text-xs font-bold uppercase tracking-widest"
                >
                  <Hotel size={13} /> Find Hotels
                </Link>
              </div>
            )}
          </div>

          {/* Cinematic AI CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, ease }}
            className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-center p-10"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e1322] via-[#0e1322]/80 to-transparent" />
            <div className="relative z-10 max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gold-500/15 flex items-center justify-center">
                  <Sparkles size={15} className="text-gold-400" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-semibold">AI-Powered</span>
              </div>
              <h3 className="font-heading text-3xl font-semibold italic text-[#e3e3db] mb-3 leading-tight">
                Plan a Custom Itinerary
              </h3>
              <p className="text-[#e3e3db]/50 text-sm leading-relaxed mb-6">
                Let our AI travel concierge craft a personalised escape tailored to your every preference.
              </p>
              <Link
                to="/traveller/assistant"
                style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[#0e1322] text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_28px_rgba(238,192,104,0.35)] transition-shadow"
              >
                Start Planning <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Right: 4 cols ── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Quick Search widget */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease }}
            className="bg-[#161b2b] rounded-2xl p-6 space-y-4"
          >
            <h3 className="font-heading text-xl font-semibold text-[#e3e3db]">Next Adventure</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#e3e3db]/35 mb-1.5 ml-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Where to next?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-[#0e1322] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/25 border border-white/[0.08] focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#e3e3db]/35 mb-1.5 ml-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-[#0e1322] rounded-xl px-3 py-2.5 text-sm text-[#e3e3db] border border-white/[0.08] focus:outline-none focus:border-gold-500/40 transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#e3e3db]/35 mb-1.5 ml-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-[#0e1322] rounded-xl px-3 py-2.5 text-sm text-[#e3e3db] border border-white/[0.08] focus:outline-none focus:border-gold-500/40 transition-all [color-scheme:dark]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={!destination.trim()}
                className={cn(
                  'w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                  destination.trim()
                    ? 'text-[#0e1322] hover:shadow-[0_0_20px_rgba(238,192,104,0.3)]'
                    : 'bg-[#25293a] text-[#e3e3db]/25 cursor-not-allowed border border-white/[0.06]',
                )}
                style={destination.trim() ? { background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' } : undefined}
              >
                Search Hotels
              </button>
            </div>
          </motion.div>

          {/* AI Concierge card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27, ease }}
            className="bg-[#25293a]/50 backdrop-blur-xl rounded-2xl p-6 space-y-4 border border-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-400 shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#e3e3db]">AI Travel Concierge</h4>
                <p className="text-[10px] text-[#e3e3db]/35 mt-0.5">Always available</p>
              </div>
            </div>

            {/* Concierge message bubble */}
            <div className="bg-[#0e1322] rounded-xl rounded-tl-none border-l-2 border-gold-500/40 px-4 py-3">
              <p className="text-sm text-[#e3e3db]/65 italic leading-relaxed">
                "Where would you like to escape next, {firstName}? I can craft a bespoke itinerary tailored to your exact preferences."
              </p>
            </div>

            <Link
              to="/traveller/assistant"
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#0e1322] border border-white/[0.08] hover:border-gold-500/30 text-sm font-medium transition-all group"
            >
              <span className="text-[#e3e3db]/55 group-hover:text-[#e3e3db]">Chat with concierge</span>
              <ArrowRight size={13} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Quick nav tiles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, ease }}
            className="grid grid-cols-2 gap-3"
          >
            <Link
              to="/traveller/bookings"
              className="group bg-[#161b2b] hover:bg-[#25293a] rounded-xl p-4 flex flex-col gap-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#25293a] group-hover:bg-[#2f3445] flex items-center justify-center text-gold-400 transition-colors">
                <CalendarCheck size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e3e3db]">My Bookings</p>
                <p className="text-[11px] text-[#e3e3db]/40 mt-0.5">View all trips</p>
              </div>
            </Link>
            <Link
              to="/search"
              className="group bg-[#161b2b] hover:bg-[#25293a] rounded-xl p-4 flex flex-col gap-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#25293a] group-hover:bg-[#2f3445] flex items-center justify-center text-gold-400 transition-colors">
                <Plane size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e3e3db]">Find Hotels</p>
                <p className="text-[11px] text-[#e3e3db]/40 mt-0.5">500+ properties</p>
              </div>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
