import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronUp, ChevronDown, Hotel, Plane, Car, Sparkles } from 'lucide-react';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, cn } from '@/lib/utils';

const TYPE_ICONS = {
  hotel: Hotel,
  flight: Plane,
  car: Car,
} as const;

const TYPE_COLORS: Record<string, string> = {
  hotel: 'text-blue-400 bg-blue-400/10',
  flight: 'text-sky-400 bg-sky-400/10',
  car: 'text-emerald-400 bg-emerald-400/10',
};

export function TripPanel() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeItem } = useTripStore();

  if (items.length === 0) return null;

  const totalCents = items.reduce((acc, item) => acc + item.priceCents, 0);

  const handlePlanWithAI = () => {
    if (user) {
      navigate('/traveller/assistant');
    } else {
      navigate('/auth/login?redirect=/traveller/assistant');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-80 bg-navy-950 rounded-2xl border border-white/[0.10] shadow-2xl shadow-navy-950/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div>
                <p className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.2em]">
                  My Itinerary
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {items.length} {items.length === 1 ? 'item' : 'items'} added
                </p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/[0.13] flex items-center justify-center transition-colors"
              >
                <ChevronDown size={14} className="text-warm-400" />
              </button>
            </div>

            {/* Items list */}
            <div className="max-h-64 overflow-y-auto">
              {items.map((item) => {
                const Icon = TYPE_ICONS[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] last:border-0"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        TYPE_COLORS[item.type],
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-warm-500 truncate">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gold-400">
                        {formatCurrency(item.priceCents)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                      >
                        <X size={10} className="text-warm-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 pt-4 pb-5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-warm-400">Estimated total</span>
                <span className="text-base font-bold text-white">{formatCurrency(totalCents)}</span>
              </div>
              <button
                onClick={handlePlanWithAI}
                className="w-full h-11 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
              >
                <Sparkles size={15} />
                Plan with AI
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl bg-navy-950 border border-white/[0.10] shadow-xl shadow-navy-950/40 hover:border-gold-500/30 transition-all group"
          >
            {/* Icon with badge */}
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/20 flex items-center justify-center">
                <Sparkles size={15} className="text-gold-400" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-[10px] font-bold text-navy-950">
                {items.length}
              </span>
            </div>

            {/* Text */}
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              <p className="text-[11px] text-gold-400 font-semibold leading-tight">
                {formatCurrency(totalCents)}
              </p>
            </div>

            <ChevronUp
              size={14}
              className="text-warm-500 group-hover:text-warm-300 transition-colors ml-0.5"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
