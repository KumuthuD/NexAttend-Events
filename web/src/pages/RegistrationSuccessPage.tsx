import React, { useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar as CalendarIcon, MapPin, Mail, Home, Download, Share2, CalendarPlus } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { EMAILJS_CONFIG } from '../config';
import confetti from 'canvas-confetti';
import { useToast } from '../contexts/ToastContext';
import type { Event } from '../types';

const RegistrationSuccessPage = () => {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  
  const state = location.state || {};
  const event = state.event as Event | undefined;
  const formData = state.formData as Record<string, string> | undefined;
  
  const [resending, setResending] = React.useState(false);
  
  const participantName = formData ? (formData['Full Name'] || formData['Name'] || formData['name'] || '') : '';
  const participantEmail = formData ? (formData['Email'] || formData['email'] || '') : '';

  useEffect(() => {
    // Confetti animation on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00d4ff', '#7c3aed']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00d4ff', '#7c3aed']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const resendEmail = async () => {
    if (!participantEmail || resending) return;
    
    setResending(true);
    
    try {
      const templateParams = {
        email: participantEmail,
        from_name: "NexAttend Events",
        participant_name: participantName || 'Participant',
        event_title: event?.title || 'Event',
        event_date: event ? new Date(event.event_date).toLocaleString() : '',
        event_location: event?.location || '',
        qr_code_id: qrCodeId,
        verify_url: window.location.href
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      success('Email Sent!', `QR code sent to ${participantEmail}`);
    } catch (err) {
      console.error("Resend Email Error:", err);
      toastError('Send Failed', 'Could not send the email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const openGoogleCalendar = () => {
    if (!event) return;
    const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const start = fmt(new Date(event.event_date));
    const end = event.event_end_date
      ? fmt(new Date(event.event_end_date))
      : fmt(new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000));
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', event.title);
    url.searchParams.set('dates', `${start}/${end}`);
    url.searchParams.set('details', `Registration ID: ${qrCodeId}\n${window.location.href}`);
    url.searchParams.set('location', event.location);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const generateICS = () => {
    if (!event) return;
    const startDate = new Date(event.event_date).toISOString().replace(/-|:|\.\d+/g, '');
    let endDate = startDate;
    if (event.event_end_date) {
        endDate = new Date(event.event_end_date).toISOString().replace(/-|:|\.\d+/g, '');
    } else {
        const d = new Date(event.event_date);
        d.setHours(d.getHours() + 2); // Default to 2 hours
        endDate = d.toISOString().replace(/-|:|\.\d+/g, '');
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NexAttend Events//EN
BEGIN:VEVENT
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:Registration ID: ${qrCodeId}\\nURL: ${window.location.origin}/events/${event.slug}/register
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!event) return;
    const url = `${window.location.origin}/events/${event.slug}/register`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join me at ${event.title}!`,
          url: url,
        });
      } catch (err) {
        // user cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      success('Link Copied!', 'Event link copied to clipboard.');
    }
  };

  // Convert form data object to array for easy display
  const formDataList = formData ? Object.entries(formData).filter(([k]) => !['Full Name', 'Name', 'name', 'Email', 'email'].includes(k)) : [];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center py-12 px-4 sm:px-6 relative overflow-x-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4ff]/15 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7c3aed]/15 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hidden sm:inline">
          NexAttend Events
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-2xl flex flex-col items-center mt-12 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] border border-green-500/20"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-black mb-3 text-center tracking-tight">You're Registered!</h1>
        <p className="text-gray-400 text-center mb-10 text-lg max-w-lg">
          Your ticket for <strong className="text-white">{event?.title || 'the event'}</strong> is ready. Present this QR code at the entrance.
        </p>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative mb-8">
          
          {/* Left: QR Code */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div className="bg-white p-4 rounded-2xl mb-4 relative group">
              {qrCodeId ? (
                <QRCodeDisplay value={qrCodeId} size={200} />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl">Error</div>
              )}
              {qrCodeId && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <a 
                    href={document.querySelector('canvas')?.toDataURL('image/png') || '#'} 
                    download={`ticket-${qrCodeId}.png`}
                    className="flex flex-col items-center text-white"
                  >
                    <Download className="w-6 h-6 mb-1" />
                    <span className="text-sm font-semibold">Save Ticket</span>
                  </a>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono tracking-widest">{qrCodeId}</p>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <span className="text-[#00d4ff] text-xs font-bold uppercase tracking-wider mb-1 block">Valid Ticket For</span>
              <h3 className="text-xl font-bold truncate">{participantName || 'Guest Participant'}</h3>
              {participantEmail && <p className="text-sm text-gray-400 truncate">{participantEmail}</p>}
            </div>

            {event && (
              <div className="bg-[#0a0a1a]/50 p-4 rounded-2xl space-y-3 border border-white/5 backdrop-blur-sm">
                <div className="flex items-start gap-3 text-gray-300">
                  <CalendarIcon className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-400">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
                  <span className="text-sm leading-snug">{event.location}</span>
                </div>
              </div>
            )}
            
            {/* Display extra form data fields if they exist */}
            {formDataList.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Registration Details</div>
                <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {formDataList.map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate pr-2 max-w-[50%]">{key}</span>
                      <span className="text-gray-200 font-medium text-right truncate flex-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
          {event && (
            <button
              onClick={openGoogleCalendar}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-[#4285F4]/10 hover:border-[#4285F4]/30 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              <CalendarPlus className="w-5 h-5 text-[#4285F4]" />
              Google Calendar
            </button>
          )}
          {event && (
            <button
              onClick={generateICS}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              <CalendarPlus className="w-5 h-5" />
              Download .ics
            </button>
          )}
          {event && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Event
            </button>
          )}
        </div>

        {/* Dynamic Email Resend Block */}
        {participantEmail && (
          <div className="w-full flex items-center justify-between text-gray-400 text-sm bg-white/[0.03] px-6 py-4 rounded-2xl border border-white/5 shadow-lg group hover:border-[#00d4ff]/20 transition-all mb-8">
            <div className="flex items-center gap-3 truncate pr-4">
              <Mail className="w-4 h-4 text-[#00d4ff] shrink-0" />
              <span className="truncate">Sent to <strong className="text-white">{participantEmail}</strong></span>
            </div>
            <button 
              onClick={resendEmail}
              disabled={resending}
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0a0a1a] transition-colors disabled:opacity-50 border border-[#00d4ff]/20"
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </div>
        )}

        <Link 
          to="/" 
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccessPage;
