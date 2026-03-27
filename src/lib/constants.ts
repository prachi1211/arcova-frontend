import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Sparkles,
  Building2,
  BarChart3,
  Tag,
  CalendarDays,
  Users,
  Star,
  HeadphonesIcon,
} from 'lucide-react';
import type { BookingStatus, PropertyStatus } from '@/types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const TRAVELLER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/traveller', icon: LayoutDashboard },
  { label: 'Search Hotels', href: '/search', icon: Search },
  { label: 'My Bookings', href: '/traveller/bookings', icon: CalendarCheck },
  { label: 'AI Assistant', href: '/traveller/assistant', icon: Sparkles },
  { label: 'Contact Support', href: '/traveller/support', icon: HeadphonesIcon },
];

export const HOST_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { label: 'Properties', href: '/host/properties', icon: Building2 },
  { label: 'Bookings', href: '/host/bookings', icon: CalendarCheck },
  { label: 'Analytics', href: '/host/analytics', icon: BarChart3 },
  { label: 'Pricing', href: '/host/pricing', icon: Tag },
  { label: 'Availability', href: '/host/availability', icon: CalendarDays },
  { label: 'Reviews', href: '/host/reviews', icon: Star },
  { label: 'Contact Support', href: '/host/support', icon: HeadphonesIcon },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Support', href: '/admin/support', icon: HeadphonesIcon },
];

/* Status badge styles — dark-surface optimised, ghost borders only */
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  no_show: 'bg-white/[0.05] text-[#e3e3db]/45 border border-white/[0.08]',
};

export const PROPERTY_STATUS_STYLES: Record<PropertyStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  inactive: 'bg-white/[0.05] text-[#e3e3db]/45 border border-white/[0.08]',
  pending_review: 'bg-gold-500/10 text-gold-400 border border-gold-500/20',
};

export const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  pool: 'Pool',
  spa: 'Spa',
  gym: 'Gym',
  restaurant: 'Restaurant',
  bar: 'Bar',
  parking: 'Parking',
  beach_access: 'Beach Access',
  room_service: 'Room Service',
  concierge: 'Concierge',
  airport_shuttle: 'Airport Shuttle',
  pet_friendly: 'Pet Friendly',
};
