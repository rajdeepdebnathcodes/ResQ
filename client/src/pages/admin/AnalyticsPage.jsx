import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, AlertTriangle, LifeBuoy, Home, Users } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await analyticsService.getDashboardAnalytics();
        if (res.data) setAnalytics(res.data.analytics);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Aggregating database analytics...</p>
      </div>
    );
  }

  const charts = analytics?.charts || {};
  const summary = analytics?.summary || {};

  // 1. Disaster Types Data
  const disasterLabels = (charts.disasterTypes || []).map(d => d.disaster_type);
  const disasterCounts = (charts.disasterTypes || []).map(d => d.count);
  const disasterData = {
    labels: disasterLabels.length ? disasterLabels : ['Flood', 'Fire', 'Earthquake', 'Landslide'],
    datasets: [
      {
        data: disasterCounts.length ? disasterCounts : [3, 2, 1, 1],
        backgroundColor: [
          '#3b82f6', // blue
          '#ef4444', // red
          '#f59e0b', // amber
          '#10b981', // emerald
          '#8b5cf6', // purple
          '#ec4899', // pink
          '#64748b'  // slate
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 2. Priority Distribution Data
  const priorityLabels = (charts.priorityDistribution || []).map(p => p.priority_level);
  const priorityCounts = (charts.priorityDistribution || []).map(p => p.count);
  const priorityData = {
    labels: priorityLabels.length ? priorityLabels : ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Number of Incidents',
        data: priorityCounts.length ? priorityCounts : [2, 2, 1, 0],
        backgroundColor: [
          '#ef4444', // Critical red
          '#f97316', // High orange
          '#f59e0b', // Medium amber
          '#3b82f6'  // Low blue
        ],
        borderRadius: 8
      }
    ]
  };

  // 3. Rescue Statuses Data
  const rescueLabels = (charts.rescueStatuses || []).map(r => r.status);
  const rescueCounts = (charts.rescueStatuses || []).map(r => r.count);
  const rescueData = {
    labels: rescueLabels.length ? rescueLabels : ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: rescueCounts.length ? rescueCounts : [1, 2, 1],
        backgroundColor: [
          '#ef4444', // Pending red
          '#f59e0b', // Accepted amber
          '#6366f1', // In Progress indigo
          '#10b981'  // Completed emerald
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 4. Shelter Capacity Data
  const shelterData = {
    labels: ['Available Beds', 'Occupied Beds'],
    datasets: [
      {
        label: 'Relief Capacity (Total: ' + (summary.shelters?.total_capacity ?? 0) + ')',
        data: [summary.shelters?.total_available ?? 0, summary.shelters?.total_occupied ?? 0],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12 }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
          <BarChart3 className="h-4 w-4" />
          <span>Module 8: Reports & Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Disaster Response Analytics
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Statistical visualization of incident categories, triage priority distributions, and rescue operation velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Logged</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.reports?.total_reports ?? 0} Incidents</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{summary.reports?.status_resolved ?? 0} Resolved</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rescue Ops</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{summary.rescues?.total_rescues ?? 0} Dispatches</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.rescues?.completed_rescues ?? 0} Completed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relief Beds</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{summary.shelters?.total_available ?? 0} Open</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.shelters?.total_capacity ?? 0} Maximum</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Community Fleet</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.users?.total_users ?? 0} Personnel</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.users?.volunteers ?? 0} Field Responders</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Disaster Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Disaster Classification Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of reported hazard categories</p>
          </div>
          <div className="h-64 relative">
            <Doughnut data={disasterData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Priority Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">AI Triage Priority Levels</h3>
            <p className="text-xs text-slate-500">Urgency evaluation computed by Google Gemini</p>
          </div>
          <div className="h-64 relative">
            <Bar
              data={priorityData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
              }}
            />
          </div>
        </div>

        {/* Chart 3: Rescue Operations Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Rescue Operations Status Breakdown</h3>
            <p className="text-xs text-slate-500">Pending vs In Progress vs Completed extractions</p>
          </div>
          <div className="h-64 relative">
            <Doughnut data={rescueData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Shelter Utilization */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Relief Shelter Bed Utilization</h3>
            <p className="text-xs text-slate-500">Occupancy load across designated municipal centers</p>
          </div>
          <div className="h-64 relative">
            <Bar
              data={shelterData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
