import './App.css';
import { Routes, Route } from 'react-router-dom';
import { MainLayout, UserLayout, DriverLayout, AdminLayout } from './components/Layouts.jsx';
import { ProtectedRoute, RoleGuard } from './components/RouteGuards.jsx';
import { LoginPage, SignupPage } from './pages/auth/AuthPages.jsx';
import {
  LandingPage,
  UserDashboard,
  UserSearchRides,
  UserRideDetailsPage,
  UserBookingsPage,
  UserNotificationsPage,
  UserProfilePage,
} from './pages/user/UserPages.jsx';
import {
  DriverDashboard,
  DriverRidesPage,
  DriverCreateRidePage,
  DriverRequestsPage,
  DriverProfilePage,
  DriverTrackPage,
} from './pages/driver/DriverPages.jsx';
import {
  AdminDashboard,
  AdminDriverVerificationPage,
  AdminAnalyticsPage,
} from './pages/admin/AdminPages.jsx';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/signup" element={<SignupPage />} />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          {/* User */}
          <Route element={<RoleGuard allowedRoles={['passenger', 'driver', 'admin']} />}>
            <Route path="user" element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="search" element={<UserSearchRides />} />
              <Route path="rides/:id" element={<UserRideDetailsPage />} />
              <Route path="bookings" element={<UserBookingsPage />} />
              <Route path="notifications" element={<UserNotificationsPage />} />
              <Route path="profile" element={<UserProfilePage />} />
            </Route>
          </Route>

          {/* Driver */}
          <Route element={<RoleGuard allowedRoles={['driver']} />}>
            <Route path="driver" element={<DriverLayout />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="rides" element={<DriverRidesPage />} />
              <Route path="rides/new" element={<DriverCreateRidePage />} />
              <Route path="requests" element={<DriverRequestsPage />} />
              <Route path="track" element={<DriverTrackPage />} />
              <Route path="profile" element={<DriverProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="drivers/verification" element={<AdminDriverVerificationPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
