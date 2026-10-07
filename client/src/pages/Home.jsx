import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertService, shelterService, analyticsService, aiService } from '../services/api';
import {
  ShieldAlert, AlertTriangle, LifeBuoy, MapPin, Bot,
  ArrowRight, PhoneCall, CheckCircle, Users, Activity,
  Radio, Sparkles
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/common/StatusBadge';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [stats, setStats] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [alertRes, shelterRes, statsRes, aiRes] = await Promise.allSettled([
          alertService.getActiveAlerts(),
          shelterService.getAllShelters({ limit: 3 }),
          analyticsService.getDashboardAnalytics(),
          aiService.getStatus()
        ]);

        if (alertRes.status === 'fulfilled') setActiveAlerts(alertRes.value.data.alerts.slice(0, 3));
        if (shelterRes.status === 'fulfilled') setShelters(shelterRes.value.data.shelters.slice(0, 3));
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.analytics.summary);
        if (aiRes.status === 'fulfilled') setAiStatus(aiRes.value.data);
      } catch (e) {
        // Continue gracefully
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Background glow & subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* AI Status Pill */}
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-3.5 py-1 text-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">
                  {aiStatus?.mode === 'gemini' ? 'Google Gemini 1.5 Flash Active' : 'ResQ Intelligent AI Engine Online'}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">Disaster Response</span> & Coordination
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                A unified emergency platform connecting citizens, first responders, and emergency authorities. Instant disaster classification, AI triage priority scoring, and rapid relief shelter allocation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to={isAuthenticated ? (user.role === 'citizen' ? '/citizen/report' : `/${user.role}/dashboard`) : '/login'}
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 flex items-center space-x-2 transform hover:-translate-y-0.5 transition"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report Emergency Now</span>
                </Link>

                <Link
                  to="/safety-assistant"
                  className="px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 flex items-center space-x-2 transition"
                >
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <span>Ask AI Safety Advisor</span>
                </Link>

                <Link
                  to="/shelters"
                  className="px-5 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center space-x-2 transition"
                >
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>Find Shelters</span>
                </Link>
              </div>

              {/* Emergency Hotline Banner */}
              <div className="pt-4 flex items-center space-x-6 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <PhoneCall className="h-4 w-4 text-red-400" />
                  <span className="font-semibold text-white">National Hotline: 112</span>
                </div>
                <div>Free from any mobile or landline across India</div>
              </div>
            </div>

            {/* Quick Live Stats & AI Feature Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-5">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-400" />
                    <span className="font-bold text-white text-sm">Real-Time Disaster Metrics</span>
                  </div>
                  <span className="text-[11px] font-mono bg-red-950/80 text-red-300 border border-red-800/60 px-2 py-0.5 rounded">
                    LIVE SYSTEM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-white">{stats?.reports?.total_reports ?? 5}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Total Incidents Logged</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-amber-400">{stats?.rescues?.pending_rescues ?? 1}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Pending Rescues</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-emerald-400">{stats?.shelters?.total_available ?? 747}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Available Shelter Beds</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-indigo-400">{stats?.users?.volunteers ?? 3}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Active Volunteers</div>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-gradient-to-r from-red-950/40 to-slate-900 rounded-xl border border-red-900/40 text-xs text-slate-300 flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">AI Incident Triage Active:</span> Reports are analyzed in real-time to compute threat priority (Low to Critical) and brief first responders.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Alerts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Radio className="h-5 w-5 text-red-600 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-900">Active Emergency Broadcasts</h2>
          </div>
          <Link to="/alerts" className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center">
            <span>View All Alerts</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-5 rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                alert.severity === 'Critical'
                  ? 'border-red-300 ring-1 ring-red-200'
                  : alert.severity === 'High'
                  ? 'border-orange-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {alert.alert_type}
                </span>
                <PriorityBadge priority={alert.severity} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">{alert.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">{alert.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {alert.location}
                </span>
                <span>{new Date(alert.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How ResQ Coordinates Disaster Response
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Integrated architecture uniting citizens, field volunteers, relief shelters, and administrative decision-makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-red-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Emergency Reporting</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Citizens submit geo-tagged incident reports with disaster categories, images, and immediate rescue assistance triggers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Gemini AI Triage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google Gemini automatically classifies hazards, predicts life-threat urgency (Low to Critical), and produces concise briefs.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Volunteer Dispatch</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Registered volunteers accept pending rescue operations, post live status remarks, and coordinate victim extraction.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">4. Relief & Shelters</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Live capacity monitoring of designated relief centers, community halls, and food supply distribution points.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Relief Shelters Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nearby Relief Shelters</h2>
            <p className="text-sm text-slate-500">Designated evacuation camps with live capacity indicators</p>
          </div>
          <Link to="/shelters" className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center">
            <span>Explore All Shelters</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shelters.map((shelter) => (
            <div key={shelter.shelter_id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{shelter.name}</h3>
                  <StatusBadge status={shelter.status} />
                </div>
                <p className="text-xs text-slate-500 mb-4 flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                  {shelter.address}
                </p>

                {/* Capacity Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Available Capacity:</span>
                    <span className="font-semibold text-slate-800">{shelter.available_slots} / {shelter.capacity} Beds</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        shelter.available_slots > 50 ? 'bg-emerald-500' : shelter.available_slots > 0 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (shelter.available_slots / shelter.capacity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-mono">📞 {shelter.contact_number}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelter.name + ' ' + shelter.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-red-600 hover:underline"
                >
                  Directions ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
