import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, Mail, Home } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

const RegistrationSuccessPage = () => {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  // Optional: receive event and form data passed from registration page
  const location = useLocation();
  const state = location.state || {};
  const event = state.event;
  const formData = state.formData;
  
  // Try to find name/email from form data if passed
  const participantName = formData ? (formData['Full Name'] || formData['Name'] || formData['name'] || '') : '';

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center py-16 px-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4ff]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
          NexAttend Events
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md flex flex-col items-center mt-12"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/20"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">You're Registered!</h1>
        <p className="text-gray-400 text-center mb-10">
          Your ticket for {event?.title || 'the event'} is ready. Present this QR code at the entrance.
        </p>

        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative mb-8">
          {qrCodeId ? (
            <div className="mb-6">
              <QRCodeDisplay value={qrCodeId} size={220} />
            </div>
          ) : (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center mb-6">Error: No QR Code ID found</div>
          )}

          <div className="space-y-4 pt-6 border-t border-white/10 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Registration ID</span>
              <span className="font-mono text-[#00d4ff]">{qrCodeId}</span>
            </div>
            
            {participantName && (
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Attendee</span>
                <span className="text-white font-medium truncate">{participantName}</span>
              </div>
            )}
            
            {event && (
              <div className="bg-[#0a0a1a]/50 p-4 rounded-xl space-y-3 mt-4 border border-white/5">
                <h4 className="font-semibold text-[#7c3aed] truncate">{event.title}</h4>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-[#00d4ff]" />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#7c3aed]" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-sm bg-white/5 px-6 py-3 rounded-full border border-white/10 mb-8">
          <Mail className="w-4 h-4 text-[#00d4ff]" />
          <span>We've also sent this QR code to your email.</span>
        </div>

        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white/10 rounded-xl transition-colors font-medium text-white"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccessPage;
