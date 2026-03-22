// ─── Auth & User ───────────────────────────────────────────────────────────

export type UserRole = 'traveller' | 'host' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

// ─── Properties ────────────────────────────────────────────────────────────

export type PropertyStatus = 'active' | 'inactive' | 'pending_review';

export interface Property {
  id: string;
  hostId: string;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  thumbnailUrl: string;
  imageUrls: string[];
  amenities: string[];
  status: PropertyStatus;
  basePriceCents: number;
  totalRooms: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertySummary {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  thumbnailUrl: string;
  amenities: string[];
  status: PropertyStatus;
  basePriceCents: number;
}

// ─── Room Types ─────────────────────────────────────────────────────────────

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  maxGuests: number;
  totalRooms: number;
  basePriceCents: number;
  amenities: string[];
  imageUrls: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  travellerId: string;
  propertyId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  totalPriceCents: number;
  netRevenueCents: number;
  bookedAt: string;
  cancelledAt?: string;
  paymentStatus?: PaymentStatus | null;
  // joined
  property?: PropertySummary;
  roomType?: Pick<RoomType, 'id' | 'name' | 'maxGuests'>;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  stars?: number[];
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  property: Property;
  availableRoomTypes: RoomType[];
  effectivePriceCents: number;
  availableRooms: number;
}

// ─── Pricing ────────────────────────────────────────────────────────────────

export type PricingRuleType = 'percentage' | 'fixed';

export interface PricingRule {
  id: string;
  propertyId: string;
  roomTypeId?: string;
  name: string;
  ruleType: PricingRuleType;
  value: number;
  startDate: string;
  endDate: string;
  daysOfWeek?: number[];
  minNights?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Availability ────────────────────────────────────────────────────────────

export interface Availability {
  id: string;
  roomTypeId: string;
  date: string;
  availableRooms: number;
  isClosed: boolean;
  overridePriceCents?: number;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalRevenueCents: number;
  revenueChangePct: number;
  totalBookings: number;
  bookingsChangePct: number;
  occupancyRate: number;
  occupancyChangePct: number;
  avgNightlyRateCents: number;
  rateChangePct: number;
}

export interface RevenuePoint {
  date: string;
  revenueCents: number;
  netRevenueCents: number;
  bookings: number;
}

// ─── Chat / AI ───────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface TripPlan {
  destination: string;
  duration: string;
  budget: string;
  highlights: string[];
  itinerary: {
    day: number;
    title: string;
    activities: string[];
    hotel?: string;
    meals?: string[];
  }[];
  tips: string[];
}

// ─── Search History ──────────────────────────────────────────────────────────

export interface SearchHistory {
  id: string;
  travellerId: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  searchedAt: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  travellerId: string;
  propertyId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  traveller?: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  hostResponse?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  results: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminProperty {
  id: string;
  name: string;
  city: string;
  country: string;
  status: PropertyStatus;
  starRating: number | null;
  totalRooms: number;
  rejectionReason: string | null;
  createdAt: string;
  host: { id: string; fullName: string | null; email: string } | null;
}

export interface AdminBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPriceCents: number;
  status: string;
  bookedAt: string;
  traveller: { id: string; fullName: string | null; email: string } | null;
  property: { id: string; name: string; city: string } | null;
}

export interface PlatformStats {
  totalUsers: number;
  totalHosts: number;
  totalTravellers: number;
  totalProperties: number;
  pendingProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenueCents: number;
}

// ─── Support Tickets ─────────────────────────────────────────────────────────

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_role: 'traveller' | 'host';
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
  details?: unknown[];
}
