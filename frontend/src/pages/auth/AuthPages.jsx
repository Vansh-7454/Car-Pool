import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'driver') navigate('/driver/dashboard');
      else if (res.data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl items-center gap-10 rounded-3xl bg-white/90 p-6 shadow-soft">
      <div className="hidden flex-1 flex-col justify-between rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-secondary/80 p-6 text-white shadow-md md:flex">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary/20">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold">Green Wheels</h2>
          <p className="mt-2 text-sm text-slate-100">
            Track your carpools, manage bookings and stay synced with your driver in real time.
          </p>
        </div>
        <div className="mt-6 space-y-3 text-xs text-slate-100/90">
          <div className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2 backdrop-blur">
            <span>On-time arrival rate</span>
            <span className="font-semibold">98%</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2 backdrop-blur">
            <span>Average ride rating</span>
            <span className="font-semibold">4.8/5</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Sign in to your account</h2>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          Use your Green Wheels credentials to continue.
        </p>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            Login
          </button>
          <p className="pt-1 text-center text-[11px] text-[color:var(--color-text-muted)]">
            Don't have an account?{' '}
            <span className="font-medium text-primary">
              <a href="/auth/signup">Create one</a>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export function SignupPage() {
  const [role, setRole] = useState('passenger');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [driverDetails, setDriverDetails] = useState({
    vehicleModel: '',
    vehicleNumber: '',
    vehicleSeats: 4,
    licenseFile: null,
    aadhaarFile: null,
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e) => {
    setDriverDetails({ ...driverDetails, [e.target.name]: e.target.value });
  };

  const handleDriverFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;
    setDriverDetails((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (role === 'driver') {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('phone', form.phone);
        formData.append('role', role);
        formData.append('vehicleModel', driverDetails.vehicleModel);
        formData.append('vehicleNumber', driverDetails.vehicleNumber);
        formData.append('vehicleSeats', String(driverDetails.vehicleSeats || ''));
        if (driverDetails.licenseFile) {
          formData.append('licenseImage', driverDetails.licenseFile);
        }
        if (driverDetails.aadhaarFile) {
          formData.append('aadhaarImage', driverDetails.aadhaarFile);
        }
        res = await api.post('/auth/signup', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload = { ...form, role };
        res = await api.post('/auth/signup', payload);
      }
      login(res.data.token, res.data.user);
      if (role === 'driver') navigate('/driver/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl items-stretch gap-10 rounded-3xl bg-white/90 p-6 shadow-soft">
      <div className="hidden flex-1 flex-col justify-between rounded-2xl bg-gradient-to-br from-secondary/90 via-secondary to-primary/80 p-6 text-white shadow-md md:flex">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">Create an account</p>
          <h2 className="mt-2 text-2xl font-semibold">Join Green Wheels</h2>
          <p className="mt-2 text-sm text-emerald-50/90">
            Become a passenger or verified driver and start saving fuel with shared rides.
          </p>
        </div>
        <div className="mt-6 space-y-3 text-xs text-emerald-50/90">
          <div className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2 backdrop-blur">
            <span>Average CO₂ saved / ride</span>
            <span className="font-semibold">3.2 kg</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2 backdrop-blur">
            <span>Verified drivers</span>
            <span className="font-semibold">1.4k+</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Create your Green Wheels ID</h2>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          Choose whether you want to travel as a passenger, drive, or both.
        </p>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          {role === 'driver' && (
            <fieldset className="space-y-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
              <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Driver details
              </legend>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-emerald-900">Vehicle Model</label>
                <input
                  name="vehicleModel"
                  value={driverDetails.vehicleModel}
                  onChange={handleDriverChange}
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-emerald-900">Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  value={driverDetails.vehicleNumber}
                  onChange={handleDriverChange}
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-emerald-900">Vehicle Seats</label>
                <input
                  type="number"
                  name="vehicleSeats"
                  value={driverDetails.vehicleSeats}
                  onChange={handleDriverChange}
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-emerald-900">Driving licence photo</label>
                <input
                  type="file"
                  name="licenseFile"
                  accept="image/*"
                  onChange={handleDriverFileChange}
                  required
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
                <p className="text-[10px] text-emerald-900/70">Upload a clear photo of your driving licence.</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-emerald-900">Aadhaar photo</label>
                <input
                  type="file"
                  name="aadhaarFile"
                  accept="image/*"
                  onChange={handleDriverFileChange}
                  required
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
                <p className="text-[10px] text-emerald-900/70">Upload a photo of the Aadhaar card for verification.</p>
              </div>
            </fieldset>
          )}
          <button type="submit" className="btn-primary w-full justify-center">
            Create account
          </button>
          <p className="pt-1 text-center text-[11px] text-[color:var(--color-text-muted)]">
            Already using Green Wheels?{' '}
            <span className="font-medium text-primary">
              <a href="/auth/login">Sign in</a>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
