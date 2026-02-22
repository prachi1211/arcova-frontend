import { Outlet, Link } from 'react-router-dom';
import { motion } from 'motion/react';

const QUOTES = [
  { text: 'The world is a book, and those who do not travel read only one page.', author: 'Saint Augustine' },
  { text: 'Travel is the only thing you buy that makes you richer.', author: 'Anonymous' },
  { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
];

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

const BG_IMAGE =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding + image ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={BG_IMAGE} alt="Travel destination" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gold-500/20 border border-gold-500/30">
              <span className="font-heading text-lg font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white">ARCOVA</span>
          </Link>

          {/* Quote at bottom */}
          <div className="mt-auto">
            <div className="w-10 h-px bg-gold-500 mb-6" />
            <blockquote className="text-white/80 text-lg font-heading italic leading-relaxed mb-3">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="text-gold-400 text-sm font-medium tracking-wide">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-warm-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-warm-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-950">
              <span className="font-heading text-base font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-navy-950">ARCOVA</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px]"
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-warm-200 text-center">
          <p className="text-xs text-warm-500">
            &copy; {new Date().getFullYear()} Arcova. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
