import {
  Sparkles,
  Search,
  MessageCircle,
  BarChart3,
  Zap,
  CalendarRange,
} from 'lucide-react';
import { motion } from 'motion/react';

const TRAVELLER_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
const HOST_IMAGE =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

const ease = [0.16, 1, 0.3, 1] as const;

const travellerFeatures = [
  {
    icon: Search,
    title: 'Smart Hotel Search',
    desc: 'Find the perfect stay with intelligent filters across hundreds of curated properties worldwide — no login required.',
  },
  {
    icon: Sparkles,
    title: 'AI Trip Planning',
    desc: 'Personalised itineraries crafted by AI based on your style, budget, and travel dates. Plan a 10-day trip in minutes.',
  },
  {
    icon: MessageCircle,
    title: '24/7 AI Concierge',
    desc: 'An always-on travel assistant for real-time recommendations, local tips, and support throughout your journey.',
  },
];

const hostFeatures = [
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    desc: 'Real-time dashboards with occupancy rates, revenue trends, and booking channel performance.',
  },
  {
    icon: Zap,
    title: 'Dynamic Pricing',
    desc: 'Automated rate adjustments that respond to demand, seasons, and local market shifts.',
  },
  {
    icon: CalendarRange,
    title: 'Availability Control',
    desc: 'Manage room inventory across all room types with bulk update tools and calendar views.',
  },
];

const stats = [
  { value: '10K+', label: 'Travellers' },
  { value: '500+', label: 'Properties' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24/7', label: 'AI Support' },
];

export function Features() {
  return (
    <section id="experience" className="relative py-28 md:py-40 bg-[#0e1322] overflow-hidden">
      {/* Section identity via ambient light, not competing hues */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-gold-500/[0.12] to-transparent" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold-500/[0.025] rounded-full blur-[160px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-20 md:mb-32"
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="w-10 h-px bg-gold-500/60" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              The Arcova Experience
            </span>
            <span className="w-10 h-px bg-gold-500/60" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-[#e3e3db] leading-[1.1] tracking-tight mb-5">
            One Platform.
            <br />
            <span className="italic text-gold-400">Two Perspectives.</span>
          </h2>
          <p className="text-base md:text-lg text-[#e3e3db]/55 max-w-xl mx-auto leading-relaxed">
            Whether you travel the world or host it — Arcova gives you the tools to do it better.
          </p>
        </motion.div>

        {/* Block 1: Traveller — image left, features right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
            className="group rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={TRAVELLER_IMAGE}
                alt="Traveller on a scenic coastal road"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322]/60 to-transparent" />
              {/* Tonal badge — glass, no white */}
              <div className="absolute bottom-5 left-5 bg-[#25293a]/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] font-semibold text-[#e3e3db]/90 tracking-wide border border-white/[0.08]">
                For Travellers
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
          >
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em] mb-4 block">
              For Travellers
            </span>
            <h3 className="font-heading text-3xl md:text-[42px] font-semibold text-[#e3e3db] leading-[1.1] tracking-tight mb-4">
              Your Journey, Intelligently Crafted
            </h3>
            <p className="text-base text-[#e3e3db]/55 leading-relaxed mb-10 max-w-md">
              From discovering hidden gems to booking the perfect stay — Arcova&apos;s AI handles
              the complexity so you can focus on the experience.
            </p>
            <div className="space-y-6">
              {travellerFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-5">
                  {/* Recessed icon — surface-high on surface-low background */}
                  <div className="mt-0.5 w-10 h-10 rounded-2xl bg-[#25293a] border border-gold-500/[0.15] flex items-center justify-center shrink-0">
                    <f.icon className="w-[18px] h-[18px] text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e3e3db] mb-1">{f.title}</p>
                    <p className="text-sm text-[#e3e3db]/50 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Block 2: Host — features left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="order-2 lg:order-1"
          >
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em] mb-4 block">
              For Hosts
            </span>
            <h3 className="font-heading text-3xl md:text-[42px] font-semibold text-[#e3e3db] leading-[1.1] tracking-tight mb-4">
              Revenue Intelligence, Redefined
            </h3>
            <p className="text-base text-[#e3e3db]/55 leading-relaxed mb-10 max-w-md">
              Turn your property into a high-performing asset. Real-time insights, automated
              pricing, and effortless inventory management — all in one dashboard.
            </p>
            <div className="space-y-6">
              {hostFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-5">
                  {/* surface (darkest) icon on surface-low section — creates depth */}
                  <div className="mt-0.5 w-10 h-10 rounded-2xl bg-[#0e1322] border border-gold-500/[0.12] flex items-center justify-center shrink-0">
                    <f.icon className="w-[18px] h-[18px] text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e3e3db] mb-1">{f.title}</p>
                    <p className="text-sm text-[#e3e3db]/50 leading-relaxed">{f.desc}</p>
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
            className="order-1 lg:order-2 group rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={HOST_IMAGE}
                alt="Luxury hotel lobby"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322]/60 to-transparent" />
              <div className="absolute bottom-5 right-5 bg-[#25293a]/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-[11px] font-semibold text-[#e3e3db]/90 tracking-wide border border-white/[0.08]">
                For Hosts
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats strip — deepest surface for contrast, carved into the section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease }}
          className="relative rounded-[2rem] bg-[#0e1322] p-10 sm:p-12 md:p-16 overflow-hidden"
        >
          {/* Ambient gold glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gold-500/[0.04] rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-gold-400/70 uppercase tracking-[0.25em] mb-10 text-center">
              Powering Travel at Scale
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-gold-400 tracking-tight mb-2">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-semibold text-[#e3e3db]/40 uppercase tracking-[0.2em]">
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
