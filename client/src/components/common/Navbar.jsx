import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './StatusBadge';
import {
  ShieldAlert, PhoneCall, Bot, Home, AlertOctagon,
  FileText, Users, LifeBuoy, MapPin, Bell, LogOut,
  Menu, X, Sparkles, ChevronDown, Activity
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemo = async (role) => {
    try {
      if (role === 'citizen') await login('citizen@resq.org', 'Citizen@123');
      if (role === 'volunteer') await login('volunteer@resq.org', 'Volunteer@123');
      if (role === 'admin') await login('admin@resq.org', 'Admin@123');
      setDemoMenuOpen(false);
      if (role === 'citizen') navigate('/citizen/dashboard');
      if (role === 'volunteer') navigate('/volunteer/dashboard');
      if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error('Quick demo login error:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Emergency Hotline Ticker */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-red-400 font-bold">
              <PhoneCall className="h-3.5 w-3.5 mr-1" />
              Emergency Toll-Free: 112
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Fire: 101</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Ambulance: 108</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden md:inline">Disaster Helpline: 1078</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Demo Login Dropdown for Examiner / Viva */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-xs transition"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Switch Demo Role</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 font-semibold text-slate-400 border-b border-slate-700">
                    One-Click Demo Switcher
                  </div>
                  <button
                    onClick={() => handleQuickDemo('citizen')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-white flex items-center justify-between"
                  >
                    <span>Rahul Sharma</span>
                    <span className="text-[10px] bg-slate-600 px-1.5 py-0.5 rounded">Citizen</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('volunteer')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-white flex items-center justify-between"
                  >
                    <span>Priya Patel</span>
                    <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded">Volunteer</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-white flex items-center justify-between"
                  >
                    <span>Vikram Singh</span>
                    <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            <span className="text-slate-400 font-mono text-[11px] hidden lg:inline">
              University Specialization Project
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  Res<span className="text-red-600">Q</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 -mt-1 tracking-wider uppercase">
                  Disaster Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex lg:space-x-1 lg:ml-8">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shelters"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/shelters') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Relief Shelters
              </Link>
              <Link
                to="/alerts"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/alerts') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Emergency Alerts
              </Link>
              <Link
                to="/safety-assistant"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1.5 transition ${
                  isActive('/safety-assistant') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bot className="h-4 w-4 text-indigo-600" />
                <span>AI Safety Advisor</span>
              </Link>

              {/* Role-Specific Shortcuts */}
              {isAuthenticated && user?.role === 'citizen' && (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/citizen/dashboard') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Citizen Hub
                  </Link>
                  <Link
                    to="/citizen/report"
                    className="ml-2 px-3.5 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center space-x-1.5 transition"
                  >
                    <AlertOctagon className="h-4 w-4" />
                    <span>Report Disaster</span>
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'volunteer' && (
                <>
                  <Link
                    to="/volunteer/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/volunteer/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Volunteer Desk
                  </Link>
                  <Link
                    to="/volunteer/pending-rescues"
                    className="ml-2 px-3.5 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 transition"
                  >
                    <LifeBuoy className="h-4 w-4" />
                    <span>Rescue Queue</span>
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/admin/dashboard') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/admin/analytics') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/admin/reports"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/admin/reports') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    All Reports
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{user.name}</div>
                  <div className="flex justify-end mt-0.5">
                    <RoleBadge role={user.role} />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/shelters"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Relief Shelters
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Emergency Alerts
          </Link>
          <Link
            to="/safety-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
          >
            AI Safety Advisor
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <RoleBadge role={user.role} />
              </div>

              {user.role === 'citizen' && (
                <>
                  <Link
                    to="/citizen/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Citizen Dashboard
                  </Link>
                  <Link
                    to="/citizen/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 text-center"
                  >
                    Report Disaster
                  </Link>
                </>
              )}

              {user.role === 'volunteer' && (
                <>
                  <Link
                    to="/volunteer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Volunteer Dashboard
                  </Link>
                  <Link
                    to="/volunteer/pending-rescues"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 text-center"
                  >
                    Pending Rescues Queue
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reports & Analytics
                  </Link>
                </>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
