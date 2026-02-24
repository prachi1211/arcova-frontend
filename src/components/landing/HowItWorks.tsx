import { Search, Sparkles, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search & Discover',
    description:
      'Browse hundreds of handpicked properties worldwide. Filter by destination, dates, and budget — no account needed to explore.',
    cta: { label: 'Start Exploring', href: '/search' },
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Plan with AI',
    description:
      'Let our concierge AI craft a personalised itinerary — stays, activities, and local tips — tailored to your style and budget in minutes.',
    cta: null,
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'Book with Confidence',
    description:
      'Reserve your stay in seconds. Free cancellation on most properties, transparent pricing, and 24/7 support throughout your trip.',
    cta: { label: 'Create Account', href: '/auth/signup' },
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-navy-950 overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-500/[0.05] rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="w-10 h-px bg-gold-500/60" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              Simple by Design
            </span>
            <span className="w-10 h-px bg-gold-500/60" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
            Travel Made{' '}
            <span className="italic text-gold-400">Effortless.</span>
          </h2>
          <p className="text-base md:text-lg text-warm-500 max-w-xl mx-auto leading-relaxed mt-5">
            From first search to final checkout — a seamless experience built around how you
            actually travel.
          </p>
        </motion.div>

        {/* Glass step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.14, duration: 0.7, ease }}
              className="group relative rounded-3xl p-8 md:p-10 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-gold-500/25 hover:bg-white/[0.07] transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* Subtle card glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gold-500/[0.06] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Large decorative number */}
              <span className="absolute top-4 right-6 font-heading text-[5rem] font-bold leading-none text-white/[0.15] select-none pointer-events-none">
                {step.number}
              </span>

              {/* Icon */}
              <div className="relative mb-7 w-12 h-12 rounded-xl flex items-center justify-center bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/15 group-hover:border-gold-500/35 transition-all duration-400">
                <step.icon size={20} className="text-gold-400" />
              </div>

              {/* Step label */}
              <span className="text-[10px] font-bold text-gold-500/60 uppercase tracking-[0.2em] mb-3 block relative">
                Step {step.number}
              </span>

              {/* Title */}
              <h3 className="font-heading text-2xl md:text-[26px] font-semibold text-white tracking-tight leading-[1.15] mb-4 relative">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-[15px] text-warm-500 leading-relaxed flex-1 relative">
                {step.description}
              </p>

              {/* CTA */}
              {step.cta && (
                <Link
                  to={step.cta.href}
                  className="inline-flex items-center gap-2 mt-7 text-[13px] font-semibold text-gold-400 hover:text-gold-300 transition-colors group/link relative"
                >
                  {step.cta.label}
                  <span className="group-hover/link:translate-x-1 transition-transform duration-200 inline-block">
                    →
                  </span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
