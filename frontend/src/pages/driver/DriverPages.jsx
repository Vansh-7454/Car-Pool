import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../../config/api';
import { MapPicker } from '../../components/MapPicker.jsx';
import { TrackingMap } from '../../components/TrackingMap.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function DriverDashboard() {
  return (
    <div className="space-y-5">
      <section className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Driver console</h2>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              Offer rides, manage requests and track your car in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/driver/rides/new" className="btn-primary text-xs">
              Offer a ride
            </Link>
            <Link to="/driver/requests" className="btn-secondary text-xs">
              Booking requests
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[11px] font-medium text-[color:var(--color-text-muted)]">Active rides today</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">3</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[11px] font-medium text-[color:var(--color-text-muted)]">Pending requests</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">5</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[11px] font-medium text-[color:var(--color-text-muted)]">Avg. rating</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">4.8 ★</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[11px] font-medium text-[color:var(--color-text-muted)]">CO₂ saved</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">26 kg</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function DriverRidesPage() {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await api.get('/rides/me');
        setRides(res.data);
      } catch (err) {
        try {
          const resAll = await api.get('/rides');
          const myId = user?.id;
          const mine = myId
            ? resAll.data.filter((r) => r.driver && (r.driver._id === myId || r.driver.id === myId))
            : [];
          setRides(mine);
          if (!myId) {
            setError('Could not determine current driver id while loading rides.');
          }
        } catch (err2) {
          setError(err2.response?.data?.message || 'Failed to load your rides');
          setRides([]);
        }
      }
    };

    load();
  }, [user]);

  const handleCancelRide = async (rideId) => {
    if (!rideId) return;
    try {
      await api.delete(`/rides/${rideId}`);
      setRides((prev) => prev.filter((r) => r._id !== rideId));
      showToast('Ride cancelled successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel ride', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">My rides</h2>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Overview of all routes you are offering on Green Wheels.
          </p>
        </div>
        <Link to="/driver/rides/new" className="btn-primary text-xs">
          Create new ride
        </Link>
      </header>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {rides.length === 0 && !error ? (
        <p className="text-xs text-[color:var(--color-text-muted)]">No rides created yet.</p>
      ) : rides.length === 0 && error ? null : (
        <ul className="space-y-3">
          {rides.map((ride) => (
            <li key={ride._id} className="card flex items-center justify-between gap-3 p-4 text-sm">
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-[color:var(--color-text)]">
                  {ride.startLocation.text} <span className="text-slate-400">→</span> {ride.endLocation.text}
                </p>
                <p className="text-[11px] text-[color:var(--color-text-muted)]">
                  Remaining seats: {ride.remainingSeats} · Price per seat: ₹{ride.pricePerSeat}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="badge-soft text-[color:var(--color-text-muted)]">{ride.status}</span>
                {ride.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleCancelRide(ride._id)}
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    Cancel ride
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DriverCreateRidePage() {
  const [form, setForm] = useState({
    startText: '',
    endText: '',
    date: '',
    time: '',
    totalSeats: 1,
    pricePerSeat: 0,
    notes: '',
  });
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const startDateTime = new Date(`${form.date}T${form.time}`);
      const payload = {
        startLocation: {
          text: form.startText,
          lat: startCoords?.lat,
          lng: startCoords?.lng,
        },
        endLocation: {
          text: form.endText,
          lat: endCoords?.lat,
          lng: endCoords?.lng,
        },
        waypoints: [],
        startDateTime,
        totalSeats: Number(form.totalSeats),
        pricePerSeat: Number(form.pricePerSeat),
        notes: form.notes,
      };
      const res = await api.post('/rides', payload);
      setMessage('Ride created');
      showToast('Your ride has been created and is now visible to passengers.', 'success');
      navigate('/driver/rides');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create ride';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Offer a new ride</h2>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Define your route, timing and pricing. Passengers will see this in search results.
        </p>
      </header>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Start location</label>
            <input
              name="startText"
              value={form.startText}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            <MapPicker label="Pick start on map" value={startCoords} onChange={setStartCoords} />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">End location</label>
            <input
              name="endText"
              value={form.endText}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            <MapPicker label="Pick end on map" value={endCoords} onChange={setEndCoords} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Total seats</label>
            <input
              type="number"
              name="totalSeats"
              min={1}
              value={form.totalSeats}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Price per seat</label>
            <input
              type="number"
              name="pricePerSeat"
              min={0}
              value={form.pricePerSeat}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-6 py-2 text-sm">
            Create ride
          </button>
        </div>
      </form>
    </div>
  );
}

export function DriverRequestsPage() {
  const [rides, setRides] = useState([]);
  const [selectedRideId, setSelectedRideId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await api.get('/rides/me');
        setRides(res.data);
      } catch (err) {
        try {
          const resAll = await api.get('/rides');
          const myId = user?.id;
          const mine = myId
            ? resAll.data.filter((r) => r.driver && (r.driver._id === myId || r.driver.id === myId))
            : [];
          setRides(mine);
          if (!myId) {
            setError('Could not determine current driver id while loading rides.');
          }
        } catch (err2) {
          setError(err2.response?.data?.message || 'Failed to load your rides');
          setRides([]);
        }
      }
    };

    load();
  }, [user]);

  const loadBookings = async (rideId) => {
    if (!rideId) return;
    setError('');
    try {
      const res = await api.get(`/bookings/ride/${rideId}`);
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
      setBookings([]);
    }
  };

  const handleSelectRide = (rideId) => {
    setSelectedRideId(rideId);
    loadBookings(rideId);
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/bookings/${id}/${action}`);
      if (selectedRideId) {
        await loadBookings(selectedRideId);
      }
      if (action === 'accept') {
        showToast('Booking accepted. Passenger has been notified.', 'success');
      } else if (action === 'reject') {
        showToast('Booking rejected.', 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Booking requests</h2>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Select one of your rides to review passenger requests and accept or decline them.
        </p>
      </header>

      <section className="card space-y-3 p-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text)]">Your rides</h3>
        {rides.length === 0 ? (
          <p className="text-xs text-[color:var(--color-text-muted)]">You have not created any rides yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rides.map((ride) => (
              <li
                key={ride._id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-[13px] ${
                  selectedRideId === ride._id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-[color:var(--color-text)]">
                    {ride.startLocation.text} <span className="text-slate-400">→</span> {ride.endLocation.text}
                  </p>
                  <p className="text-[11px] text-[color:var(--color-text-muted)]">
                    Ride ID: <span className="font-mono text-xs">{ride._id}</span> · Remaining seats:{' '}
                    {ride.remainingSeats}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectRide(ride._id)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  View requests
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {selectedRideId && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[color:var(--color-text)]">Requests for selected ride</h3>
          {bookings.length === 0 ? (
            <p className="text-xs text-[color:var(--color-text-muted)]">No booking requests yet for this ride.</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li key={b._id} className="card flex items-center justify-between gap-3 p-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-[color:var(--color-text)]">
                      Passenger: {b.passenger?.name || 'Passenger'} · Seats: {b.requestedSeats}
                    </p>
                    <p className="text-[11px] text-[color:var(--color-text-muted)]">Status: {b.status}</p>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(b._id, 'accept')}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(b._id, 'reject')}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {b.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => api.post(`/bookings/${b._id}/cancel`).then(() => {
                        loadBookings(selectedRideId);
                        showToast('Booking cancelled for this ride.', 'success');
                      }).catch((err) => {
                        showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
                      })}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Cancel booking
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export function DriverProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((res) => setProfile(res.data.user));
  }, []);

  if (!profile) {
    return <div className="text-sm text-[color:var(--color-text-muted)]">Loading profile 85</div>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Driver profile</h2>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Your public details as visible to passengers during booking.
        </p>
      </header>

      <section className="card flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
          {profile.name?.charAt(0).toUpperCase() || 'D'}
        </div>
        <div className="flex-1 space-y-1 text-sm">
          <p className="text-[13px] font-medium text-[color:var(--color-text)]">{profile.name}</p>
          <p className="text-[11px] text-[color:var(--color-text-muted)]">{profile.email}</p>
          {profile.phone && (
            <p className="text-[11px] text-[color:var(--color-text-muted)]">{profile.phone}</p>
          )}
        </div>
        <div className="space-y-1 text-right text-[11px]">
          <span className="badge-soft text-[color:var(--color-text-muted)]">Driver</span>
          <p className={profile.driverDetails?.isVerified ? 'text-emerald-600' : 'text-[color:var(--color-text-muted)]'}>
            {profile.driverDetails?.isVerified ? 'Verified driver' : 'Pending verification'}
          </p>
        </div>
      </section>
    </div>
  );
}

export function DriverTrackPage() {
  const [rideId, setRideId] = useState('');
  const [position, setPosition] = useState(null);
  const [socket, setSocket] = useState(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!rideId || !tracking) return;

    const s = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000');
    s.emit('join_ride', { rideId });
    setSocket(s);

    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          s.emit('driver_location', { rideId, lat: latitude, lng: longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      s.disconnect();
      setSocket(null);
    };
  }, [rideId, tracking]);

  const startTracking = () => {
    if (!rideId) return;
    setTracking(true);
  };

  const stopTracking = () => {
    setTracking(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Live tracking</h2>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Share your live car location with passengers for this ride.
        </p>
      </header>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="block text-[11px] font-medium text-[color:var(--color-text-muted)]">Ride ID</label>
            <input
              value={rideId}
              onChange={(e) => setRideId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          {!tracking ? (
            <button onClick={startTracking} className="btn-primary px-4 py-2 text-xs">
              Start tracking
            </button>
          ) : (
            <button onClick={stopTracking} className="btn-secondary px-4 py-2 text-xs">
              Stop tracking
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs text-[color:var(--color-text-muted)]">
          <p>Passengers see your live position and an updated ETA as long as tracking is on.</p>
        </div>

        <TrackingMap position={position} />
      </section>
    </div>
  );
}
