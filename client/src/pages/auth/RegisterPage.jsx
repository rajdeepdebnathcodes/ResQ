import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, UserPlus, AlertCircle, HeartHandshake, User } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
    skills: 'First Aid & Rescue Assistance'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await register(formData);
      if (loggedUser.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (loggedUser.role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-red-50 text-red-600 mb-3 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create ResQ Account
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Join the community disaster response network
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role selector tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'citizen' })}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-sm font-semibold transition ${
                  formData.role === 'citizen'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-sm font-semibold transition ${
                  formData.role === 'volunteer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Volunteer</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {formData.role === 'volunteer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Volunteer Skills / Capabilities
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. First Aid, Boat Operator, Trauma Care"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Create ResQ Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-red-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
