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
  badgeCounts?: Record<string, number>;
}

export function Sidebar({ role, badgeCounts = {} }: SidebarProps) {
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
          className="fixed inset-0 z-20 bg-[#0e1322]/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — surface base (#0e1322), no hard top/bottom borders */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-[#0e1322] flex flex-col transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0 lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo header — surface-low tonal block, no hard border */}
        <div className="flex items-center justify-between h-16 px-5 bg-[#161b2b]">
          <Link to={`/${role}`} className="flex items-center gap-2.5 group">
            {/* surface-high icon on surface-low header */}
            <div className="w-8 h-8 rounded-xl bg-[#25293a] flex items-center justify-center transition-all duration-300 group-hover:bg-[#2f3445]">
              <span className="font-heading text-base font-bold text-gold-400">A</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#e3e3db]">ARCOVA</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#e3e3db]/30 hover:text-[#e3e3db]/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge — tonal separation via bg-shift, no border */}
        <div className="px-5 py-2.5 bg-[#161b2b]">
          <span className="text-[10px] font-semibold text-gold-400/50 uppercase tracking-[0.2em]">
            {ROLE_LABEL[role]} Portal
          </span>
        </div>

        {/* Tonal gap — space is the separator */}
        <div className="h-3" />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const badge = badgeCounts[href];
            return (
              <NavLink
                key={href}
                to={href}
                end={href === `/${role}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive
                      /* Active: surface-high bg + gold text + gold left accent */
                      ? 'bg-[#25293a] text-gold-400 border-l-[3px] border-gold-500 pl-[calc(0.75rem-3px)]'
                      /* Idle: transparent, warm white text, surface-highest on hover */
                      : 'text-[#e3e3db]/45 hover:bg-[#161b2b] hover:text-[#e3e3db]/80 border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]',
                  )
                }
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {badge != null && badge > 0 && (
                  <span
                    className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-navy-950 text-[11px] font-bold flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer — surface-low tonal block */}
        <div className="p-4 bg-[#161b2b] mt-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#25293a] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-gold-400">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e3e3db]/85 truncate">
                {user?.fullName ?? 'User'}
              </p>
              <p className="text-xs text-[#e3e3db]/35 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#e3e3db]/35 hover:bg-[#25293a] hover:text-[#e3e3db]/70 transition-all duration-150"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
