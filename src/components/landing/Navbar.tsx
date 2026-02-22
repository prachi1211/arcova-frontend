import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Experience', href: '#experience' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scrolled || mobileOpen
          ? 'bg-white/90 backdrop-blur-xl border-b border-warm-200/50'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center gap-3 group cursor-pointer">
            <div
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500',
                scrolled || mobileOpen ? 'bg-navy-950' : 'bg-white/15 backdrop-blur-sm',
              )}
            >
              <span
                className={cn(
                  'font-heading text-xl font-bold transition-colors duration-500',
                  scrolled || mobileOpen ? 'text-gold-500' : 'text-gold-400',
                )}
              >
                A
              </span>
            </div>
            <span
              className={cn(
                'font-heading text-[22px] font-bold tracking-tight transition-colors duration-500',
                scrolled || mobileOpen ? 'text-navy-950' : 'text-white',
              )}
            >
              ARCOVA
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-12">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-[13px] font-semibold uppercase tracking-[0.15em] transition-colors duration-500',
                    scrolled
                      ? 'text-warm-600 hover:text-gold-600'
                      : 'text-white/70 hover:text-white',
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div
              className={cn(
                'h-6 w-px transition-colors duration-500',
                scrolled ? 'bg-warm-200' : 'bg-white/20',
              )}
            />
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className={cn(
                  'text-[13px] font-semibold transition-colors duration-500',
                  scrolled
                    ? 'text-navy-950 hover:text-gold-600'
                    : 'text-white/90 hover:text-white',
                )}
              >
                Log In
              </Link>
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-2.5 text-[13px] font-semibold text-navy-950 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'lg:hidden p-2 transition-colors duration-500',
              scrolled || mobileOpen ? 'text-navy-950' : 'text-white',
            )}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={
          mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-warm-200 overflow-hidden"
      >
        <div className="px-6 py-8 space-y-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-xl font-heading font-bold text-navy-950"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-6 border-t border-warm-200 flex flex-col gap-3">
            <Link
              to="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-12 rounded-xl border border-warm-200 text-sm font-semibold text-navy-950 hover:bg-warm-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/auth/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-12 rounded-xl bg-gold-500 text-sm font-semibold text-navy-950 hover:bg-gold-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
