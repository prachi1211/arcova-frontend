import { NavLink, Link } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, type UserRole } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { TRAVELLER_NAV, HOST_NAV, ADMIN_NAV, type NavItem } from '@/lib/constants';

const NAV_MAP: Record<UserRole, NavItem[]> = {
  traveller: TRAVELLER_NAV,
  host: HOST_NAV,
  admin: ADMIN_NAV,
};

const ROLE_LABEL: Record<UserRole, string> = {
  traveller: 'Traveller',
  host: 'Host',
  admin: 'Admin',
};

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const navItems = NAV_MAP[role];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-navy-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-navy-950 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0 lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <Link to={`/${role}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
              <span className="font-heading text-base font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-white">ARCOVA</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-xs font-medium text-white/30 uppercase tracking-widest">
            {ROLE_LABEL[role]} Portal
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === `/${role}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border-l-[3px] border-gold-500 pl-[calc(0.75rem-3px)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90 border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]',
                )
              }
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-gold-400">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {user?.fullName ?? 'Traveller'}
              </p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-all duration-150"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
