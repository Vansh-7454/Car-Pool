import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to) => location.pathname === to;

  const profileTo = user
    ? user.role === 'driver'
      ? '/driver/profile'
      : user.role === 'admin'
      ? '/admin/dashboard'
      : '/user/profile'
    : '/auth/login';

  const navItems = [
    { label: 'Home', to: '/' },
    {
      label: 'Rides',
      to: user?.role === 'driver' ? '/driver/rides' : '/user/search',
    },
    {
      label: 'Offer Ride',
      to: user?.role === 'driver' ? '/driver/rides/new' : '/auth/signup',
    },
    {
      label: 'Bookings',
      to: user?.role === 'driver' ? '/driver/requests' : '/user/bookings',
    },
    { label: 'Profile', to: profileTo },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="text-sm font-semibold">GW</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[color:var(--color-text)]">
              Green Wheels
            </span>
            <span className="text-[11px] font-medium text-[color:var(--color-text-muted)]">
              Smart Tracking System
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-xs font-medium text-[color:var(--color-text-muted)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                isActive(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-slate-100 hover:text-[color:var(--color-text)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[color:var(--color-text)]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-ghost hidden md:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="btn-ghost hidden md:inline-flex">
                Login
              </Link>
              <Link to="/auth/signup" className="btn-primary text-xs">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-4 text-[11px] text-[color:var(--color-text-muted)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 md:flex-row">
        <p>© {new Date().getFullYear()} Green Wheels. Built for smart, eco-friendly commuting.</p>
        <div className="flex flex-wrap gap-3">
          <span>About</span>
          <span>Safety</span>
          <span>Help center</span>
          <span>Terms · Privacy</span>
        </div>
      </div>
    </footer>
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-bg-subtle)]">
      <TopBar />
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-6xl px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Sidebar({ title, items }) {
  return (
    <aside className="card w-64 shrink-0 bg-white/95">
      <div className="border-b border-slate-100 px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
          {title}
        </h3>
      </div>
      <nav className="space-y-1 px-3 py-4 text-sm">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center rounded-lg px-3 py-2 text-[13px] text-[color:var(--color-text-muted)] transition-colors hover:bg-slate-50 hover:text-[color:var(--color-text)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function UserLayout() {
  const items = [
    { to: '/user/dashboard', label: 'Overview' },
    { to: '/user/search', label: 'Find a Ride' },
    { to: '/user/bookings', label: 'My Bookings' },
    { to: '/user/notifications', label: 'Notifications' },
    { to: '/user/profile', label: 'Profile' },
  ];

  return (
    <div className="flex gap-6">
      <Sidebar title="Passenger Workspace" items={items} />
      <main className="flex-1 py-1">
        <Outlet />
      </main>
    </div>
  );
}

export function DriverLayout() {
  const items = [
    { to: '/driver/dashboard', label: 'Overview' },
    { to: '/driver/rides', label: 'My Rides' },
    { to: '/driver/rides/new', label: 'Offer a Ride' },
    { to: '/driver/requests', label: 'Booking Requests' },
    { to: '/driver/track', label: 'Live Tracking' },
    { to: '/driver/profile', label: 'Profile' },
  ];

  return (
    <div className="flex gap-6">
      <Sidebar title="Driver Console" items={items} />
      <main className="flex-1 py-1">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  const items = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/drivers/verification', label: 'Driver Verification' },
    { to: '/admin/analytics', label: 'Analytics' },
  ];

  return (
    <div className="flex gap-6">
      <Sidebar title="Admin Panel" items={items} />
      <main className="flex-1 py-1">
        <Outlet />
      </main>
    </div>
  );
}
