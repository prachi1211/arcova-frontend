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
    <section id="testimonials" className="py-24 md:py-32 bg-warm-50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="w-10 h-px bg-gold-500" />
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-[0.25em]">
              Voices of Excellence
            </span>
            <span className="w-10 h-px bg-gold-500" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-navy-950 tracking-tight">
            Trusted by the <span className="italic text-gold-500">Discerning.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-8 sm:p-10 md:p-12 bg-white rounded-3xl md:rounded-[36px] border border-warm-200 group hover:shadow-xl hover:shadow-navy-950/[0.04] transition-all duration-500 hover:-translate-y-1"
            >
              {/* Decorative quote */}
              <Quote className="absolute top-8 right-8 md:top-10 md:right-10 text-gold-500/10 w-14 h-14 md:w-16 md:h-16" />

              {/* Avatar + info */}
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 rounded-full bg-navy-950 flex items-center justify-center text-[12px] font-bold text-gold-400 shadow-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-950">{t.name}</p>
                  <p className="text-[11px] text-warm-500 font-medium mt-0.5">{t.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} className="text-gold-500 fill-gold-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] md:text-base text-warm-700 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
