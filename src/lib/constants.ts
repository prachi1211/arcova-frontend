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
];

export const HOST_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { label: 'Properties', href: '/host/properties', icon: Building2 },
  { label: 'Bookings', href: '/host/bookings', icon: CalendarCheck },
  { label: 'Analytics', href: '/host/analytics', icon: BarChart3 },
  { label: 'Pricing', href: '/host/pricing', icon: Tag },
  { label: 'Availability', href: '/host/availability', icon: CalendarDays },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
];

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  no_show: 'bg-warm-100 text-warm-600 border border-warm-200',
};

export const PROPERTY_STATUS_STYLES: Record<PropertyStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive: 'bg-warm-100 text-warm-600 border border-warm-200',
  pending_review: 'bg-gold-100 text-gold-600 border border-gold-300',
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
