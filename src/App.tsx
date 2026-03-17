import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from '@/layouts/PublicLayout';
import { BrowseLayout } from '@/layouts/BrowseLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TravellerLayout } from '@/layouts/TravellerLayout';
import { HostLayout } from '@/layouts/HostLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProperties from '@/pages/admin/Properties';
import AdminUsers from '@/pages/admin/Users';
import AdminBookings from '@/pages/admin/Bookings';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Search from '@/pages/traveller/Search';
import HotelDetail from '@/pages/traveller/HotelDetail';
import TravellerDashboard from '@/pages/traveller/Dashboard';
import Bookings from '@/pages/traveller/Bookings';
import Assistant from '@/pages/traveller/Assistant';
import HostDashboard from '@/pages/host/Dashboard';
import Properties from '@/pages/host/Properties';
import NewProperty from '@/pages/host/NewProperty';
import PropertyDetail from '@/pages/host/PropertyDetail';
import HostBookings from '@/pages/host/Bookings';
import Analytics from '@/pages/host/Analytics';
import Pricing from '@/pages/host/Pricing';
import Availability from '@/pages/host/Availability';
import Reviews from '@/pages/host/Reviews';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
