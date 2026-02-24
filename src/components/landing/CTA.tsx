import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'motion/react';

const CTA_IMAGE =
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1920&q=80';

export function CTA() {
  return (
    <section className="relative py-28 md:py-44 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={CTA_IMAGE}
          alt="Luxury overwater villa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/78 backdrop-blur-[1px]" />
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-navy-700/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="w-10 h-px bg-gold-500/60" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              Start Today · No Credit Card Required
            </span>
            <span className="w-10 h-px bg-gold-500/60" />
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.05] tracking-tight mb-8 md:mb-12">
            Your Journey
            <br />
            <span className="italic text-gold-400">Awaits.</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-warm-300 mb-10 md:mb-14 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of discerning travellers and hospitality professionals who trust Arcova
            to make every journey extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2.5 h-14 md:h-16 px-10 md:px-14 rounded-full text-[15px] md:text-base font-semibold bg-gold-500 text-navy-950 hover:bg-gold-400 active:bg-gold-600 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all duration-300"
            >
              <Search size={18} />
              Start Exploring
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2.5 h-14 md:h-16 px-10 md:px-14 rounded-full text-[15px] md:text-base font-semibold border border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
