import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Star,
  Wifi,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  GlassWater,
  Car,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Clock,
  Check,
  Plus,
  Images,
  PawPrint,
  BedDouble,
} from 'lucide-react';
import { useHotelDetail } from '@/hooks/useSearch';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore, type TripItem } from '@/stores/tripStore';
import { formatCurrency, nightsBetween } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITY_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <Wifi size={16} />, label: 'Free WiFi' },
  pool: { icon: <Waves size={16} />, label: 'Pool' },
  spa: { icon: <Star size={16} />, label: 'Spa & Wellness' },
  gym: { icon: <Dumbbell size={16} />, label: 'Fitness Centre' },
  restaurant: { icon: <UtensilsCrossed size={16} />, label: 'Restaurant' },
  bar: { icon: <GlassWater size={16} />, label: 'Bar & Lounge' },
  parking: { icon: <Car size={16} />, label: 'Parking' },
  beach_access: { icon: <Waves size={16} />, label: 'Beach Access' },
  room_service: { icon: <BedDouble size={16} />, label: 'Room Service' },
  concierge: { icon: <Users size={16} />, label: 'Concierge' },
  airport_shuttle: { icon: <Car size={16} />, label: 'Airport Shuttle' },
  pet_friendly: { icon: <PawPrint size={16} />, label: 'Pet Friendly' },
};

const POLICIES = [
  { label: 'Check-in', value: 'From 3:00 PM' },
  { label: 'Check-out', value: 'Until 11:00 AM' },
  { label: 'Cancellation', value: 'Free cancellation up to 48 hours before arrival' },
  { label: 'Children', value: 'Children of all ages are welcome' },
  { label: 'Pets', value: 'No pets allowed' },
  { label: 'Smoking', value: 'Non-smoking throughout' },
];

// Realistic mock review data per property
const MOCK_REVIEWS: Record<string, { count: number; avg: number }> = {
  'prop-1': { count: 312, avg: 4.9 },
  'prop-2': { count: 189, avg: 4.8 },
  'prop-3': { count: 97, avg: 4.9 },
  'prop-4': { count: 241, avg: 4.7 },
  'prop-5': { count: 163, avg: 4.8 },
  'prop-6': { count: 78, avg: 4.6 },
};

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function GalleryLightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
      >
        <X size={18} className="text-white" />
      </button>

      {/* Counter */}
      <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white/50 tracking-widest">
        {index + 1} / {images.length}
      </span>

      {/* Image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease }}
        className="relative max-w-5xl max-h-[80vh] w-full mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />
      </motion.div>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={22} className="text-white" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronRight size={22} className="text-white" />
      </button>

      {/* Thumbnail strip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              // parent controls index via onPrev/onNext; emit via a direct call isn't available
              // so we just close and reopen isn't ideal — keep thumbnail as visual indicator only
            }}
            className={cn(
              'w-12 h-8 rounded-md overflow-hidden border-2 transition-all flex-shrink-0',
              i === index ? 'border-gold-500 opacity-100' : 'border-transparent opacity-40',
            )}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Gallery skeleton */}
      <div className="hidden lg:grid grid-cols-2 gap-2 h-[500px] rounded-2xl overflow-hidden mb-8">
        <div className="bg-warm-200 rounded-l-2xl" />
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-warm-200" />
          ))}
        </div>
      </div>
      <div className="lg:hidden h-72 rounded-2xl bg-warm-200 mb-8" />

      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-80 bg-warm-200 rounded-lg" />
        <div className="h-4 w-56 bg-warm-200 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-warm-200 rounded-2xl" />
          <div className="h-32 bg-warm-200 rounded-2xl" />
          <div className="h-48 bg-warm-200 rounded-2xl" />
        </div>
        <div className="h-80 bg-warm-200 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem, setPendingItem, setShowAuthGate, isInTrip } = useTripStore();
  const { data, isLoading } = useHotelDetail(id ?? '');

  // Gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Description
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Booking form
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const prevImage = useCallback(() => {
    if (!data) return;
    const images = data.property.imageUrls.length
      ? data.property.imageUrls
      : [data.property.thumbnailUrl];
    setGalleryIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [data]);

  const nextImage = useCallback(() => {
    if (!data) return;
    const images = data.property.imageUrls.length
      ? data.property.imageUrls
      : [data.property.thumbnailUrl];
    setGalleryIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mb-2">
          <MapPin size={28} className="text-warm-400" />
        </div>
        <h2 className="font-heading text-2xl font-semibold text-navy-950">Property not found</h2>
        <p className="text-sm text-warm-500 max-w-xs">
          This property may no longer be available or the link may be incorrect.
        </p>
        <Link
          to="/search"
          className="mt-2 px-6 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const { property, availableRoomTypes, effectivePriceCents, availableRooms } = data;
  const images = property.imageUrls.length ? property.imageUrls : [property.thumbnailUrl];
  // Pad to 5 slots for the mosaic (repeat images if fewer than 5)
  const mosaicImages = Array.from({ length: 5 }, (_, i) => images[i % images.length]);

  const selectedRoom = availableRoomTypes.find((r) => r.id === selectedRoomId);
  const nights = checkIn && checkOut ? Math.max(0, nightsBetween(checkIn, checkOut)) : 0;
  const pricePerNight = selectedRoom?.basePriceCents ?? effectivePriceCents;
  const subtotal = nights > 0 && selectedRoomId ? nights * pricePerNight : 0;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes;

  const reviews = MOCK_REVIEWS[property.id] ?? { count: 124, avg: 4.7 };
  const maxGuests = Math.max(...availableRoomTypes.map((r) => r.maxGuests), 2);
  const lowestPrice = Math.min(...availableRoomTypes.map((r) => r.basePriceCents));

  const inTrip = isInTrip(property.id);

  const handleAddToTrip = () => {
    const item: TripItem = {
      id: property.id,
      type: 'hotel',
      name: property.name,
      subtitle: `${property.city}, ${property.country}${selectedRoom ? ' · ' + selectedRoom.name : ''}`,
      priceCents: selectedRoom?.basePriceCents ?? effectivePriceCents,
      imageUrl: property.thumbnailUrl,
    };
    if (!user) {
      setPendingItem(item);
      setShowAuthGate(true);
    } else {
      addItem(item);
    }
  };

  const handleReserve = () => {
    if (!user) {
      navigate(`/auth/login?redirect=${encodeURIComponent(`/hotel/${id}`)}`);
      return;
    }
    // Mock booking confirmation
    setBookingSuccess(true);
  };

  const inputCls =
    'w-full h-10 rounded-xl border border-warm-200 bg-white text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 transition-all';

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-8">
        {/* ── Back ─────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-navy-950 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to results
        </button>

        {/* ── Gallery mosaic (desktop) ──────────────────────────── */}
        <div className="hidden lg:grid grid-cols-2 gap-2 h-[500px] rounded-2xl overflow-hidden mb-8 group">
          {/* Large hero image */}
          <button onClick={() => openGallery(0)} className="relative overflow-hidden">
            <img
              src={mosaicImages[0]}
              alt={property.name}
              className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-500"
            />
          </button>

          {/* 2×2 thumbnail grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {[1, 2, 3, 4].map((pos) => {
              const isLast = pos === 4;
              const extraCount = images.length - 4;
              return (
                <button
                  key={pos}
                  onClick={() => openGallery(pos % images.length)}
                  className="relative overflow-hidden"
                >
                  <img
                    src={mosaicImages[pos]}
                    alt={`Photo ${pos + 1}`}
                    className="w-full h-full object-cover hover:brightness-90 transition-all duration-300"
                  />
                  {/* "Show all photos" overlay on last cell */}
                  {isLast && extraCount > 0 && (
                    <div className="absolute inset-0 bg-navy-950/55 flex flex-col items-center justify-center gap-2">
                      <Images size={22} className="text-white" />
                      <span className="text-white text-sm font-semibold">+{extraCount} photos</span>
                    </div>
                  )}
                  {isLast && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] bg-white/90 text-navy-950 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Images size={11} /> Show all photos
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Gallery carousel (mobile) ─────────────────────────── */}
        <div className="lg:hidden relative h-72 rounded-2xl overflow-hidden mb-6">
          <img
            src={images[galleryIndex]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-navy-950/70 backdrop-blur-sm rounded-full px-2.5 py-1">
            {Array.from({ length: property.starRating }).map((_, i) => (
              <Star key={i} size={10} className="fill-gold-400 text-gold-400" />
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-navy-950/60 text-white flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setGalleryIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-navy-950/60 text-white flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === galleryIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Property header ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-navy-950 tracking-tight leading-tight mb-3">
            {property.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: property.starRating }).map((_, i) => (
                <Star key={i} size={13} className="fill-gold-400 text-gold-400" />
              ))}
              <span className="text-xs text-warm-500 ml-1">{property.starRating}-star</span>
            </div>
            <span className="text-warm-300">·</span>
            {/* Rating */}
            <span className="font-semibold text-navy-950">{reviews.avg}</span>
            <span className="text-warm-500">({reviews.count} reviews)</span>
            <span className="text-warm-300">·</span>
            {/* Location */}
            <span className="flex items-center gap-1 text-warm-600">
              <MapPin size={13} />
              {property.city}, {property.country}
            </span>
          </div>
        </motion.div>

        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          {/* LEFT — content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-navy-950 mb-3">
                About this property
              </h2>
              <p
                className={cn(
                  'text-sm text-warm-700 leading-relaxed transition-all',
                  !showFullDesc && 'line-clamp-4',
                )}
              >
                {property.description}
              </p>
              {property.description.length > 220 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-sm font-semibold text-gold-600 hover:text-gold-500 mt-3 transition-colors"
                >
                  {showFullDesc ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </div>

            {/* Highlights strip */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Shield,
                  title: 'Free cancellation',
                  sub: 'Up to 48h before arrival',
                },
                {
                  icon: Clock,
                  title: 'Flexible check-in',
                  sub: 'From 3:00 PM · Out by 11:00 AM',
                },
                {
                  icon: Users,
                  title: `Up to ${maxGuests} guests`,
                  sub: `${availableRooms} room${availableRooms !== 1 ? 's' : ''} available`,
                },
              ].map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 bg-white rounded-2xl border border-warm-200 p-4 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-gold-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-950">{title}</p>
                    <p className="text-xs text-warm-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-navy-950 mb-5">
                What's included
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((a) => {
                  const item = AMENITY_MAP[a];
                  if (!item) return null;
                  return (
                    <div key={a} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-500">{item.icon}</span>
                      </div>
                      <span className="text-sm text-warm-700">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room types */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-navy-950 mb-4">
                Available rooms
              </h2>
              <div className="space-y-3">
                {availableRoomTypes.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const scarce = room.totalRooms <= 3;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(isSelected ? null : room.id)}
                      className={cn(
                        'w-full text-left bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200',
                        isSelected
                          ? 'border-gold-500 ring-2 ring-gold-500/20 shadow-md'
                          : 'border-warm-200 hover:border-warm-300 hover:shadow-md',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-navy-950 text-sm">{room.name}</h3>
                            {scarce && (
                              <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                Only {room.totalRooms} left!
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-warm-500 mb-3 leading-relaxed">
                            {room.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-warm-500">
                            <span className="flex items-center gap-1">
                              <Users size={11} /> Up to {room.maxGuests} guests
                            </span>
                            <span className="text-warm-300">·</span>
                            <span>{room.totalRooms} rooms</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-navy-950">
                            {formatCurrency(room.basePriceCents)}
                          </p>
                          <p className="text-xs text-warm-400">per night</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-warm-100 flex items-center gap-1.5">
                          <Check size={13} className="text-gold-500" />
                          <span className="text-xs font-semibold text-gold-600">
                            Selected — reflected in booking widget
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-navy-950 mb-5">
                Property policies
              </h2>
              <div className="space-y-0 divide-y divide-warm-100">
                {POLICIES.map(({ label, value }) => (
                  <div key={label} className="flex gap-6 py-3.5">
                    <span className="text-xs font-semibold text-warm-500 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                      {label}
                    </span>
                    <span className="text-sm text-warm-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-warm-200 shadow-lg overflow-hidden">
              <AnimatePresence mode="wait">
                {bookingSuccess ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="p-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5"
                    >
                      <Check size={28} className="text-emerald-600" />
                    </motion.div>
                    <h3 className="font-heading text-xl font-semibold text-navy-950 mb-1">
                      Booking Confirmed!
                    </h3>
                    <p className="text-sm text-warm-500 leading-relaxed mb-2">
                      <span className="font-medium text-navy-950">{property.name}</span>
                    </p>
                    {selectedRoom && (
                      <p className="text-xs text-warm-400 mb-1">{selectedRoom.name}</p>
                    )}
                    {nights > 0 && (
                      <p className="text-xs text-warm-400 mb-6">
                        {checkIn} → {checkOut} · {nights} night{nights !== 1 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-xs text-warm-400 mb-6">
                      A confirmation has been sent to your email.
                    </p>
                    <div className="space-y-2.5">
                      <Link
                        to="/traveller/bookings"
                        className="flex items-center justify-center w-full h-11 rounded-xl bg-navy-950 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
                      >
                        View My Bookings
                      </Link>
                      <button
                        onClick={() => {
                          setBookingSuccess(false);
                          setSelectedRoomId(null);
                          setCheckIn('');
                          setCheckOut('');
                        }}
                        className="w-full h-11 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
                      >
                        Book another room
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Booking form ── */
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Price header */}
                    <div className="px-5 pt-5 pb-4 border-b border-warm-100">
                      <p className="text-xs text-warm-400 font-medium mb-0.5">Starting from</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-navy-950">
                          {formatCurrency(lowestPrice)}
                        </span>
                        <span className="text-sm text-warm-500">/ night</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                            Check-in
                          </label>
                          <div className="relative">
                            <Calendar
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                            />
                            <input
                              type="date"
                              value={checkIn}
                              onChange={(e) => {
                                setCheckIn(e.target.value);
                                if (checkOut && e.target.value >= checkOut) setCheckOut('');
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className={`${inputCls} pl-8 text-xs`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                            Check-out
                          </label>
                          <div className="relative">
                            <Calendar
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                            />
                            <input
                              type="date"
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              min={checkIn || new Date().toISOString().split('T')[0]}
                              className={`${inputCls} pl-8 text-xs`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Guests */}
                      <div>
                        <label className="block text-[11px] font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                          Guests
                        </label>
                        <div className="relative">
                          <Users
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                          />
                          <select
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            className={`${inputCls} pl-8 appearance-none`}
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Room required hint */}
                      {!selectedRoomId && (
                        <p className="text-xs text-warm-400 text-center py-1">
                          ↑ Select a room type above to continue
                        </p>
                      )}

                      {/* Selected room summary */}
                      {selectedRoom && (
                        <div className="bg-gold-50 rounded-xl p-3.5 border border-gold-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gold-700">
                              {selectedRoom.name}
                            </p>
                            <button
                              onClick={() => setSelectedRoomId(null)}
                              className="text-warm-400 hover:text-warm-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-navy-950">
                            {formatCurrency(selectedRoom.basePriceCents)}
                            <span className="text-xs font-normal text-warm-500"> /night</span>
                          </p>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <AnimatePresence>
                        {subtotal > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-warm-50 rounded-xl p-3.5 space-y-2 text-sm">
                              <div className="flex justify-between text-warm-600">
                                <span>
                                  {formatCurrency(pricePerNight)} × {nights} night
                                  {nights !== 1 ? 's' : ''}
                                </span>
                                <span>{formatCurrency(subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-warm-600">
                                <span>Taxes &amp; fees (~15%)</span>
                                <span>{formatCurrency(taxes)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-navy-950 pt-2 border-t border-warm-200">
                                <span>Estimated total</span>
                                <span>{formatCurrency(total)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* CTAs */}
                      <div className="space-y-2.5 pt-1">
                        {/* Add to Trip */}
                        <button
                          onClick={handleAddToTrip}
                          disabled={inTrip}
                          className={cn(
                            'w-full h-11 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                            inTrip
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default'
                              : 'border-navy-950 text-navy-950 hover:bg-navy-950 hover:text-white',
                          )}
                        >
                          {inTrip ? (
                            <>
                              <Check size={14} /> Added to Trip
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Add to Trip
                            </>
                          )}
                        </button>

                        {/* Reserve Now */}
                        <button
                          onClick={handleReserve}
                          disabled={!selectedRoomId || !checkIn || !checkOut}
                          className="w-full h-11 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                          {!selectedRoomId
                            ? 'Select a Room'
                            : !checkIn || !checkOut
                              ? 'Choose Dates'
                              : user
                                ? 'Reserve Now'
                                : 'Sign in to Reserve'}
                        </button>
                      </div>

                      <p className="text-[11px] text-center text-warm-400">
                        No charge until check-in · Free cancellation
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery lightbox ──────────────────────────────────────── */}
      <AnimatePresence>
        {galleryOpen && (
          <GalleryLightbox
            images={images}
            index={galleryIndex}
            onClose={() => setGalleryOpen(false)}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
