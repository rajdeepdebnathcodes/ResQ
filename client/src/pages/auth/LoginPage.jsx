import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (loggedUser.role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-red-50 text-red-600 mb-3 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to ResQ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Emergency Response & Incident Coordination Platform
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@resq.org"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center space-x-2 transition disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign In to Platform</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Helper Card */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>One-Click Academic Demo Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('citizen@resq.org', 'Citizen@123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white transition"
            >
              <div className="font-bold text-slate-800">Citizen</div>
              <div className="text-[10px] text-slate-500">Rahul</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('volunteer@resq.org', 'Volunteer@123')}
              className="p-2 text-center rounded-xl border border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-white transition"
            >
              <div className="font-bold text-indigo-700">Volunteer</div>
              <div className="text-[10px] text-indigo-500">Priya</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@resq.org', 'Admin@123')}
              className="p-2 text-center rounded-xl border border-red-200 hover:border-red-400 bg-red-50/50 hover:bg-white transition"
            >
              <div className="font-bold text-red-700">Admin</div>
              <div className="text-[10px] text-red-500">Chief</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-red-600 hover:underline">
            Register as Citizen or Volunteer
          </Link>
        </div>
      </div>
    </div>
  );
}
