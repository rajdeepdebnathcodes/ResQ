import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api';
import { Radio, AlertTriangle, MapPin, Calendar, Bell, Filter } from 'lucide-react';
import { PriorityBadge } from '../components/common/StatusBadge';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await alertService.getActiveAlerts();
        if (res.data) setAlerts(res.data.alerts);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const filtered = severityFilter === 'All'
    ? alerts
    : alerts.filter(a => a.severity === severityFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>Emergency Broadcast Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Active Emergency Alerts
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Official evacuation orders, meteorological warnings, and civic instructions.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                severityFilter === s
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Checking emergency frequencies...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active alerts for selected filter</h3>
          <p className="text-xs text-slate-500 mt-1">No major advisories matching this urgency level at present.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((alert) => {
            const isCritical = alert.severity === 'Critical';

            return (
              <div
                key={alert.alert_id}
                className={`p-6 rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                  isCritical
                    ? 'border-red-300 ring-2 ring-red-500/10'
                    : alert.severity === 'High'
                    ? 'border-orange-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                      {alert.alert_type}
                    </span>
                    <PriorityBadge priority={alert.severity} />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Broadcasted: {new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">{alert.title}</h2>
                <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">{alert.message}</p>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span className="flex items-center text-slate-600 font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    Target Region: {alert.location}
                  </span>
                  <span>Issued by: {alert.broadcast_by || 'Disaster Management Authority'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
