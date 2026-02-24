import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from '@/layouts/PublicLayout';
import { BrowseLayout } from '@/layouts/BrowseLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TravellerLayout } from '@/layouts/TravellerLayout';
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

          {/* Host & Admin — placeholders */}
          <Route element={<ProtectedRoute roles={['host']} />}>
            <Route path="/host/*" element={<div className="p-8 text-center text-warm-500">Host dashboard coming soon</div>} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/*" element={<div className="p-8 text-center text-warm-500">Admin dashboard coming soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
