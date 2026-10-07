import React from 'react';

export function PriorityBadge({ priority }) {
  const p = priority || 'Medium';
  const styles = {
    Critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[p] || styles.Medium}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {p}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = status || 'Reported';
  const styles = {
    // Report statuses
    Reported: 'bg-purple-50 text-purple-700 border-purple-200',
    Verified: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Dismissed: 'bg-gray-100 text-gray-600 border-gray-200',

    // Rescue statuses
    Pending: 'bg-red-50 text-red-700 border-red-200',
    Accepted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',

    // Shelter statuses
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Full: 'bg-rose-50 text-rose-700 border-rose-200',
    'Temporarily Closed': 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[s] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {s}
    </span>
  );
}

export function RoleBadge({ role }) {
  const styles = {
    citizen: 'bg-slate-100 text-slate-800 border-slate-300',
    volunteer: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    admin: 'bg-rose-100 text-rose-800 border-rose-300'
  };
  const labels = {
    citizen: 'Citizen',
    volunteer: 'Rescue Volunteer',
    admin: 'Administrator'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styles[role] || styles.citizen}`}>
      {labels[role] || role}
    </span>
  );
}
