import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Frequent Traveller',
    initials: 'SC',
    quote:
      'Arcova completely changed how I plan trips. The AI assistant suggested a hidden coastal town in Portugal I never would have found on my own — and booked everything in under 20 minutes.',
  },
  {
    name: 'Marco Rivera',
    role: 'Hotel Host · Rome',
    initials: 'MR',
    quote:
      'As a host, the analytics dashboard gives me insights I used to pay a consultant for. Occupancy is up 31% since I started using the dynamic pricing tools. It practically runs itself.',
  },
  {
    name: 'Aisha Patel',
    role: 'Digital Nomad',
    initials: 'AP',
    quote:
      'I planned a 10-day trip across Japan, South Korea, and Thailand in under an hour. The itinerary was spot on — every hotel pick was exactly what I asked for. Genuinely impressive.',
  },
];

export function Testimonials() {
  return (
    /* surface-low — creates tonal rhythm with adjacent surface sections */
    <section id="testimonials" className="relative py-24 md:py-36 bg-[#161b2b] overflow-hidden noise-overlay">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="w-10 h-px bg-gold-500/60" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              Voices of Excellence
            </span>
            <span className="w-10 h-px bg-gold-500/60" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-[#e3e3db] tracking-tight">
            Trusted by the <span className="italic text-gold-400">Discerning.</span>
          </h2>
        </motion.div>

        {/* Cards — surface-high chips sitting on surface-low, NO border lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              /* surface-high on surface-low — tonal depth, no border required */
              className="relative p-8 sm:p-10 md:p-12 bg-[#25293a] rounded-[2rem] group hover:bg-[#2f3445] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle top-left gold glow on hover */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gold-500/[0.06] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Decorative quote icon */}
              <Quote className="absolute top-8 right-8 md:top-10 md:right-10 text-gold-500/[0.08] w-14 h-14 md:w-16 md:h-16" />

              {/* Avatar + info */}
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 rounded-full bg-[#0e1322] flex items-center justify-center text-[12px] font-bold text-gold-400 shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e3e3db]">{t.name}</p>
                  <p className="text-[11px] text-[#e3e3db]/45 font-medium mt-0.5">{t.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} className="text-gold-500 fill-gold-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] md:text-base text-[#e3e3db]/65 leading-relaxed italic relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
