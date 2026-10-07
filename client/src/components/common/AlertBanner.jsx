import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/api';
import { AlertTriangle, ChevronRight, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await alertService.getActiveAlerts();
        if (res.data && res.data.alerts) {
          // Filter high and critical
          const highAlerts = res.data.alerts.filter(a => a.severity === 'Critical' || a.severity === 'High');
          setAlerts(highAlerts);
        }
      } catch (e) {
        // Silently skip if alerts cannot be fetched
      }
    }
    fetchAlerts();
  }, []);

  if (dismissed || alerts.length === 0) return null;

  const topAlert = alerts[0];
  const isCritical = topAlert.severity === 'Critical';

  return (
    <div className={`${isCritical ? 'bg-red-600' : 'bg-amber-600'} text-white px-4 py-2.5 shadow-md relative z-40 transition-all`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm flex-wrap gap-2">
        <div className="flex items-center space-x-2 font-medium">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="uppercase tracking-wider font-bold text-xs bg-black/20 px-2 py-0.5 rounded">
            {topAlert.severity} ALERT
          </span>
          <span className="line-clamp-1">{topAlert.title}</span>
          <span className="text-white/80 hidden md:inline">({topAlert.location})</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/alerts"
            className="inline-flex items-center space-x-1 underline hover:text-white/90 text-xs font-semibold"
          >
            <span>View All ({alerts.length}) Alerts</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-black/10"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
