import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDiscoveryPage from './pages/EventDiscoveryPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import ScannerPage from './pages/ScannerPage';
import AttendanceSheetPage from './pages/AttendanceSheetPage';
import MyEventsPage from './pages/MyEventsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventDiscoveryPage />} />
          <Route path="/events/:slug/register" element={<EventRegistrationPage />} />
          <Route path="/registration/success/:qrCodeId" element={<RegistrationSuccessPage />} />

          {/* Protected Routes (require login) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/events/my" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
          <Route path="/events/:id/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
          <Route path="/events/:id/attendance" element={<ProtectedRoute><AttendanceSheetPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
