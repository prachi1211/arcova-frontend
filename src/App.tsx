import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from '@/layouts/PublicLayout';
import { BrowseLayout } from '@/layouts/BrowseLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TravellerLayout } from '@/layouts/TravellerLayout';
import { HostLayout } from '@/layouts/HostLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// ─── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

const Search = lazy(() => import('@/pages/traveller/Search'));
const HotelDetail = lazy(() => import('@/pages/traveller/HotelDetail'));
const TravellerDashboard = lazy(() => import('@/pages/traveller/Dashboard'));
const Bookings = lazy(() => import('@/pages/traveller/Bookings'));
const Assistant = lazy(() => import('@/pages/traveller/Assistant'));

const HostDashboard = lazy(() => import('@/pages/host/Dashboard'));
const Properties = lazy(() => import('@/pages/host/Properties'));
const NewProperty = lazy(() => import('@/pages/host/NewProperty'));
const PropertyDetail = lazy(() => import('@/pages/host/PropertyDetail'));
const HostBookings = lazy(() => import('@/pages/host/Bookings'));
const Analytics = lazy(() => import('@/pages/host/Analytics'));
const Pricing = lazy(() => import('@/pages/host/Pricing'));
const Availability = lazy(() => import('@/pages/host/Availability'));
const Reviews = lazy(() => import('@/pages/host/Reviews'));

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('@/pages/admin/Properties'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminBookings = lazy(() => import('@/pages/admin/Bookings'));

// ─── Query client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// ─── Page transition fallback ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-50">
      <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public — landing page with full Navbar + Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>

            {/* Browse — public pages with slim navbar, no login required */}
            <Route element={<BrowseLayout />}>
              <Route path="/search" element={<Search />} />
              <Route path="/hotel/:id" element={<HotelDetail />} />
            </Route>

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Traveller — protected, sidebar layout */}
            <Route element={<ProtectedRoute roles={['traveller']} />}>
              <Route element={<TravellerLayout />}>
                <Route path="/traveller" element={<TravellerDashboard />} />
                <Route path="/traveller/bookings" element={<Bookings />} />
                <Route path="/traveller/assistant" element={<Assistant />} />
              </Route>
            </Route>

            {/* Host — full portal */}
            <Route element={<ProtectedRoute roles={['host']} />}>
              <Route element={<HostLayout />}>
                <Route path="/host" element={<HostDashboard />} />
                <Route path="/host/properties" element={<Properties />} />
                <Route path="/host/properties/new" element={<NewProperty />} />
                <Route path="/host/properties/:id" element={<PropertyDetail />} />
                <Route path="/host/bookings" element={<HostBookings />} />
                <Route path="/host/analytics" element={<Analytics />} />
                <Route path="/host/pricing" element={<Pricing />} />
                <Route path="/host/availability" element={<Availability />} />
                <Route path="/host/reviews" element={<Reviews />} />
              </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
