import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing & Auth
import Landing from './pages/Landing/Landing';
import AuthSlider from './pages/Auth/AuthSlider';

// Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard';
import PatientChatbot from './pages/Patient/PatientChatbot';
import PatientAppointments from './pages/Patient/PatientAppointments';
import PatientHistory from './pages/Patient/PatientHistory';
import PatientDiseasePrediction from './pages/Patient/PatientDiseasePrediction';
import PatientProfile from './pages/Patient/PatientProfile';
import PatientMessages from './pages/Patient/PatientMessages';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorPatients from './pages/Doctor/DoctorPatients';
import DoctorChatbot from './pages/Doctor/DoctorChatbot';
import DoctorMessages from './pages/Doctor/DoctorMessages';
import DoctorProfile from './pages/Doctor/DoctorProfile';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminStatistics from './pages/Admin/AdminStatistics';
import AdminProfile from './pages/Admin/AdminProfile';
import AdminDoctorApproval from './pages/Admin/AdminDoctorApproval';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF3B3B',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthSlider />} />
          <Route path="/register" element={<AuthSlider />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/chatbot"
            element={
              <ProtectedRoute role="patient">
                <PatientChatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/disease-prediction"
            element={
              <ProtectedRoute role="patient">
                <PatientDiseasePrediction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute role="patient">
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute role="patient">
                <PatientHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/messages"
            element={
              <ProtectedRoute role="patient">
                <PatientMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute role="patient">
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute role="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute role="doctor">
                <DoctorPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/chatbot"
            element={
              <ProtectedRoute role="doctor">
                <DoctorChatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/messages"
            element={
              <ProtectedRoute role="doctor">
                <DoctorMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute role="doctor">
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctor-approvals"
            element={
              <ProtectedRoute role="admin">
                <AdminDoctorApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute role="admin">
                <AdminStatistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute role="admin">
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
