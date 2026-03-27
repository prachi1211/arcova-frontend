import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { label: 'Experience', href: '#experience' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

const ROLE_HOME: Record<string, string> = {
  traveller: '/traveller',
  host: '/host',
  admin: '/admin',
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scrolled || mobileOpen
          /* Glassmorphism — surface-variant 60% + 20px blur + ghost border */
          ? 'bg-[#161b2b]/60 backdrop-blur-[20px] border-b border-white/[0.07]'
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
                scrolled || mobileOpen ? 'bg-[#25293a]' : 'bg-white/[0.08] backdrop-blur-sm',
              )}
            >
              <span className="font-heading text-xl font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-[22px] font-bold tracking-tight text-white">
              ARCOVA
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#e3e3db]/55 hover:text-[#e3e3db] transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/search"
                className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#e3e3db]/55 hover:text-[#e3e3db] transition-colors duration-300"
              >
                Search
              </Link>
            </div>

            <div className="h-6 w-px bg-white/[0.12]" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25293a] border border-white/[0.1] flex items-center justify-center">
                    <span className="text-xs font-semibold text-gold-400">{initials}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#e3e3db]">
                    {user.fullName?.split(' ')[0] ?? 'Account'}
                  </span>
                </button>

                {avatarOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAvatarOpen(false)} />
                    {/* Glass dropdown — no hard border, ghost outline */}
                    <div className="absolute right-0 mt-2 w-48 bg-[#25293a]/80 backdrop-blur-[20px] rounded-2xl border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.45)] z-20 py-1.5 overflow-hidden">
                      <Link
                        to={ROLE_HOME[user.role]}
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#e3e3db]/80 hover:text-[#e3e3db] hover:bg-white/[0.06] transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-gold-400/70" /> Dashboard
                      </Link>
                      <div className="my-1 h-px bg-white/[0.06]" />
                      <button
                        onClick={() => { logout(); setAvatarOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-300 hover:bg-white/[0.04] transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/auth/login"
                  className="text-[13px] font-semibold text-[#e3e3db]/70 hover:text-[#e3e3db] transition-colors duration-300"
                >
                  Log In
                </Link>
                {/* Gold gradient CTA — signature primary button */}
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gold-gradient px-7 py-2.5 text-[13px] font-semibold text-navy-950 hover:opacity-90 active:opacity-80 transition-all duration-200 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30"
                  style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#e3e3db]/70 hover:text-[#e3e3db] transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — dark glass surface */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="lg:hidden bg-[#161b2b]/95 backdrop-blur-[20px] border-b border-white/[0.05] overflow-hidden"
      >
        <div className="px-6 py-8 space-y-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-xl font-heading font-bold text-[#e3e3db]"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/search"
            onClick={() => setMobileOpen(false)}
            className="block text-xl font-heading font-bold text-[#e3e3db]"
          >
            Search Hotels
          </Link>
          <div className="pt-6 border-t border-white/[0.07] flex flex-col gap-3">
            {user ? (
              <Link
                to={ROLE_HOME[user.role]}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-2xl bg-[#25293a] border border-white/[0.08] text-sm font-semibold text-[#e3e3db] hover:bg-[#2f3445] transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-12 rounded-2xl border border-white/[0.12] text-sm font-semibold text-[#e3e3db]/80 hover:bg-white/[0.05] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-12 rounded-2xl text-sm font-semibold text-navy-950 transition-colors"
                  style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
