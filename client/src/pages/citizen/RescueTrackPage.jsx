import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rescueService } from '../../services/api';
import {
  LifeBuoy, MapPin, User, Phone, Clock, ArrowLeft,
  CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function RescueTrackPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRescue = async () => {
    try {
      const res = await rescueService.getRescueDetails(id);
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load rescue tracking:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRescue();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRescue();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Connecting to rescue coordination telemetry...</p>
      </div>
    );
  }

  if (!data || !data.rescue_request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Rescue Operation Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Request #{id} may not exist or has been removed.</p>
        <Link to="/citizen/dashboard" className="mt-4 inline-block text-xs font-semibold text-red-600 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const req = data.rescue_request;
  const timeline = data.timeline || [];

  const steps = ['Pending', 'Accepted', 'In Progress', 'Completed'];
  const currentStepIdx = steps.indexOf(req.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back nav & refresh */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/reports"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Reports</span>
        </Link>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Live Status</span>
        </button>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-400">
              <LifeBuoy className="h-4 w-4 animate-spin" />
              <span>Live Emergency Rescue Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Rescue #{req.request_id}: {req.disaster_type}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Target Site: {req.location}
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-2">
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority_level} />
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="pt-2">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {steps.map((step, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition ${
                      isCurrent
                        ? 'bg-red-500 text-white ring-4 ring-red-500/30'
                        : isPastOrCurrent
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span className={`font-semibold ${isPastOrCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Volunteer Assigned Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Assigned Rescue Responder</span>
          </h3>

          {req.volunteer_name ? (
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <div className="text-base font-extrabold text-indigo-950">
                  {req.volunteer_name}
                </div>
                {req.volunteer_skills && (
                  <div className="text-xs text-indigo-800">
                    <strong>Specialization:</strong> {req.volunteer_skills}
                  </div>
                )}
                {req.volunteer_phone && (
                  <a
                    href={`tel:${req.volunteer_phone}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition shadow-sm"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Responder ({req.volunteer_phone})</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 mb-1" />
              <strong>Awaiting Volunteer Acceptance:</strong> Your request has been placed in the high-priority dispatch queue. First responders in this district will be assigned shortly.
            </div>
          )}
        </div>

        {/* Location & Incident Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>Incident Location & Details</span>
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {req.description}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Coordinates:</span>
            {req.latitude && req.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline font-mono"
              >
                {req.latitude}, {req.longitude} ↗
              </a>
            ) : (
              <span className="text-slate-400">Approximate area</span>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Timeline Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Operation Timeline & Progress Updates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time field updates recorded by responding volunteers
          </p>
        </div>

        {timeline.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
            No field remarks entered yet. Initial dispatch in progress.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            {timeline.map((update) => (
              <div key={update.update_id} className="relative pl-6">
                {/* Dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow"></div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-bold text-slate-900">
                      {update.author_name} ({update.status})
                    </span>
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(update.updated_at).toLocaleString()}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {update.remarks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
