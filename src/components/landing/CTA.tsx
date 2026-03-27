import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'motion/react';

const CTA_IMAGE =
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1920&q=80';

export function CTA() {
  return (
    <section className="relative py-28 md:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={CTA_IMAGE}
          alt="Luxury overwater villa"
          className="w-full h-full object-cover"
        />
        {/* Deeper overlay — occlusion of the navy, not pure black */}
        <div className="absolute inset-0 bg-[#0e1322]/82 backdrop-blur-[2px]" />
        {/* Noise texture for tactile depth */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Ambient gold glow — central warmth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold-500/[0.08] rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 justify-center mb-10">
            <span className="w-10 h-px bg-gold-500/50" />
            <span className="text-[11px] font-semibold text-gold-400/80 uppercase tracking-[0.25em]">
              Start Today · No Credit Card Required
            </span>
            <span className="w-10 h-px bg-gold-500/50" />
          </div>

          {/* Headline — max editorial scale */}
          <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-semibold text-[#e3e3db] leading-[1] tracking-tight mb-8 md:mb-12">
            Your Journey
            <br />
            <span className="italic text-gold-400">Awaits.</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-[#e3e3db]/55 mb-12 md:mb-16 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of discerning travellers and hospitality professionals who trust Arcova
            to make every journey extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
            {/* Signature gold gradient primary CTA */}
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2.5 h-14 md:h-16 px-10 md:px-14 rounded-full text-[15px] md:text-base font-semibold text-navy-950 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 hover:opacity-90 active:opacity-80 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
            >
              <Search size={18} />
              Start Exploring
            </Link>
            {/* Ghost secondary — pill, no fill, gold ghost border */}
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2.5 h-14 md:h-16 px-10 md:px-14 rounded-full text-[15px] md:text-base font-semibold border border-gold-500/30 text-gold-400 hover:bg-gold-500/[0.08] hover:border-gold-500/50 transition-all duration-300"
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
