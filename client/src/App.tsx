import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import FindDoctor from './pages/patient/FindDoctor';
import BookAppointment from './pages/patient/BookAppointment';
import Appointments from './pages/patient/Appointments';
import SymptomChecker from './pages/patient/SymptomChecker';
import Reports from './pages/patient/Reports';
import DoctorDashboard from './pages/doctor/Dashboard';
import Schedule from './pages/doctor/Schedule';
import Patients from './pages/doctor/Patients';
import Consultation from './pages/doctor/Consultation';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Settings from './pages/common/Settings';

import ErrorBoundary from './components/ErrorBoundary';
import MedicalReports from './pages/doctor/MedicalReports';
import Messages from './pages/doctor/Messages';
import PrescriptionMaker from './pages/doctor/PrescriptionMaker';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<><Navbar /><Home /></>} />
                <Route path="/login" element={<><Navbar /><Login /></>} />
                <Route path="/register" element={<><Navbar /><Register /></>} />

                {/* Patient Routes */}
                <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    <Route path="/patient/find-doctors" element={<FindDoctor />} />
                    <Route path="/patient/appointments" element={<Appointments />} />
                    <Route path="/patient/book-appointment/:doctorId" element={<BookAppointment />} />
                    <Route path="/patient/reports" element={<Reports />} />
                    <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
                  </Route>
                </Route>

                {/* Doctor Routes */}
                <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor/schedule" element={<Schedule />} />
                    <Route path="/doctor/patients" element={<Patients />} />
                    <Route path="/doctor/prescriptions" element={<PrescriptionMaker />} />
                    <Route path="/doctor/reports" element={<MedicalReports />} />
                    <Route path="/doctor/messages" element={<Messages />} />
                    <Route path="/doctor/consultation/:appointmentId" element={<Consultation />} />
                  </Route>
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/doctors" element={<AdminDoctors />} />
                    <Route path="/admin/patients" element={<AdminPatients />} />
                  </Route>
                </Route>

                {/* Shared Settings Route */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>

              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary >
  );
}

export default App;
