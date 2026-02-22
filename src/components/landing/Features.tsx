import {
  Sparkles,
  Search,
  MessageCircle,
  BarChart3,
  Zap,
  CalendarRange,
} from 'lucide-react';
import { motion } from 'motion/react';

const TRAVELER_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
const SUPPLIER_IMAGE =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

const ease = [0.16, 1, 0.3, 1] as const;

const travelerFeatures = [
  {
    icon: Sparkles,
    title: 'AI Trip Planning',
    desc: 'Personalized itineraries crafted by AI based on your style, budget, and interests.',
  },
  {
    icon: Search,
    title: 'Smart Search',
    desc: 'Find the perfect stay with intelligent filters across hundreds of curated properties.',
  },
  {
    icon: MessageCircle,
    title: '24/7 Concierge',
    desc: 'An always-on travel assistant for real-time recommendations and support.',
  },
];

const supplierFeatures = [
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    desc: 'Real-time dashboards with occupancy, revenue trends, and channel performance.',
  },
  {
    icon: Zap,
    title: 'Dynamic Pricing',
    desc: 'Automated rate adjustments that respond to demand, seasons, and market shifts.',
  },
  {
    icon: CalendarRange,
    title: 'Availability Control',
    desc: 'Manage room inventory across all room types with bulk update tools.',
  },
];

const stats = [
  { value: '10K+', label: 'Travelers' },
  { value: '500+', label: 'Properties' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24/7', label: 'AI Support' },
];

export function Features() {
  return (
    <section id="experience" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-20 md:mb-28"
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="w-10 h-px bg-gold-500" />
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-[0.25em]">
              The Arcova Experience
            </span>
            <span className="w-10 h-px bg-gold-500" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-navy-950 leading-[1.1] tracking-tight mb-5">
            A Seamless Ecosystem for
            <br />
            <span className="italic text-gold-500">Extraordinary Travel.</span>
          </h2>
          <p className="text-base md:text-lg text-warm-500 max-w-xl mx-auto leading-relaxed">
            Three perspectives — traveler, host, and architect — united in one platform
            that makes every journey effortless.
          </p>
        </motion.div>

        {/* ── Block 1: Traveler — image left, text right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
            className="group rounded-3xl md:rounded-[32px] overflow-hidden shadow-xl shadow-navy-950/[0.06]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={TRAVELER_IMAGE}
                alt="Coastal road winding along dramatic cliffs at golden hour"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 to-transparent" />
              {/* Floating label */}
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] font-semibold text-navy-950 tracking-wide">
                The Journey
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
          >
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-[0.25em] mb-4 block">
              For Travelers
            </span>
            <h3 className="font-heading text-3xl md:text-[42px] font-semibold text-navy-950 leading-[1.1] tracking-tight mb-4">
              Your Journey, Intelligently Crafted
            </h3>
            <p className="text-base text-warm-500 leading-relaxed mb-8 max-w-md">
              From discovering hidden gems to booking the perfect stay — Arcova&apos;s AI
              handles the complexity so you can focus on the experience.
            </p>
            <div className="space-y-5">
              {travelerFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="mt-0.5 w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-[18px] h-[18px] text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-950 mb-0.5">{f.title}</p>
                    <p className="text-sm text-warm-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Block 2: Supplier — text left, image right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="order-2 lg:order-1"
          >
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-[0.25em] mb-4 block">
              For Hosts
            </span>
            <h3 className="font-heading text-3xl md:text-[42px] font-semibold text-navy-950 leading-[1.1] tracking-tight mb-4">
              Revenue Intelligence, Redefined
            </h3>
            <p className="text-base text-warm-500 leading-relaxed mb-8 max-w-md">
              Turn your property into a high-performing asset. Real-time insights, automated
              pricing, and effortless availability management — all in one dashboard.
            </p>
            <div className="space-y-5">
              {supplierFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="mt-0.5 w-9 h-9 rounded-xl bg-navy-950 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-[18px] h-[18px] text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-950 mb-0.5">{f.title}</p>
                    <p className="text-sm text-warm-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
            className="order-1 lg:order-2 group rounded-3xl md:rounded-[32px] overflow-hidden shadow-xl shadow-navy-950/[0.06]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={SUPPLIER_IMAGE}
                alt="Grand hotel lobby with warm ambient lighting and elegant design"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 to-transparent" />
              <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] font-semibold text-navy-950 tracking-wide">
                The Destination
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease }}
          className="rounded-3xl md:rounded-[32px] bg-navy-950 p-8 sm:p-10 md:p-14 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/[0.04] rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em] mb-8 text-center">
              Powering Travel at Scale
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-gold-500 tracking-tight mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-semibold text-warm-400 uppercase tracking-[0.15em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
