import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import { ForgotPassword, ResetPassword } from "./pages/auth/ForgotPassword";

// Patient Pages
import PatientDashboard from "./pages/patient/Dashboard";
import FindDoctors from "./pages/patient/FindDoctors";
import ViewDoctorProfile from "./pages/patient/DoctorProfile";
import PatientAppointments from "./pages/patient/Appointments";
import PatientChat from "./pages/patient/Chat";
import PatientProfile from "./pages/patient/Profile";
import PatientMessages from "./pages/patient/Messages";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorMessages from "./pages/doctor/Messages";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorChat from "./pages/patient/Chat";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import VerificationQueue from "./pages/admin/VerificationQueue";

import "./index.css";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { borderRadius: "12px", fontSize: "14px", fontWeight: "500" },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Patient */}
              <Route path="/patient/dashboard" element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/doctors" element={<ProtectedRoute roles={["patient"]}><FindDoctors /></ProtectedRoute>} />
              <Route path="/patient/doctors/:id" element={<ProtectedRoute roles={["patient"]}><ViewDoctorProfile /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute roles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
              <Route path="/patient/chat" element={<ProtectedRoute roles={["patient"]}><PatientMessages /></ProtectedRoute>} />
              <Route path="/patient/chat/:appointmentId" element={<ProtectedRoute roles={["patient"]}><PatientChat /></ProtectedRoute>} />
              <Route path="/patient/profile" element={<ProtectedRoute roles={["patient"]}><PatientProfile /></ProtectedRoute>} />

              {/* Doctor */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute roles={["doctor"]}><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/chat" element={<ProtectedRoute roles={["doctor"]}><DoctorMessages /></ProtectedRoute>} />
              <Route path="/doctor/chat/:appointmentId" element={<ProtectedRoute roles={["doctor"]}><DoctorChat /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute roles={["doctor"]}><DoctorProfile /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute roles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/verification" element={<ProtectedRoute roles={["admin"]}><VerificationQueue /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;