import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarCheck,
  MapPin,
  Clock,
  X,
  Search,
  Star,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Users,
  BedDouble,
  Hotel,
} from 'lucide-react';
import { useBookings, useCancelBooking, useCreatePaymentIntent } from '@/hooks/useBookings';
import { useCreateReview } from '@/hooks/useReviews';
import { useTripStore } from '@/stores/tripStore';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentModal } from '@/components/traveller/PaymentModal';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
const ease = [0.16, 1, 0.3, 1] as const;

type FilterTab = 'all' | BookingStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed',      cls: 'bg-emerald-500 text-white' },
  completed: { label: 'Completed',      cls: 'bg-[#e3e3db]/20 text-[#e3e3db]/80 backdrop-blur-sm' },
  cancelled: { label: 'Cancelled',      cls: 'bg-red-900/80 text-red-300' },
  pending:   { label: 'Pending',        cls: 'bg-amber-500 text-[#0e1322]' },
  action:    { label: 'Action Required',cls: 'bg-gold-500 text-[#0e1322]' },
};

// ─── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  bookingId,
  propertyName,
  onClose,
}: {
  bookingId: string;
  propertyName: string;
  onClose: () => void;
}) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { mutate: createReview, isPending, error } = useCreateReview();

  const handleSubmit = () => {
    if (rating === 0) return;
    createReview(
      { booking_id: bookingId, rating, comment: comment.trim() || undefined },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative bg-[#161b2b] border border-white/[0.08] rounded-2xl p-7 max-w-sm w-full shadow-[0_32px_64px_rgba(0,0,0,0.7)]"
      >
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-emerald-400 fill-emerald-400" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-[#e3e3db] mb-2">Review Submitted</h3>
            <p className="text-sm text-[#e3e3db]/50 mb-6">Thank you for sharing your experience.</p>
            <button
              onClick={onClose}
              style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
              className="w-full py-2.5 rounded-xl text-[#0e1322] text-sm font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#25293a] flex items-center justify-center text-[#e3e3db]/50 hover:text-[#e3e3db] transition-colors"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <MessageSquare size={16} className="text-gold-400" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#e3e3db]">Rate {propertyName}</h3>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={cn(
                      'transition-colors',
                      n <= (hovered || rating) ? 'fill-gold-400 text-gold-400' : 'text-[#e3e3db]/15',
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-gold-400 ml-2 font-semibold">
                  {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
                </span>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share what you loved (optional)…"
              className="w-full mt-5 rounded-xl border border-white/[0.10] bg-[#0e1322] px-4 py-3 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/25 outline-none resize-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-all"
            />

            {error && (
              <p className="text-xs text-red-400 mt-2">
                {error instanceof Error ? error.message : 'Failed to submit review'}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isPending}
              style={rating > 0 ? { background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' } : undefined}
              className={cn(
                'w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                rating > 0
                  ? 'text-[#0e1322] hover:shadow-[0_0_20px_rgba(238,192,104,0.3)]'
                  : 'bg-[#25293a] text-[#e3e3db]/25 cursor-not-allowed',
              )}
            >
              {isPending ? 'Submitting…' : 'Submit Review'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Bookings() {
  const [activeTab, setActiveTab]         = useState<FilterTab>('confirmed');
  const [cancellingBooking, setCancellingBooking] = useState<{
    id: string;
    propertyName: string;
    checkIn: string;
    totalPriceCents: number;
    refundPolicy: 'full' | 'partial' | 'none';
  } | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<{ id: string; propertyName: string } | null>(null);
  const [paymentData, setPaymentData]     = useState<{ clientSecret: string; amountCents: number } | null>(null);

  const queryClient = useQueryClient();
  const { data: bookings, isLoading, isError, error } = useBookings(activeTab === 'all' ? undefined : activeTab);
  const { mutate: cancelBooking, isPending }           = useCancelBooking();
  const { mutate: createIntent, isPending: isCreatingIntent } = useCreatePaymentIntent();
  const { removeItem } = useTripStore();

  const handleCancel = () => {
    if (!cancellingBooking) return;
    const booking = bookings?.find((b) => b.id === cancellingBooking.id);
    cancelBooking(cancellingBooking.id, {
      onSuccess: () => {
        setCancellingBooking(null);
        if (booking?.propertyId) removeItem(booking.propertyId);
      },
    });
  };

  const handleCompletePayment = (bookingId: string) => {
    createIntent(bookingId, {
      onSuccess: (data) =>
        setPaymentData({ clientSecret: data.clientSecret, amountCents: data.amountCents }),
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-16">

      {/* ── Page Header ── */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mb-12 pt-2"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gold-500/60" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-400">
            Your Reservations
          </span>
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold tracking-tight text-[#e3e3db] leading-none italic">
          Reservations
        </h1>
        <p className="mt-5 text-[#e3e3db]/50 max-w-xl text-sm md:text-base leading-relaxed">
          Manage your upcoming stays, revisit past journeys, and keep your travel plans in perfect order.
        </p>
      </motion.header>

      {/* ── Filter Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease }}
        className="flex flex-wrap items-center gap-3 mb-10"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={activeTab === key ? { background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' } : undefined}
            className={cn(
              'px-7 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 active:scale-95',
              activeTab === key
                ? 'text-[#0e1322] shadow-[0_0_20px_rgba(238,192,104,0.25)]'
                : 'bg-[#25293a] text-[#e3e3db]/60 hover:bg-[#2f3445] border border-white/[0.08] hover:text-[#e3e3db]',
            )}
          >
            {label}
          </button>
        ))}

        <Link
          to="/search"
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25293a] border border-white/[0.08] text-sm font-medium text-[#e3e3db]/55 hover:text-[#e3e3db] hover:bg-[#2f3445] transition-all"
        >
          <Search size={14} /> New Search
        </Link>
      </motion.div>

      {/* ── Error banner ── */}
      {isError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6 text-sm text-red-400">
          Failed to load bookings: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* ── Booking list ── */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#161b2b] rounded-2xl overflow-hidden flex flex-col lg:flex-row animate-pulse border border-white/[0.05]">
              <div className="lg:w-1/3 h-56 bg-[#25293a]" />
              <div className="lg:w-2/3 p-8 space-y-5">
                <div className="h-7 bg-[#25293a] rounded w-2/3" />
                <div className="h-4 bg-[#25293a] rounded w-1/3" />
                <div className="grid grid-cols-4 gap-4 pt-4">
                  {[1, 2, 3, 4].map((j) => <div key={j} className="h-12 bg-[#25293a] rounded" />)}
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-36 bg-[#25293a] rounded-full" />
                  <div className="h-10 w-24 bg-[#25293a] rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking, i) => {
            const needsPayment   = booking.status === 'confirmed' && !!booking.paymentStatus && booking.paymentStatus !== 'succeeded';
            const isCompleted    = booking.status === 'completed';
            const isCancelled    = booking.status === 'cancelled';
            const hoursUntil     = (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);
            const checkInPassed  = hoursUntil <= 0;
            const canCancel      = booking.status === 'confirmed' && !checkInPassed;
            const refundPolicy: 'full' | 'partial' | 'none' =
              hoursUntil >= 48 ? 'full' : hoursUntil >= 24 ? 'partial' : 'none';

            const badge = needsPayment ? STATUS_BADGE.action : (STATUS_BADGE[booking.status] ?? STATUS_BADGE.pending);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, ease }}
                className={cn(
                  'group bg-[#161b2b] rounded-2xl overflow-hidden flex flex-col lg:flex-row border border-white/[0.05]',
                  'transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65)]',
                  isCompleted && 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0',
                  isCancelled && 'opacity-45 grayscale hover:opacity-60',
                )}
              >
                {/* ── Image panel ── */}
                <div className="lg:w-1/3 h-60 lg:h-auto relative overflow-hidden shrink-0">
                  {booking.property?.thumbnailUrl ? (
                    <img
                      src={booking.property.thumbnailUrl}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      alt={booking.property.name}
                      className={cn(
                        'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110',
                        isCancelled && 'grayscale',
                      )}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#25293a] flex items-center justify-center">
                      <Hotel size={48} className="text-[#e3e3db]/10" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Status badge on image */}
                  <div className="absolute top-5 left-5">
                    <span className={cn(
                      'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg',
                      badge.cls,
                    )}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* ── Content panel ── */}
                <div className="lg:w-2/3 p-7 md:p-10 flex flex-col justify-between">
                  <div>
                    {/* Name + price */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <h3 className={cn(
                          'font-heading text-2xl md:text-3xl font-semibold leading-tight mb-1.5',
                          isCancelled ? 'text-[#e3e3db]/45' : 'text-[#e3e3db]',
                        )}>
                          {booking.property?.name ?? 'Property'}
                        </h3>
                        <p className="text-[#e3e3db]/45 text-sm flex items-center gap-1.5">
                          <MapPin size={12} className="text-gold-500/60 shrink-0" />
                          {booking.property?.city}, {booking.property?.country}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'font-heading text-2xl font-semibold',
                          isCancelled ? 'text-[#e3e3db]/35 line-through' : 'text-gold-400',
                        )}>
                          {formatCurrency(booking.totalPriceCents)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/30 mt-0.5">
                          {isCancelled ? 'Cancelled' : 'Total Stay'}
                        </p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/[0.07]">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/30 mb-1.5">Room Type</p>
                        <p className="text-sm font-medium text-[#e3e3db]/75 flex items-center gap-1.5">
                          <BedDouble size={13} className="text-gold-500/50 shrink-0" />
                          {booking.roomType?.name ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/30 mb-1.5">Check In</p>
                        <p className="text-sm font-medium text-[#e3e3db]/75 flex items-center gap-1.5">
                          <Clock size={13} className="text-gold-500/50 shrink-0" />
                          {formatDate(booking.checkIn, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/30 mb-1.5">Check Out</p>
                        <p className="text-sm font-medium text-[#e3e3db]/75">
                          {formatDate(booking.checkOut, 'MMM d, yyyy')}
                          <span className="text-[#e3e3db]/30 text-xs ml-1.5">· {booking.nights}n</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#e3e3db]/30 mb-1.5">Guests</p>
                        <p className="text-sm font-medium text-[#e3e3db]/75 flex items-center gap-1.5">
                          <Users size={13} className="text-gold-500/50 shrink-0" />
                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex flex-wrap gap-3 mt-7 items-center justify-between">
                    <div className="flex flex-wrap gap-3">

                      {/* Complete Payment */}
                      {needsPayment && (
                        <button
                          onClick={() => handleCompletePayment(booking.id)}
                          disabled={isCreatingIntent}
                          style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[#0e1322] text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(238,192,104,0.25)] active:scale-95 transition-all disabled:opacity-60"
                        >
                          <CreditCard size={13} />
                          {isCreatingIntent ? 'Loading…' : 'Complete Payment'}
                        </button>
                      )}

                      {/* Cancel */}
                      {canCancel && (
                        <button
                          onClick={() => setCancellingBooking({
                            id: booking.id,
                            propertyName: booking.property?.name ?? 'this property',
                            checkIn: booking.checkIn,
                            totalPriceCents: booking.totalPriceCents,
                            refundPolicy,
                          })}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/[0.08] active:scale-95 transition-all"
                        >
                          <X size={13} /> Cancel Booking
                        </button>
                      )}

                      {/* Check-in passed — cannot cancel */}
                      {booking.status === 'confirmed' && checkInPassed && !needsPayment && (
                        <span className="flex items-center gap-1.5 text-xs text-[#e3e3db]/30 px-3 py-2">
                          <ShieldCheck size={12} className="text-gold-500/40" /> Cancellation period closed
                        </span>
                      )}

                      {/* Leave a review */}
                      {isCompleted && (
                        <button
                          onClick={() => setReviewingBooking({ id: booking.id, propertyName: booking.property?.name ?? 'this property' })}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gold-500/25 text-gold-400 text-xs font-semibold hover:bg-gold-500/[0.08] active:scale-95 transition-all"
                        >
                          <Star size={13} /> Leave a Review
                        </button>
                      )}

                      {/* Rebook for cancelled */}
                      {isCancelled && (
                        <Link
                          to={`/hotel/${booking.propertyId}`}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25293a] border border-white/[0.08] text-[#e3e3db]/60 text-xs font-semibold hover:bg-[#2f3445] active:scale-95 transition-all"
                        >
                          Rebook Property
                        </Link>
                      )}
                    </div>

                    {/* View Hotel */}
                    <Link
                      to={`/hotel/${booking.propertyId}`}
                      className="flex items-center gap-1.5 text-sm font-medium text-[#e3e3db]/35 hover:text-gold-400 transition-colors group/link"
                    >
                      View Hotel
                      <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Booking reference */}
                  <p className="text-[10px] font-mono text-[#e3e3db]/18 tracking-widest mt-5">
                    REF #{booking.id.slice(0, 8).toUpperCase()} · Booked {formatDate(booking.bookedAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#25293a] border border-gold-500/[0.15] flex items-center justify-center mb-5">
            <CalendarCheck size={28} className="text-gold-400" />
          </div>
          <h3 className="font-heading text-2xl font-semibold italic text-[#e3e3db] mb-2">
            {activeTab === 'all' ? 'No reservations yet' : `No ${activeTab} reservations`}
          </h3>
          <p className="text-[#e3e3db]/40 text-sm mb-7 max-w-xs leading-relaxed">
            Your next extraordinary stay is waiting. Discover handpicked properties from around the world.
          </p>
          <Link
            to="/search"
            style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[#0e1322] text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_24px_rgba(238,192,104,0.35)] transition-shadow"
          >
            <Search size={14} /> Explore Properties
          </Link>
        </motion.div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {cancellingBooking && (() => {
          const { propertyName, checkIn, totalPriceCents, refundPolicy } = cancellingBooking;
          const refundCents = refundPolicy === 'full' ? totalPriceCents : refundPolicy === 'partial' ? Math.round(totalPriceCents / 2) : 0;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setCancellingBooking(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                className="relative bg-[#161b2b] border border-white/[0.08] rounded-2xl p-7 max-w-sm w-full shadow-[0_32px_64px_rgba(0,0,0,0.7)]"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <X size={22} className="text-red-400" />
                </div>

                {/* Heading */}
                <h3 className="font-heading text-xl font-semibold text-[#e3e3db] text-center mb-1">
                  Cancel Booking
                </h3>
                <p className="text-xs text-[#e3e3db]/40 text-center mb-5">
                  {propertyName} · Check-in {formatDate(checkIn, 'MMM d, yyyy')}
                </p>

                {/* Refund policy panel */}
                {refundPolicy === 'full' && (
                  <div className="flex items-start gap-2.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                    <ShieldCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-400/80 leading-relaxed">
                      <span className="font-semibold text-emerald-400">Full refund of {formatCurrency(refundCents)}.</span>{' '}
                      Amount returned to your original payment method within 5–7 business days.
                    </p>
                  </div>
                )}
                {refundPolicy === 'partial' && (
                  <div className="flex items-start gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                    <ShieldCheck size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-400/80 leading-relaxed">
                      <span className="font-semibold text-amber-400">50% refund — {formatCurrency(refundCents)} returned.</span>{' '}
                      Late cancellation fee applies as check-in is within 48 hours.
                    </p>
                  </div>
                )}
                {refundPolicy === 'none' && (
                  <div className="flex items-start gap-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                    <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-400/80 leading-relaxed">
                      <span className="font-semibold text-red-400">Non-refundable.</span>{' '}
                      No refund will be issued as check-in is within 24 hours. The booking will still be cancelled.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancellingBooking(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.10] text-sm font-medium text-[#e3e3db]/60 hover:bg-[#25293a] transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {isPending ? 'Cancelling…' : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── Review Modal ── */}
      <AnimatePresence>
        {reviewingBooking && (
          <ReviewModal
            bookingId={reviewingBooking.id}
            propertyName={reviewingBooking.propertyName}
            onClose={() => setReviewingBooking(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Payment Modal ── */}
      <PaymentModal
        open={!!paymentData}
        clientSecret={paymentData?.clientSecret ?? ''}
        amountCents={paymentData?.amountCents ?? 0}
        onClose={() => setPaymentData(null)}
        onSuccess={() => {
          setPaymentData(null);
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }}
      />
    </div>
  );
}
