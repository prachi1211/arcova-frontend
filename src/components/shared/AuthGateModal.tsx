import { X, Hotel, Plane, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import type { TripItem } from '@/stores/tripStore';

const TYPE_CONFIG = {
  hotel: { icon: Hotel, label: 'Hotel' },
  flight: { icon: Plane, label: 'Flight' },
  car: { icon: Car, label: 'Car Rental' },
} as const;

interface AuthGateModalProps {
  item: TripItem | null;
  onClose: () => void;
}

export function AuthGateModal({ item, onClose }: AuthGateModalProps) {
  const location = useLocation();
  const redirectPath = encodeURIComponent(location.pathname + location.search);
  const typeConfig = item ? TYPE_CONFIG[item.type] : null;
  const TypeIcon = typeConfig?.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative z-10 w-full sm:max-w-[520px] bg-navy-950 rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-warm-400" />
        </button>

        {/* Image banner */}
        <div className="relative h-48 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/30 via-transparent to-navy-950" />
          {/* Arcova wordmark */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-navy-950 flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-sm font-semibold text-white tracking-wider">
              ARCOVA
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-7 pb-7 -mt-1">
          {/* Item preview */}
          {item && TypeIcon && (
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                <TypeIcon size={18} className="text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-warm-400 truncate">{item.subtitle}</p>
              </div>
              <span className="text-sm font-bold text-gold-400 flex-shrink-0">
                {formatCurrency(item.priceCents)}
              </span>
            </div>
          )}

          {/* Headline */}
          <h2 className="font-heading text-2xl md:text-[28px] font-semibold text-white leading-tight mb-3">
            {item ? 'Save to your itinerary.' : 'Build your dream trip.'}
          </h2>
          <p className="text-sm text-warm-400 leading-relaxed mb-7">
            {item
              ? 'Sign in to add this to your trip and let our AI craft a perfect journey around it.'
              : 'Sign in to start building your personalised itinerary with hotels, flights, and car rentals.'}
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              to={`/auth/login?redirect=${redirectPath}`}
              className="flex items-center justify-center w-full h-12 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
            >
              Log in to continue
            </Link>
            <Link
              to={`/auth/signup?redirect=${redirectPath}`}
              className="flex items-center justify-center w-full h-12 rounded-xl border border-white/[0.15] text-white text-sm font-medium hover:bg-white/[0.06] transition-colors"
            >
              Create a free account
            </Link>
          </div>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="w-full mt-5 text-xs text-warm-500 hover:text-warm-300 transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </motion.div>
    </div>
  );
}
