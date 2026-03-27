import { Menu } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    /* surface-low — one tone above base, ghost border as accessibility fallback */
    <header className="h-14 bg-[#161b2b] border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-[#e3e3db]/40 hover:text-[#e3e3db]/80 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {title && (
          <span className="text-sm font-medium text-[#e3e3db]/45 hidden md:block">{title}</span>
        )}
      </div>

      {/* Right — avatar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#25293a] border border-white/[0.08] flex items-center justify-center">
          <span className="text-xs font-semibold text-gold-400">{initials}</span>
        </div>
      </div>
    </header>
  );
}
