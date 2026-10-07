import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import AlertBanner from './components/common/AlertBanner';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import SheltersPage from './pages/SheltersPage';
import AlertsPage from './pages/AlertsPage';
import SafetyAssistantPage from './pages/SafetyAssistantPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportDisasterPage from './pages/citizen/ReportDisasterPage';
import MyReportsPage from './pages/citizen/MyReportsPage';
import RescueTrackPage from './pages/citizen/RescueTrackPage';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import PendingRescuesPage from './pages/volunteer/PendingRescuesPage';
import RescueOperationPage from './pages/volunteer/RescueOperationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminRescuesPage from './pages/admin/AdminRescuesPage';
import AdminSheltersPage from './pages/admin/AdminSheltersPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
          <AlertBanner />
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/shelters" element={<SheltersPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/safety-assistant" element={<SafetyAssistantPage />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <ReportDisasterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/reports"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/rescue/:id"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'admin']}>
                    <RescueTrackPage />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Routes */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/pending-rescues"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <PendingRescuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/rescue/:id"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <RescueOperationPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rescues"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRescuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shelters"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSheltersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/alerts"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
