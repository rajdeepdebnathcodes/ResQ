import React from 'react';
import { ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Project Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-lg mb-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <span>ResQ Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              AI-Powered Disaster Response & Emergency Coordination Platform. Designed for rapid emergency reporting, triage classification, relief shelter allocation, and volunteer operations.
            </p>
            <div className="text-[11px] text-slate-500">
              Developed by Atharva Goel, Rajdeep Debnath, & Rohan Raj.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/citizen/report" className="hover:text-white transition">
                  Report Incident
                </Link>
              </li>
              <li>
                <Link to="/shelters" className="hover:text-white transition">
                  Relief Shelters Map
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-white transition">
                  Active Emergency Alerts
                </Link>
              </li>
              <li>
                <Link to="/safety-assistant" className="hover:text-white transition">
                  AI Safety Advisory Chatbot
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Emergency Numbers
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <span>National Emergency:</span>
                <span className="text-red-400 font-mono font-bold">112</span>
              </li>
              <li className="flex justify-between">
                <span>Fire Response:</span>
                <span className="text-red-400 font-mono font-bold">101</span>
              </li>
              <li className="flex justify-between">
                <span>Medical Ambulance:</span>
                <span className="text-red-400 font-mono font-bold">108</span>
              </li>
              <li className="flex justify-between">
                <span>Disaster Management (NDMA):</span>
                <span className="text-red-400 font-mono font-bold">1078</span>
              </li>
            </ul>
          </div>

          {/* Academic & Tech Stack */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Architecture
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div>Frontend: React.js & Tailwind CSS</div>
              <div>Backend: Node.js & Express REST APIs</div>
              <div>Database: MySQL 8.0 with Connection Pooling</div>
              <div>AI Engine: Google Gemini API & Fallback Rules</div>
              <div>Authentication: JWT & Bcrypt Salt Hashing</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} ResQ Disaster Management Platform. University Academic Project.
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span>Life-safety guidance follows NDMA and WHO disaster response protocols.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
