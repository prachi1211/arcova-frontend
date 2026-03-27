import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Hotel,
  Plane,
  Car,
  Search as SearchIcon,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeftRight,
  Star,
  Wifi,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Fuel,
  Info,
  SlidersHorizontal,
  X,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { useSearchHotels } from '@/hooks/useSearch';
import { useFlights, type Flight } from '@/hooks/useFlights';
import { useCars, type CarRental } from '@/hooks/useCars';
import { useTripStore, type TripItem } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, cn, nightsBetween } from '@/lib/utils';
import type { SearchResult, SearchParams } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'hotels' | 'flights' | 'cars';
type TripType = 'one-way' | 'round-trip';
type DriverAge = 'under-25' | '25-65' | 'over-65';
type FlightClass = 'Economy' | 'Business' | 'First';

// ─── Constants ────────────────────────────────────────────────────────────────
const HOTELS_PER_PAGE = 6;
const FLIGHTS_PER_PAGE = 5;
const CARS_PER_PAGE = 6;
const PRICE_MAX = 200000; // $2,000 max for price filter slider

const MOOD_FILTERS = [
  { label: 'Beach', emoji: '🌊', destination: 'Maldives' },
  { label: 'City', emoji: '🏙', destination: 'Paris' },
  { label: 'Mountain', emoji: '⛰', destination: 'Zermatt' },
  { label: 'Culture', emoji: '🏛', destination: 'Kyoto' },
  { label: 'Wellness', emoji: '🌿', destination: 'Santorini' },
  { label: 'Winter', emoji: '❄', destination: 'Zermatt' },
];

const POPULAR_ROUTES = [
  { from: 'New York', fromCode: 'JFK', to: 'London', toCode: 'LHR', price: '~$480' },
  { from: 'Dubai', fromCode: 'DXB', to: 'Paris', toCode: 'CDG', price: '~$620' },
  { from: 'Los Angeles', fromCode: 'LAX', to: 'Kyoto', toCode: 'KIX', price: '~$390' },
  { from: 'London', fromCode: 'LHR', to: 'Maldives', toCode: 'MLE', price: '~$720' },
];

const AMENITY_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <Wifi size={12} />, label: 'WiFi' },
  pool: { icon: <Waves size={12} />, label: 'Pool' },
  spa: { icon: <Star size={12} />, label: 'Spa' },
  gym: { icon: <Dumbbell size={12} />, label: 'Gym' },
  restaurant: { icon: <UtensilsCrossed size={12} />, label: 'Restaurant' },
  bar: { icon: <UtensilsCrossed size={12} />, label: 'Bar' },
  concierge: { icon: <Users size={12} />, label: 'Concierge' },
  beach_access: { icon: <Waves size={12} />, label: 'Beach' },
  airport_shuttle: { icon: <Car size={12} />, label: 'Shuttle' },
};

const AMENITY_FILTER_OPTIONS = [
  { key: 'pool', label: 'Pool' },
  { key: 'spa', label: 'Spa' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'gym', label: 'Gym' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'concierge', label: 'Concierge' },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// ─── Skeleton Components ──────────────────────────────────────────────────────

function HotelSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-[#25293a] rounded-2xl mb-5" />
      <div className="space-y-3">
        <div className="h-5 bg-[#25293a] rounded w-3/4" />
        <div className="h-4 bg-[#25293a] rounded w-1/2" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-14 bg-[#25293a] rounded" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="h-6 bg-[#25293a] rounded w-24" />
          <div className="h-9 w-28 bg-[#25293a] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function FlightSkeleton() {
  return (
    <div className="bg-[#25293a] rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-[#2f3445] rounded w-36" />
        <div className="h-6 bg-[#2f3445] rounded-full w-20" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-[#2f3445] rounded w-20" />
          <div className="h-4 bg-[#2f3445] rounded w-14" />
        </div>
        <div className="flex-1 mx-8 h-px bg-[#2f3445]" />
        <div className="space-y-2 text-right">
          <div className="h-7 bg-[#2f3445] rounded w-20" />
          <div className="h-4 bg-[#2f3445] rounded w-14" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 bg-[#2f3445] rounded w-28" />
        <div className="h-9 w-28 bg-[#2f3445] rounded-xl" />
      </div>
    </div>
  );
}

function CarSkeleton() {
  return (
    <div className="bg-[#25293a] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-[#2f3445]" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-[#2f3445] rounded w-2/3" />
        <div className="h-4 bg-[#2f3445] rounded w-1/3" />
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-6 w-14 bg-[#2f3445] rounded" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-[#2f3445] rounded w-20" />
          <div className="h-9 w-28 bg-[#2f3445] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalItems: number;
  perPage: number;
  onChange: (page: number) => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

function Pagination({ page, totalItems, perPage, onChange, resultsRef }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / perPage);
  if (totalPages <= 1) return null;

  const handleChange = (p: number) => {
    onChange(p);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => handleChange(page - 1)}
        disabled={page === 0}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#e3e3db]/60 border border-white/[0.08] bg-[#25293a] hover:bg-[#2f3445] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} /> Prev
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
          <button
            key={p}
            onClick={() => handleChange(p)}
            className={cn(
              'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
              p === page
                ? 'bg-gold-500 text-[#0e1322] shadow-[0_0_12px_rgba(212,168,83,0.35)]'
                : 'bg-[#25293a] border border-white/[0.08] text-[#e3e3db]/50 hover:bg-[#2f3445]',
            )}
          >
            {p + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => handleChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#e3e3db]/60 border border-white/[0.08] bg-[#25293a] hover:bg-[#2f3445] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─── Add to Trip Button ───────────────────────────────────────────────────────

function AddToTripButton({ item, onAdd, inTrip }: { item: TripItem; onAdd: (item: TripItem) => void; inTrip: boolean }) {
  return (
    <button
      onClick={() => !inTrip && onAdd(item)}
      style={!inTrip ? { background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' } : undefined}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
        inTrip
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
          : 'text-[#0e1322] hover:shadow-[0_0_16px_rgba(212,168,83,0.3)]',
      )}
    >
      {inTrip ? <Check size={14} /> : <Plus size={14} />}
      {inTrip ? 'Added' : 'Add to Trip'}
    </button>
  );
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────

function HotelCard({ result, onAdd, isInTrip }: { result: SearchResult; onAdd: (item: TripItem) => void; isInTrip: (id: string) => boolean }) {
  const { property, effectivePriceCents, availableRooms } = result;
  const inTrip = isInTrip(property.id);
  const item: TripItem = {
    id: property.id,
    type: 'hotel',
    name: property.name,
    subtitle: `${property.city}, ${property.country}`,
    priceCents: effectivePriceCents,
    imageUrl: property.thumbnailUrl,
  };

  return (
    <div className="group cursor-pointer">
      {/* Image */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 relative shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
        <img
          src={property.thumbnailUrl}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322]/75 via-transparent to-transparent" />

        {/* Urgency badge */}
        {availableRooms <= 3 && (
          <div className="absolute top-4 left-4">
            <span className="bg-black/45 backdrop-blur-md text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full text-white font-bold">
              Only {availableRooms} left
            </span>
          </div>
        )}

        {/* Heart / Add to Trip */}
        <button
          onClick={(e) => { e.preventDefault(); if (!inTrip) onAdd(item); }}
          className={cn(
            'absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 border shadow-lg',
            inTrip
              ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
              : 'bg-[#2f3445]/60 border-white/[0.12] text-[#e3e3db]/50 hover:text-gold-400 hover:border-gold-500/30 hover:bg-[#2f3445]/80',
          )}
        >
          <Heart size={16} className={inTrip ? 'fill-gold-400' : ''} />
        </button>

        {/* Star rating badge on image */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full">
          <Star size={11} className="fill-gold-500 text-gold-500" />
          <span className="text-xs font-bold text-white">{property.starRating}.0</span>
          <span className="w-px h-3 bg-white/20 mx-0.5" />
          <span className="text-[10px] text-white/55">{property.starRating} star</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-xl font-semibold text-[#e3e3db] mb-1.5 group-hover:text-gold-400 transition-colors leading-tight">
            {property.name}
          </h3>
          <p className="text-[#e3e3db]/50 text-sm flex items-center gap-1.5 mb-3">
            <MapPin size={11} className="shrink-0 text-gold-500/60" />
            {property.city}, {property.country}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((key) => {
              const a = AMENITY_MAP[key];
              if (!a) return null;
              return (
                <span key={key} className="px-2.5 py-1 rounded-full bg-[#25293a] text-[10px] text-[#e3e3db]/50">
                  {a.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[#e3e3db]/40 mb-1">from</div>
          <div className="font-heading text-2xl text-gold-400 font-semibold leading-none">
            {formatCurrency(effectivePriceCents)}
          </div>
          <div className="text-[10px] text-[#e3e3db]/35 mt-1">/ night</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <AddToTripButton item={item} onAdd={onAdd} inTrip={inTrip} />
        <Link
          to={`/hotel/${property.id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#e3e3db]/50 hover:text-[#e3e3db] transition-colors group/link"
        >
          View details
          <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────

const CLASS_STYLES: Record<FlightClass, string> = {
  Economy: 'bg-[#25293a] text-[#e3e3db]/60 border border-white/[0.08]',
  Business: 'bg-gold-500/[0.10] text-gold-400 border border-gold-500/20',
  First: 'bg-gold-500/[0.18] text-gold-400 border border-gold-500/35',
};

function FlightCard({ flight, onAdd, isInTrip }: { flight: Flight; onAdd: (item: TripItem) => void; isInTrip: (id: string) => boolean }) {
  const inTrip = isInTrip(flight.id);
  const item: TripItem = {
    id: flight.id,
    type: 'flight',
    name: `${flight.from.code} → ${flight.to.code}`,
    subtitle: `${flight.airline} · ${flight.class} · ${flight.duration}`,
    priceCents: flight.priceCents,
  };

  return (
    <div className="group bg-[#25293a] hover:bg-[#2f3445] rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0e1322] border border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-bold text-gold-400">{flight.airlineCode}</span>
            </div>
            <span className="text-sm font-semibold text-[#e3e3db]">{flight.airline}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {flight.badge && (
              <span className="px-2.5 py-1 rounded-full bg-gold-500/[0.10] text-gold-400 text-[10px] font-bold uppercase tracking-wider border border-gold-500/20">
                {flight.badge}
              </span>
            )}
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', CLASS_STYLES[flight.class])}>
              {flight.class}
            </span>
            {flight.seatsLeft <= 4 && (
              <span className="px-2.5 py-1 rounded-full bg-red-500/[0.10] text-red-400 text-[10px] font-bold border border-red-500/20">
                {flight.seatsLeft} left
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left min-w-[70px]">
            <p className="text-2xl font-bold text-[#e3e3db] leading-none">{flight.from.time}</p>
            <p className="text-xs font-semibold text-[#e3e3db]/55 mt-1">{flight.from.code}</p>
            <p className="text-[11px] text-[#e3e3db]/35 truncate max-w-[80px]">{flight.from.city}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <p className="text-[10px] text-[#e3e3db]/40 font-medium">{flight.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-white/[0.10]" />
              <Plane size={13} className="text-gold-500/60" />
              <div className="flex-1 h-px bg-white/[0.10]" />
            </div>
            <p className="text-[10px] text-[#e3e3db]/40 text-center">
              {flight.stops === 0
                ? 'Non-stop'
                : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}${flight.stopCity ? ` · ${flight.stopCity}` : ''}`}
            </p>
          </div>
          <div className="text-right min-w-[70px]">
            <p className="text-2xl font-bold text-[#e3e3db] leading-none">{flight.to.time}</p>
            <p className="text-xs font-semibold text-[#e3e3db]/55 mt-1">{flight.to.code}</p>
            <p className="text-[11px] text-[#e3e3db]/35 truncate max-w-[80px] ml-auto">{flight.to.city}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xl font-bold text-[#e3e3db]">
            {formatCurrency(flight.priceCents)}
            <span className="text-sm font-normal text-[#e3e3db]/40 ml-1">/person</span>
          </p>
          <AddToTripButton item={item} onAdd={onAdd} inTrip={inTrip} />
        </div>
      </div>
    </div>
  );
}

// ─── Car Card ─────────────────────────────────────────────────────────────────

function CarCard({ car, days, onAdd, isInTrip }: { car: CarRental; days: number; onAdd: (item: TripItem) => void; isInTrip: (id: string) => boolean }) {
  const inTrip = isInTrip(car.id);
  const total = car.priceCents * days;
  const item: TripItem = {
    id: car.id,
    type: 'car',
    name: `${car.brand} ${car.model}`,
    subtitle: `${car.type} · ${days} day${days !== 1 ? 's' : ''}`,
    priceCents: total,
    imageUrl: car.imageUrl,
  };

  return (
    <div className="group bg-[#25293a] hover:bg-[#2f3445] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="h-44 overflow-hidden relative">
        <img
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322]/50 to-transparent" />
        {car.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-gold-500/90 backdrop-blur-sm text-[#0e1322] text-[10px] font-bold uppercase tracking-wider">
            {car.badge}
          </div>
        )}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#0e1322]/70 backdrop-blur-sm text-[#e3e3db]/80 text-[10px] font-semibold">
          {car.transmission}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading text-base font-semibold text-[#e3e3db] leading-tight">
            {car.brand} {car.model}
          </h3>
          <span className="text-[10px] font-bold text-[#e3e3db]/35 uppercase tracking-wider whitespace-nowrap">
            {car.type}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="fill-gold-500 text-gold-500" />
          <span className="text-xs font-semibold text-[#e3e3db]">{car.rating}</span>
          <span className="text-xs text-[#e3e3db]/35">({car.reviews})</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#0e1322] text-[#e3e3db]/50 text-[11px]">
            <Users size={11} /> {car.seats} seats
          </span>
          {car.features.slice(0, 2).map((f) => (
            <span key={f} className="flex items-center gap-1 px-2 py-1 rounded bg-[#0e1322] text-[#e3e3db]/50 text-[11px]">
              {f === 'Zero Emission' ? <Fuel size={11} /> : <Check size={11} />} {f}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <p className="text-lg font-bold text-[#e3e3db]">
              {formatCurrency(car.priceCents)}
              <span className="text-xs font-normal text-[#e3e3db]/40 ml-1">/day</span>
            </p>
            {days > 1 && (
              <p className="text-xs text-[#e3e3db]/35">{formatCurrency(total)} total · {days} days</p>
            )}
          </div>
          <AddToTripButton item={item} onAdd={onAdd} inTrip={inTrip} />
        </div>
      </div>
    </div>
  );
}

// ─── Results Header ───────────────────────────────────────────────────────────

function ResultsHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
      <div>
        <p className="text-[11px] text-gold-400/60 uppercase tracking-widest font-semibold mb-2">
          Search Results
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-semibold italic text-[#e3e3db] leading-tight">
          {label}{' '}
          <span className="text-[#e3e3db]/30 text-xl font-light not-italic">({count})</span>
        </h2>
      </div>
    </div>
  );
}

// ─── No Results ───────────────────────────────────────────────────────────────

function NoResults({ onModify }: { onModify: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#25293a] border border-white/[0.08] flex items-center justify-center mb-5">
        <AlertCircle size={28} className="text-[#e3e3db]/30" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[#e3e3db] mb-2">Nothing found</h3>
      <p className="text-sm text-[#e3e3db]/50 max-w-sm mb-6 leading-relaxed">
        We couldn't find results for your search. Try different dates, destinations, or broaden your criteria.
      </p>
      <button
        onClick={onModify}
        style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#0e1322] text-sm font-semibold"
      >
        <RefreshCw size={14} /> Modify Search
      </button>
    </motion.div>
  );
}

// ─── Mock Data Banner ─────────────────────────────────────────────────────────

function MockResultsBanner({ type }: { type: 'flights' | 'cars' }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 mb-5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
      <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-300/80 leading-relaxed">
        <span className="font-semibold text-amber-300">Sample results for demonstration.</span>{' '}
        {type === 'flights'
          ? 'Live flight search is coming soon. Prices shown are indicative only.'
          : 'Live car rental booking is coming soon. Prices are illustrative.'}
      </p>
    </div>
  );
}

// ─── Idle States ──────────────────────────────────────────────────────────────

function HotelIdleState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#25293a] border border-gold-500/[0.15] flex items-center justify-center mb-5">
        <Hotel size={28} className="text-gold-400" />
      </div>
      <h3 className="font-heading text-2xl font-semibold text-[#e3e3db] italic mb-2">
        Where will you stay?
      </h3>
      <p className="text-sm text-[#e3e3db]/45 max-w-xs leading-relaxed">
        Enter a destination above and hit Search to discover handpicked hotels and resorts.
      </p>
    </motion.div>
  );
}

function FlightIdleState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#25293a] border border-gold-500/[0.15] flex items-center justify-center mb-5">
        <Plane size={28} className="text-gold-400" />
      </div>
      <h3 className="font-heading text-2xl font-semibold text-[#e3e3db] italic mb-2">
        Where will you fly?
      </h3>
      <p className="text-sm text-[#e3e3db]/45 max-w-xs leading-relaxed">
        Choose your route above and we'll find the best flights for you.
      </p>
    </motion.div>
  );
}

function CarIdleState() {
  const highlights = [
    { icon: <RefreshCw size={20} className="text-gold-400" />, title: 'Free Cancellation', desc: 'Cancel up to 48h before pickup at no charge.' },
    { icon: <MapPin size={20} className="text-gold-400" />, title: 'Airport Pickup', desc: 'Pick up your car right at the arrivals hall.' },
    { icon: <ShieldCheck size={20} className="text-gold-400" />, title: 'Full Insurance', desc: 'Comprehensive cover with zero excess options.' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400/60 font-semibold mb-2">Car Rentals</p>
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-[#e3e3db] italic">
          Find your perfect ride
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {highlights.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#25293a] rounded-2xl p-6 flex flex-col items-center text-center hover:bg-[#2f3445] transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0e1322] border border-gold-500/[0.15] flex items-center justify-center mb-4">
              {h.icon}
            </div>
            <h3 className="font-heading text-base font-semibold text-[#e3e3db] mb-1.5">{h.title}</h3>
            <p className="text-sm text-[#e3e3db]/45 leading-relaxed">{h.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterSidebarProps {
  priceFilter: number;
  onPriceChange: (v: number) => void;
  starFilter: Set<number>;
  onToggleStar: (s: number) => void;
  amenityFilter: Set<string>;
  onToggleAmenity: (key: string) => void;
  onClearAll: () => void;
}

function FilterSidebar({ priceFilter, onPriceChange, starFilter, onToggleStar, amenityFilter, onToggleAmenity, onClearAll }: FilterSidebarProps) {
  const hasFilters = priceFilter < PRICE_MAX || starFilter.size > 0 || amenityFilter.size > 0;

  return (
    <aside className="w-60 shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-[#e3e3db] italic">Refine Search</h2>
        {hasFilters && (
          <button onClick={onClearAll} className="text-[11px] uppercase tracking-[0.2em] text-gold-400/60 hover:text-gold-400 transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-gold-500/60" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gold-400">Price Range</span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min={5000}
            max={PRICE_MAX}
            step={5000}
            value={priceFilter}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-gold-500 h-1 bg-[#25293a] rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#e3e3db]/40">
            <span>$50</span>
            <span className="text-gold-400/80 font-semibold">
              {priceFilter >= PRICE_MAX ? 'Any price' : `Up to ${formatCurrency(priceFilter)}`}
            </span>
            <span>$2k+</span>
          </div>
        </div>
      </section>

      {/* Star Rating */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-gold-500/60" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gold-400">Star Rating</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => onToggleStar(s)}
              className={cn(
                'h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200',
                starFilter.has(s)
                  ? 'bg-gold-500/[0.15] text-gold-400 ring-1 ring-gold-500/35'
                  : 'bg-[#25293a] text-[#e3e3db]/50 hover:bg-[#2f3445]',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-gold-500/60" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gold-400">Amenities</span>
        </div>
        <div className="space-y-3">
          {AMENITY_FILTER_OPTIONS.map((opt) => {
            const checked = amenityFilter.has(opt.key);
            return (
              <label key={opt.key} className="flex items-center gap-3 group cursor-pointer" onClick={() => onToggleAmenity(opt.key)}>
                <div className={cn(
                  'w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shrink-0',
                  checked ? 'border-gold-500/50 bg-gold-500/[0.10]' : 'border-white/[0.15] group-hover:border-gold-500/40',
                )}>
                  {checked && <Check size={11} className="text-gold-400" />}
                </div>
                <span className={cn('text-sm transition-colors', checked ? 'text-[#e3e3db]' : 'text-[#e3e3db]/50 group-hover:text-[#e3e3db]/80')}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls =
  'w-full h-11 px-3.5 rounded-xl border border-white/[0.18] bg-white/[0.10] text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-gold-400/60 transition-all [color-scheme:dark]';
const labelCls = 'block text-[10px] font-bold text-white/45 mb-1.5 uppercase tracking-widest';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Search() {
  const [urlParams, setUrlParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const activeTab = (urlParams.get('tab') as Tab) ?? 'hotels';
  const setTab = (tab: Tab) => {
    const p = new URLSearchParams(urlParams);
    p.set('tab', tab);
    setUrlParams(p, { replace: true });
  };

  // ── Hotel form ──
  const [hotelDest, setHotelDest] = useState(urlParams.get('destination') ?? '');
  const [hotelCheckIn, setHotelCheckIn] = useState(urlParams.get('checkIn') ?? '');
  const [hotelCheckOut, setHotelCheckOut] = useState(urlParams.get('checkOut') ?? '');
  const [hotelGuests, setHotelGuests] = useState(Number(urlParams.get('guests') ?? '2'));
  const [hotelError, setHotelError] = useState('');

  // ── Flight form ──
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightReturn, setFlightReturn] = useState('');
  const [flightPassengers, setFlightPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<FlightClass>('Economy');

  // ── Car form ──
  const [carLocation, setCarLocation] = useState('');
  const [carPickupDate, setCarPickupDate] = useState('');
  const [carPickupTime, setCarPickupTime] = useState('10:00');
  const [carReturnDate, setCarReturnDate] = useState('');
  const [driverAge, setDriverAge] = useState<DriverAge>('25-65');

  // ── Search trigger state ──
  const [hasHotelSearched, setHasHotelSearched] = useState(false);
  const [hasFlightSearched, setHasFlightSearched] = useState(false);
  const [hasCarSearched, setHasCarSearched] = useState(false);

  const [hotelParams, setHotelParams] = useState<Partial<SearchParams>>({});
  const [flightParams, setFlightParams] = useState<{ from?: string; to?: string; class?: string }>({});
  const [carParams, setCarParams] = useState<{ location?: string }>({});

  // ── Filter state ──
  const [priceFilter, setPriceFilter] = useState(PRICE_MAX);
  const [starFilter, setStarFilter] = useState<Set<number>>(new Set());
  const [amenityFilter, setAmenityFilter] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  // ── Pagination ──
  const [hotelPage, setHotelPage] = useState(0);
  const [flightPage, setFlightPage] = useState(0);
  const [carPage, setCarPage] = useState(0);

  const carDays =
    carPickupDate && carReturnDate ? Math.max(1, nightsBetween(carPickupDate, carReturnDate)) : 1;

  // ── Queries ──
  const { data: allHotels, isFetching: hotelsLoading } = useSearchHotels(hotelParams, { enabled: hasHotelSearched });
  const { data: allFlights, isFetching: flightsLoading } = useFlights(flightParams, { enabled: hasFlightSearched });
  const { data: allCars, isFetching: carsLoading } = useCars(carParams, { enabled: hasCarSearched });

  const { user } = useAuthStore();
  const { addItem, setPendingItem, setShowAuthGate, isInTrip } = useTripStore();

  // ── Auto-run from URL on mount ──
  useEffect(() => {
    if (urlParams.get('tab') === 'hotels' && urlParams.get('destination')) {
      setHotelParams({
        destination: urlParams.get('destination') ?? '',
        checkIn: urlParams.get('checkIn') ?? undefined,
        checkOut: urlParams.get('checkOut') ?? undefined,
        guests: Number(urlParams.get('guests') ?? '2'),
      });
      setHasHotelSearched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──
  const handleAddToTrip = (item: TripItem) => {
    if (!user) { setPendingItem(item); setShowAuthGate(true); }
    else addItem(item);
  };

  const resetFilters = () => {
    setPriceFilter(PRICE_MAX);
    setStarFilter(new Set());
    setAmenityFilter(new Set());
    setSortOrder('recommended');
    setHotelPage(0);
  };

  const handleHotelSearch = (overrideDest?: string) => {
    const dest = overrideDest ?? hotelDest;
    if (!dest.trim()) { setHotelError('Please enter a destination'); return; }
    setHotelError('');
    resetFilters();
    const p = new URLSearchParams();
    p.set('tab', 'hotels');
    p.set('destination', dest);
    if (hotelCheckIn) p.set('checkIn', hotelCheckIn);
    if (hotelCheckOut) p.set('checkOut', hotelCheckOut);
    p.set('guests', String(hotelGuests));
    setUrlParams(p);
    setHotelParams({ destination: dest, checkIn: hotelCheckIn || undefined, checkOut: hotelCheckOut || undefined, guests: hotelGuests });
    if (overrideDest) setHotelDest(overrideDest);
    setHasHotelSearched(true);
    setHotelPage(0);
  };

  const handleFlightSearch = (overrideFrom?: string, overrideTo?: string) => {
    const from = overrideFrom ?? flightFrom;
    const to = overrideTo ?? flightTo;
    if (overrideFrom !== undefined) setFlightFrom(overrideFrom);
    if (overrideTo !== undefined) setFlightTo(overrideTo);
    const p = new URLSearchParams();
    p.set('tab', 'flights');
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (flightDate) p.set('date', flightDate);
    p.set('class', flightClass);
    setUrlParams(p);
    setFlightParams({ from: from || undefined, to: to || undefined, class: flightClass });
    setHasFlightSearched(true);
    setFlightPage(0);
  };

  const handleCarSearch = () => {
    if (!carLocation.trim()) return;
    const p = new URLSearchParams();
    p.set('tab', 'cars');
    p.set('location', carLocation);
    if (carPickupDate) p.set('pickupDate', carPickupDate);
    if (carReturnDate) p.set('returnDate', carReturnDate);
    setUrlParams(p);
    setCarParams({ location: carLocation });
    setHasCarSearched(true);
    setCarPage(0);
  };

  const handleHotelCheckIn = (val: string) => {
    setHotelCheckIn(val);
    if (hotelCheckOut && val >= hotelCheckOut)
      setHotelCheckOut(new Date(new Date(val).getTime() + 86400000).toISOString().split('T')[0]);
  };
  const handleFlightDate = (val: string) => {
    setFlightDate(val);
    if (tripType === 'round-trip' && flightReturn && val >= flightReturn)
      setFlightReturn(new Date(new Date(val).getTime() + 7 * 86400000).toISOString().split('T')[0]);
  };
  const handleCarPickupDate = (val: string) => {
    setCarPickupDate(val);
    if (carReturnDate && val >= carReturnDate)
      setCarReturnDate(new Date(new Date(val).getTime() + 86400000).toISOString().split('T')[0]);
  };

  const toggleStar = (s: number) => {
    setStarFilter((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setHotelPage(0);
  };
  const toggleAmenity = (key: string) => {
    setAmenityFilter((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
    setHotelPage(0);
  };

  // ── Data ──
  const hotels = allHotels ?? [];
  const flights = allFlights ?? [];
  const cars = allCars ?? [];

  const filteredHotels = hotels
    .filter((h) => priceFilter >= PRICE_MAX || h.effectivePriceCents <= priceFilter)
    .filter((h) => starFilter.size === 0 || starFilter.has(h.property.starRating))
    .filter((h) => amenityFilter.size === 0 || [...amenityFilter].every((a) => h.property.amenities.includes(a)))
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return a.effectivePriceCents - b.effectivePriceCents;
      if (sortOrder === 'price-desc') return b.effectivePriceCents - a.effectivePriceCents;
      if (sortOrder === 'rating') return b.property.starRating - a.property.starRating;
      return 0;
    });

  const pagedHotels = filteredHotels.slice(hotelPage * HOTELS_PER_PAGE, (hotelPage + 1) * HOTELS_PER_PAGE);
  const pagedFlights = flights.slice(flightPage * FLIGHTS_PER_PAGE, (flightPage + 1) * FLIGHTS_PER_PAGE);
  const pagedCars = cars.slice(carPage * CARS_PER_PAGE, (carPage + 1) * CARS_PER_PAGE);

  const flightLabel = `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`;
  const carLabel = `${cars.length} car${cars.length !== 1 ? 's' : ''} available${carParams.location ? ` in ${carParams.location}` : ''}`;

  const hotelValid = hotelDest.trim().length > 0;
  const flightValid = flightFrom.trim().length > 0 && flightTo.trim().length > 0 && flightDate.length > 0;
  const carValid = carLocation.trim().length > 0 && carPickupDate.length > 0 && carReturnDate.length > 0;
  const hasHotelFilters = priceFilter < PRICE_MAX || starFilter.size > 0 || amenityFilter.size > 0;

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'hotels', label: 'Hotels', icon: <Hotel size={15} /> },
    { id: 'flights', label: 'Flights', icon: <Plane size={15} /> },
    { id: 'cars', label: 'Car Rentals', icon: <Car size={15} /> },
  ];

  const searchBtnCls = (valid: boolean) =>
    cn(
      'flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0',
      valid
        ? 'bg-gold-500 text-[#0e1322] hover:bg-gold-400 hover:shadow-[0_0_20px_rgba(212,168,83,0.4)]'
        : 'bg-white/[0.10] text-white/25 cursor-not-allowed border border-white/[0.10]',
    );

  return (
    <div className="min-h-screen bg-[#0e1322]">
      {/* ── Hero + Form ── */}
      <section className="relative min-h-[88vh] flex flex-col bg-[#0e1322] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e1322]/55 via-[#0e1322]/20 to-[#0e1322]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(14,19,34,0.6)_100%)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold-500/[0.08] rounded-full blur-[90px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/[0.06] rounded-full blur-3xl" />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-10 bg-gold-500/40" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400/80 font-medium">Arcova Travel</span>
            <div className="h-px w-10 bg-gold-500/40" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06 }}
            className="font-heading text-5xl sm:text-6xl md:text-7xl xl:text-[88px] font-semibold text-white italic leading-[1.05] mb-5"
          >
            Where to Next?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="text-[#e3e3db]/60 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed"
          >
            Extraordinary hotels, flights and cars — curated for the way you want to travel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm mb-7"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-gold-500 text-[#0e1322] shadow-[0_2px_12px_rgba(212,168,83,0.4)]'
                    : 'text-[#e3e3db]/50 hover:text-white hover:bg-white/[0.08]',
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </motion.div>

          {activeTab === 'hotels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-[#e3e3db]/35 font-medium self-center mr-1">Quick pick:</span>
              {MOOD_FILTERS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleHotelSearch(m.destination)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/[0.15] bg-white/[0.07] text-xs font-medium text-[#e3e3db]/60 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/[0.10] transition-all backdrop-blur-sm"
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'flights' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-[#e3e3db]/35 font-medium self-center mr-1">Popular routes:</span>
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={`${r.fromCode}-${r.toCode}`}
                  onClick={() => handleFlightSearch(r.from, r.to)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/[0.15] bg-white/[0.07] text-xs font-medium text-[#e3e3db]/60 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/[0.10] transition-all backdrop-blur-sm"
                >
                  <span className="font-bold">{r.fromCode}</span>
                  <ArrowRight size={10} className="text-gold-500/70" />
                  <span className="font-bold">{r.toCode}</span>
                  <span className="text-[#e3e3db]/35">· {r.price}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Search Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="relative px-4 sm:px-6 lg:px-10 pb-12 w-full max-w-[1120px] mx-auto"
        >
          <div className="bg-black/35 backdrop-blur-2xl rounded-2xl border border-white/[0.12] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
            <AnimatePresence mode="wait">
              {activeTab === 'hotels' && (
                <motion.form key="hotel" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }} onSubmit={(e) => { e.preventDefault(); handleHotelSearch(); }} className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className={labelCls}><MapPin size={10} className="inline mr-1" />Destination</label>
                      <input type="text" placeholder="City, resort, or property" value={hotelDest} onChange={(e) => { setHotelDest(e.target.value); setHotelError(''); }} className={cn(inputCls, hotelError && 'border-red-400/60 focus:ring-red-400/30')} />
                      {hotelError && <p className="text-xs text-red-400 mt-1">{hotelError}</p>}
                    </div>
                    <div>
                      <label className={labelCls}><Calendar size={10} className="inline mr-1" />Check-in</label>
                      <input type="date" value={hotelCheckIn} min={today} onChange={(e) => handleHotelCheckIn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls}><Calendar size={10} className="inline mr-1" />Check-out</label>
                        {hotelCheckIn && hotelCheckOut && (
                          <span className="text-[10px] font-semibold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full">
                            {(() => { const n = nightsBetween(hotelCheckIn, hotelCheckOut); return n === 1 ? '1 night' : `${n} nights`; })()}
                          </span>
                        )}
                      </div>
                      <input type="date" value={hotelCheckOut} min={hotelCheckIn || tomorrow} onChange={(e) => setHotelCheckOut(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className={labelCls}><Users size={10} className="inline mr-1" />Guests</label>
                        <div className="flex items-center h-11 border border-white/[0.18] rounded-xl bg-white/[0.10] overflow-hidden">
                          <button type="button" onClick={() => setHotelGuests(Math.max(1, hotelGuests - 1))} className="w-10 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-colors">−</button>
                          <span className="flex-1 text-center text-sm font-semibold text-white">{hotelGuests}</span>
                          <button type="button" onClick={() => setHotelGuests(Math.min(8, hotelGuests + 1))} className="w-10 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-colors">+</button>
                        </div>
                      </div>
                      <button type="submit" disabled={!hotelValid} className={searchBtnCls(hotelValid)}><SearchIcon size={14} /> Search</button>
                    </div>
                  </div>
                </motion.form>
              )}

              {activeTab === 'flights' && (
                <motion.form key="flights" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }} onSubmit={(e) => { e.preventDefault(); handleFlightSearch(); }} className="p-5 sm:p-6">
                  <div className="flex items-center gap-1 mb-5 p-1 w-fit rounded-xl bg-white/[0.08] border border-white/[0.12]">
                    {(['one-way', 'round-trip'] as TripType[]).map((t) => (
                      <button key={t} type="button" onClick={() => setTripType(t)} className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize', tripType === t ? 'bg-white text-[#0e1322] shadow-sm' : 'text-white/50 hover:text-white/80')}>
                        {t.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div className="lg:col-span-1">
                      <label className={labelCls}><Plane size={10} className="inline mr-1" />From</label>
                      <input type="text" placeholder="City or airport" value={flightFrom} onChange={(e) => setFlightFrom(e.target.value)} className={inputCls} />
                    </div>
                    <div className="lg:col-span-1 relative">
                      <label className={labelCls}><Plane size={10} className="inline mr-1 rotate-90" />To</label>
                      <div className="relative">
                        <input type="text" placeholder="City or airport" value={flightTo} onChange={(e) => setFlightTo(e.target.value)} className={inputCls} />
                        <button type="button" onClick={() => { const tmp = flightFrom; setFlightFrom(flightTo); setFlightTo(tmp); }} className="absolute -left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/[0.12] border border-white/[0.20] items-center justify-center hover:bg-white/[0.22] transition-colors z-10 hidden lg:flex">
                          <ArrowLeftRight size={13} className="text-white/70" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}><Calendar size={10} className="inline mr-1" />Departure</label>
                      <input type="date" value={flightDate} min={today} onChange={(e) => handleFlightDate(e.target.value)} className={inputCls} />
                    </div>
                    <AnimatePresence>
                      {tripType === 'round-trip' && (
                        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0 }} style={{ originX: 0 }} transition={{ duration: 0.2 }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className={labelCls}><Calendar size={10} className="inline mr-1" />Return</label>
                            {flightDate && flightReturn && (
                              <span className="text-[10px] font-semibold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full">
                                {(() => { const n = nightsBetween(flightDate, flightReturn); return n === 1 ? '1 night' : `${n} nights`; })()}
                              </span>
                            )}
                          </div>
                          <input type="date" value={flightReturn} min={flightDate || today} onChange={(e) => setFlightReturn(e.target.value)} className={inputCls} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex-shrink-0">
                      <label className={labelCls}><Users size={10} className="inline mr-1" />Passengers</label>
                      <div className="flex items-center h-11 border border-white/[0.18] rounded-xl bg-white/[0.10] overflow-hidden">
                        <button type="button" onClick={() => setFlightPassengers(Math.max(1, flightPassengers - 1))} className="w-9 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-colors">−</button>
                        <span className="flex-1 text-center text-sm font-semibold text-white">{flightPassengers}</span>
                        <button type="button" onClick={() => setFlightPassengers(Math.min(9, flightPassengers + 1))} className="w-9 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-colors">+</button>
                      </div>
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className={labelCls}>Class</label>
                        <select value={flightClass} onChange={(e) => setFlightClass(e.target.value as FlightClass)} className={inputCls}>
                          <option>Economy</option>
                          <option>Business</option>
                          <option>First</option>
                        </select>
                      </div>
                      <button type="submit" disabled={!flightValid} className={searchBtnCls(flightValid)}><SearchIcon size={14} /> Search</button>
                    </div>
                  </div>
                </motion.form>
              )}

              {activeTab === 'cars' && (
                <motion.form key="cars" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }} onSubmit={(e) => { e.preventDefault(); handleCarSearch(); }} className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelCls}><MapPin size={10} className="inline mr-1" />Pickup Location</label>
                      <input type="text" placeholder="City or airport" value={carLocation} onChange={(e) => setCarLocation(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Calendar size={10} className="inline mr-1" />Pickup Date</label>
                      <input type="date" value={carPickupDate} min={today} onChange={(e) => handleCarPickupDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Clock size={10} className="inline mr-1" />Pickup Time</label>
                      <input type="time" value={carPickupTime} onChange={(e) => setCarPickupTime(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls}><Calendar size={10} className="inline mr-1" />Return Date</label>
                        {carPickupDate && carReturnDate && (
                          <span className="text-[10px] font-semibold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full">
                            {carDays === 1 ? '1 day' : `${carDays} days`}
                          </span>
                        )}
                      </div>
                      <input type="date" value={carReturnDate} min={carPickupDate || tomorrow} onChange={(e) => setCarReturnDate(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className={labelCls}>Driver Age</label>
                        <select value={driverAge} onChange={(e) => setDriverAge(e.target.value as DriverAge)} className={inputCls}>
                          <option value="under-25">Under 25</option>
                          <option value="25-65">25 – 65</option>
                          <option value="over-65">Over 65</option>
                        </select>
                      </div>
                      <button type="submit" disabled={!carValid} className={searchBtnCls(carValid)}><SearchIcon size={14} /> Search</button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {driverAge === 'under-25' && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 text-xs text-amber-300 bg-amber-500/[0.10] border border-amber-400/20 rounded-xl px-4 py-2.5">
                        ⚠️ Young driver surcharge may apply. Additional fees vary by supplier.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── Results Zone ── */}
      <div ref={resultsRef} className="bg-[#0e1322]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 pb-24">
          <AnimatePresence mode="wait">
            {/* Hotels */}
            {activeTab === 'hotels' && (
              <motion.div key="hotel-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {!hasHotelSearched ? (
                  <HotelIdleState />
                ) : hotelsLoading ? (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: HOTELS_PER_PAGE }).map((_, i) => <HotelSkeleton key={i} />)}
                  </div>
                ) : hotels.length === 0 ? (
                  <NoResults onModify={scrollToForm} />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
                      {/* Sidebar — desktop only */}
                      <div className="hidden lg:block sticky top-6 self-start">
                        <FilterSidebar
                          priceFilter={priceFilter}
                          onPriceChange={(v) => { setPriceFilter(v); setHotelPage(0); }}
                          starFilter={starFilter}
                          onToggleStar={toggleStar}
                          amenityFilter={amenityFilter}
                          onToggleAmenity={toggleAmenity}
                          onClearAll={resetFilters}
                        />
                      </div>

                      {/* Results */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                          <div>
                            <p className="text-[11px] text-gold-400/60 uppercase tracking-widest font-semibold mb-2">
                              Search Results
                            </p>
                            <h2 className="font-heading text-3xl md:text-4xl font-semibold italic text-[#e3e3db] leading-tight">
                              {hotelParams.destination}{' '}
                              <span className="text-[#e3e3db]/30 text-xl font-light not-italic">
                                ({filteredHotels.length} {filteredHotels.length === 1 ? 'stay' : 'stays'})
                              </span>
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 text-sm shrink-0 mt-1">
                            <span className="text-[#e3e3db]/40">Sort by:</span>
                            <div className="relative">
                              <select
                                value={sortOrder}
                                onChange={(e) => { setSortOrder(e.target.value as typeof sortOrder); setHotelPage(0); }}
                                className="appearance-none bg-[#25293a] border border-white/[0.08] rounded-xl pl-3 pr-8 py-2 text-sm text-[#e3e3db] font-semibold cursor-pointer focus:outline-none focus:border-gold-500/40 transition-colors [color-scheme:dark]"
                              >
                                <option value="recommended">Recommended</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Star Rating</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#e3e3db]/40 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {filteredHotels.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#25293a] flex items-center justify-center mb-4">
                              <AlertCircle size={24} className="text-[#e3e3db]/30" />
                            </div>
                            <p className="text-[#e3e3db]/60 mb-4">No hotels match your current filters.</p>
                            <button onClick={resetFilters} className="text-gold-400 text-xs uppercase tracking-widest font-bold hover:text-gold-300 transition-colors">
                              Clear All Filters
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-10 md:grid-cols-2">
                              {pagedHotels.map((result, i) => (
                                <motion.div key={result.property.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                  <HotelCard result={result} onAdd={handleAddToTrip} isInTrip={isInTrip} />
                                </motion.div>
                              ))}
                            </div>
                            <Pagination page={hotelPage} totalItems={filteredHotels.length} perPage={HOTELS_PER_PAGE} onChange={setHotelPage} resultsRef={resultsRef} />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Flights */}
            {activeTab === 'flights' && (
              <motion.div key="flight-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {!hasFlightSearched ? (
                  <FlightIdleState />
                ) : flightsLoading ? (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {Array.from({ length: FLIGHTS_PER_PAGE }).map((_, i) => <FlightSkeleton key={i} />)}
                  </div>
                ) : flights.length === 0 ? (
                  <NoResults onModify={scrollToForm} />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                    <MockResultsBanner type="flights" />
                    <ResultsHeader label={flightLabel} count={flights.length} />
                    <div className="space-y-4">
                      {pagedFlights.map((flight, i) => (
                        <motion.div key={flight.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                          <FlightCard flight={flight} onAdd={handleAddToTrip} isInTrip={isInTrip} />
                        </motion.div>
                      ))}
                    </div>
                    <Pagination page={flightPage} totalItems={flights.length} perPage={FLIGHTS_PER_PAGE} onChange={setFlightPage} resultsRef={resultsRef} />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Cars */}
            {activeTab === 'cars' && (
              <motion.div key="car-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {!hasCarSearched ? (
                  <CarIdleState />
                ) : carsLoading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: CARS_PER_PAGE }).map((_, i) => <CarSkeleton key={i} />)}
                  </div>
                ) : cars.length === 0 ? (
                  <NoResults onModify={scrollToForm} />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <MockResultsBanner type="cars" />
                    <ResultsHeader label={carLabel} count={cars.length} />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {pagedCars.map((car, i) => (
                        <motion.div key={car.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                          <CarCard car={car} days={carDays} onAdd={handleAddToTrip} isInTrip={isInTrip} />
                        </motion.div>
                      ))}
                    </div>
                    <Pagination page={carPage} totalItems={cars.length} perPage={CARS_PER_PAGE} onChange={setCarPage} resultsRef={resultsRef} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile Filter FAB ── */}
      <AnimatePresence>
        {activeTab === 'hotels' && hasHotelSearched && !hotelsLoading && hotels.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setMobileFiltersOpen(true)}
            style={hasHotelFilters ? { background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' } : undefined}
            className={cn(
              'lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-30 transition-colors active:scale-90',
              hasHotelFilters
                ? 'text-[#0e1322]'
                : 'bg-[#25293a] border border-white/[0.12] text-[#e3e3db]/70',
            )}
          >
            <SlidersHorizontal size={18} />
            {hasHotelFilters && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#0e1322] text-[9px] font-bold flex items-center justify-center shadow-lg">
                {(priceFilter < PRICE_MAX ? 1 : 0) + starFilter.size + amenityFilter.size}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[#161b2b] z-50 overflow-y-auto p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)] lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl text-[#e3e3db] italic">Refine Search</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#25293a] flex items-center justify-center text-[#e3e3db]/60 hover:text-[#e3e3db] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <FilterSidebar
                priceFilter={priceFilter}
                onPriceChange={(v) => { setPriceFilter(v); setHotelPage(0); }}
                starFilter={starFilter}
                onToggleStar={toggleStar}
                amenityFilter={amenityFilter}
                onToggleAmenity={toggleAmenity}
                onClearAll={resetFilters}
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                className="w-full mt-8 h-11 rounded-xl text-[#0e1322] text-sm font-semibold"
              >
                Show {filteredHotels.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
