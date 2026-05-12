import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
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
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventDiscoveryPage />} />
          <Route path="/events/:slug/register" element={<EventRegistrationPage />} />
          <Route path="/registration/success/:qrCodeId" element={<RegistrationSuccessPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/events/my" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
          <Route path="/events/:id/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
          <Route path="/events/:id/attendance" element={<ProtectedRoute><AttendanceSheetPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
