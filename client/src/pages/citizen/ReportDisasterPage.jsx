import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportService } from '../../services/api';
import {
  AlertTriangle, MapPin, Upload, Sparkles, CheckCircle2,
  AlertOctagon, LifeBuoy, ArrowRight, X, Info
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/StatusBadge';

const DISASTER_TYPES = [
  'Flood',
  'Earthquake',
  'Fire',
  'Cyclone',
  'Road Accident',
  'Medical Emergency',
  'Landslide',
  'Other'
];

export default function ReportDisasterPage() {
  const [disasterType, setDisasterType] = useState('Flood');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [requestRescue, setRequestRescue] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const navigate = useNavigate();

  // HTML5 Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        if (!location) {
          setLocation(`GPS Coordinates: ${lat}, ${lng}`);
        }
        setGeoLoading(false);
      },
      (err) => {
        alert(`Location detection failed: ${err.message}`);
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      setError('Please provide both the incident location and description.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('disaster_type', disasterType);
      formData.append('location', location.trim());
      formData.append('description', description.trim());
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      formData.append('request_rescue', requestRescue ? 'true' : 'false');
      if (selectedFile) formData.append('image', selectedFile);

      const res = await reportService.createReport(formData);

      if (res.data && res.data.report) {
        setAiResult({
          report: res.data.report,
          ai: res.data.ai_analysis,
          rescue_request_id: res.data.rescue_request_id
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Module 2: Emergency Reporting</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Report an Emergency Incident
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit hazard reports directly to emergency coordination. Incident descriptions will be analyzed by Google Gemini AI for immediate triage classification.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center space-x-2">
          <AlertOctagon className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Processing Modal / Success Overlay */}
      {aiResult && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Incident Logged & AI Triage Complete!
                </h3>
                <p className="text-xs text-slate-500">
                  Report #{aiResult.report.report_id} has been transmitted to emergency responders.
                </p>
              </div>
            </div>
            <PriorityBadge priority={aiResult.ai.priority} />
          </div>

          {/* AI Analysis Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-indigo-300 border-b border-indigo-900/80 pb-2">
              <span className="flex items-center space-x-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>AI Triage Analysis Result</span>
              </span>
              <span className="bg-indigo-900/80 px-2 py-0.5 rounded font-mono">
                Source: {aiResult.ai.source === 'gemini' ? 'Google Gemini API' : 'Fallback Engine'} ({aiResult.ai.confidence})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400">Hazard Classification:</div>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {aiResult.ai.classification}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Assigned Priority Level:</div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">
                  {aiResult.ai.priority} Urgency
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Operational Responder Summary:</div>
              <p className="text-sm text-slate-200 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                "{aiResult.ai.summary}"
              </p>
            </div>

            {aiResult.ai.safety_tips && (
              <div>
                <div className="text-xs text-slate-400 mb-1">Immediate Safety Protocol:</div>
                <div className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/60 whitespace-pre-line leading-relaxed">
                  {aiResult.ai.safety_tips}
                </div>
              </div>
            )}
          </div>

          {/* Rescue Status Notification */}
          {aiResult.rescue_request_id && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-red-900 text-sm">
                <LifeBuoy className="h-5 w-5 text-red-600 animate-spin shrink-0" />
                <div>
                  <strong>Rescue Dispatch Triggered:</strong> Request #{aiResult.rescue_request_id} has been added to the volunteers pending queue.
                </div>
              </div>
              <Link
                to={`/citizen/rescue/${aiResult.rescue_request_id}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shrink-0 transition"
              >
                Track Live Rescue →
              </Link>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setAiResult(null);
                setDescription('');
                setLocation('');
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Log Another Incident
            </button>
            <Link
              to="/citizen/reports"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              View My Reports Feed
            </Link>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!aiResult && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Disaster Type Radio Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Type of Disaster / Emergency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DISASTER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDisasterType(type)}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition text-center ${
                    disasterType === type
                      ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location with GPS Auto-Detect */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Location Details
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{geoLoading ? 'Detecting GPS...' : '📍 Auto-Detect Current GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sector 4, Riverfront Enclave, Near Sangam Bridge, Pune"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {(latitude || longitude) && (
              <div className="mt-1 text-[11px] text-slate-500 font-mono">
                Coordinates: Latitude {latitude}, Longitude {longitude}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Detailed Description of the Emergency
            </label>
            <textarea
              rows="4"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is happening: Are people trapped? Is water rising? Are there injuries or immediate threats to life? (AI will evaluate this text)"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Include mentions of elderly citizens, children, rising water levels, or blocked exits to assist AI priority classification.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4. Incident Photograph (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-slate-400 transition bg-slate-50/50">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-auto object-cover rounded-xl shadow-md mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-red-600 hover:text-red-500 focus-within:outline-none">
                        <span>Upload photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rescue Request Toggle Checkbox */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
            <input
              id="rescue-check"
              type="checkbox"
              checked={requestRescue}
              onChange={(e) => setRequestRescue(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
            />
            <label htmlFor="rescue-check" className="text-xs text-slate-700">
              <strong className="text-slate-900 block text-sm mb-0.5">
                Dispatch Immediate Rescue Assistance
              </strong>
              Check this box if victims require extraction, medical aid, or emergency evacuation from responders. A rescue request will automatically be queued for active volunteers.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 text-base transition disabled:opacity-70"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI Evaluating Urgency & Saving Incident...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span>Submit Emergency Report with AI Triage</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
