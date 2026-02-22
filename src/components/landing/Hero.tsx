import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Background image with Ken Burns effect ── */}
      <div className="absolute inset-0 bg-navy-950">
        <motion.img
          src={HERO_IMAGE}
          alt="Aerial view of a pristine tropical coastline"
          style={{ scale: imageScale }}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        />

        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/50 to-navy-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/30" />

        {/* Subtle noise grain for filmic quality */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full pt-28 pb-20 md:pt-32 md:pb-24"
      >
        <div className="max-w-2xl mx-auto text-center md:mx-0 md:text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-8 justify-center md:justify-start"
          >
            <span className="w-10 h-px bg-gold-500" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              AI-Powered Travel
            </span>
            <span className="w-10 h-px bg-gold-500 md:hidden" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[44px] leading-[1] sm:text-[64px] md:text-[80px] lg:text-[96px] font-semibold text-white tracking-tight mb-6 md:mb-8"
          >
            Where Journey
            <br />
            Meets Its{' '}
            <span className="italic text-gold-400">Destination.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-lg mx-auto md:mx-0 mb-8 md:mb-10"
          >
            <span className="text-white/90 font-medium">Arc</span> — the journey.{' '}
            <span className="text-white/90 font-medium">Cova</span> — the destination.
            <br className="hidden sm:block" />
            One platform to discover, plan, and book extraordinary travel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-full text-[15px] font-semibold bg-gold-500 text-navy-950 hover:bg-gold-400 active:bg-gold-600 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="w-[18px] h-[18px]" />
            </Link>
            <a
              href="#experience"
              className="inline-flex items-center justify-center h-14 px-10 rounded-full text-[15px] font-semibold border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Explore Platform
            </a>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 md:mt-16 flex items-center gap-5 justify-center md:justify-start"
          >
            <div className="flex -space-x-2.5">
              {['SC', 'MR', 'AP', 'JK'].map((initials) => (
                <div
                  key={initials}
                  className="w-9 h-9 rounded-full border-2 border-navy-950/40 bg-white/15 backdrop-blur-sm flex items-center justify-center text-[9px] font-bold text-white/90"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <div className="flex items-center gap-0.5 text-gold-400 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
              <p className="text-[11px] font-medium text-white/50 tracking-wide">
                10,000+ travelers worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Location badge (editorial touch) ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-24 right-6 md:right-12 z-10 hidden md:flex items-center gap-2.5 bg-white/[0.08] backdrop-blur-md rounded-full px-5 py-2.5 border border-white/[0.08]"
      >
        <MapPin size={13} className="text-gold-400" />
        <span className="text-[11px] font-medium text-white/60 tracking-wide">
          Turks &amp; Caicos Islands
        </span>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">
            Scroll
          </span>
          <div className="w-[22px] h-[34px] rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-[3px] h-[6px] bg-white/50 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
