import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { LogOut, LayoutDashboard, BookOpen, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore } from '@/stores/tripStore';
import { TripPanel } from '@/components/shared/TripPanel';
import { AuthGateModal } from '@/components/shared/AuthGateModal';

const ROLE_HOME: Record<string, string> = {
  traveller: '/traveller',
  host: '/host',
  admin: '/admin',
};

export function BrowseLayout() {
  const { user, logout } = useAuthStore();
  const { pendingItem, addItem, setPendingItem, showAuthGate, setShowAuthGate } = useTripStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // After auth, auto-add any pending trip item
  useEffect(() => {
    if (user && pendingItem) {
      addItem(pendingItem);
      setPendingItem(null);
      setShowAuthGate(false);
    }
  }, [user, pendingItem, addItem, setPendingItem, setShowAuthGate]);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-warm-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-950 flex items-center justify-center">
              <span className="font-heading text-base font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-navy-950">
              ARCOVA
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Quick nav links — visible on md+ */}
                <nav className="hidden md:flex items-center gap-1">
                  {[
                    { label: 'Dashboard', href: ROLE_HOME[user.role], icon: LayoutDashboard },
                    { label: 'My Bookings', href: '/traveller/bookings', icon: BookOpen },
                    { label: 'AI Assistant', href: '/traveller/assistant', icon: Sparkles },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                        location.pathname === href
                          ? 'bg-gold-500/10 text-gold-600'
                          : 'text-warm-600 hover:text-navy-950 hover:bg-warm-100'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  ))}
                </nav>

                {/* Avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-warm-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-navy-950 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gold-400">{initials}</span>
                    </div>
                    <span className="text-sm font-medium text-navy-950 hidden sm:block">
                      {user.fullName ?? user.email}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-warm-200 shadow-lg z-20 py-1 overflow-hidden">
                        {/* Mobile-only links (hidden on md+) */}
                        <div className="md:hidden">
                          <Link
                            to={ROLE_HOME[user.role]}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-950 hover:bg-warm-50 transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-warm-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/traveller/bookings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-950 hover:bg-warm-50 transition-colors"
                          >
                            <BookOpen size={15} className="text-warm-400" />
                            My Bookings
                          </Link>
                          <Link
                            to="/traveller/assistant"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-950 hover:bg-warm-50 transition-colors"
                          >
                            <Sparkles size={15} className="text-warm-400" />
                            AI Assistant
                          </Link>
                          <div className="h-px bg-warm-100 my-1" />
                        </div>
                        {/* Desktop: just sign out */}
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-warm-700 hover:text-navy-950 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 rounded-xl bg-navy-950 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating trip panel */}
      <TripPanel />

      {/* Auth gate modal */}
      <AnimatePresence>
        {showAuthGate && (
          <AuthGateModal
            item={pendingItem}
            onClose={() => {
              setShowAuthGate(false);
              setPendingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
