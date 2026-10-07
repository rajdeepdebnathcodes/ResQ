import React, { useState, useEffect } from 'react';
import { shelterService } from '../services/api';
import { MapPin, Phone, Search, Filter, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export default function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchShelters();
  }, [statusFilter]);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const res = await shelterService.getAllShelters({
        status: statusFilter,
        search
      });
      if (res.data) setShelters(res.data.shelters);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShelters();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Home className="h-4 w-4" />
            <span>Emergency Relief Centers</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Designated Relief Shelters
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Locate safe shelters, active relief camps, and emergency supply points in your vicinity.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by area or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Full">Full</option>
            <option value="Temporarily Closed">Temporarily Closed</option>
          </select>
        </div>
      </div>

      {/* Shelter Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving shelter network data...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No shelters match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing search filters to see all relief centers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map((shelter) => {
            const occupancyPct = Math.round(((shelter.capacity - shelter.available_slots) / shelter.capacity) * 100);

            return (
              <div
                key={shelter.shelter_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{shelter.name}</h3>
                    <StatusBadge status={shelter.status} />
                  </div>

                  <p className="text-xs text-slate-500 mb-5 flex items-start">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0 mt-0.5" />
                    <span>{shelter.address}</span>
                  </p>

                  {/* Bed Capacity Gauge */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-5">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Available Beds:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {shelter.available_slots} <span className="text-xs text-slate-500">/ {shelter.capacity}</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          shelter.available_slots > 50
                            ? 'bg-emerald-500'
                            : shelter.available_slots > 0
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (shelter.available_slots / shelter.capacity) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">
                      {occupancyPct}% Occupied
                    </div>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${shelter.contact_number}`}
                    className="flex items-center text-slate-700 hover:text-emerald-700 font-semibold transition"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    <span>{shelter.contact_number}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelter.name + ' ' + shelter.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition"
                  >
                    Map Route ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
