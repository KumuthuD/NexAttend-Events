import emailjs from '@emailjs/browser';
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, Mail, Home, PartyPopper } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { EMAILJS_CONFIG } from '../config';

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#00d4ff', '#7c3aed', '#22c55e', '#f59e0b', '#ec4899', '#ffffff', '#a855f7'];

function ConfettiBurst() {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: `${4 + Math.random() * 92}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 5 + Math.random() * 9,
      h: 4 + Math.random() * 7,
      duration: 1.8 + Math.random() * 1.8,
      delay: Math.random() * 0.7,
      rotate: Math.random() * 1080 - 540,
      drift: Math.random() * 120 - 60,
      circle: Math.random() > 0.55,
    })),
  []);

  if (!alive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          initial={{ top: '-12px', x: 0, rotate: 0, opacity: 1 }}
          animate={{ top: '115vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.circle ? '50%' : '1px',
          }}
        />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const RegistrationSuccessPage = () => {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const location = useLocation();
  const state = location.state || {};
  const event = state.event;
  const formData = state.formData;

  const [resending, setResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const participantName = formData ? (formData['Full Name'] || formData['Name'] || formData['name'] || '') : '';
  const participantEmail = formData ? (formData['Email'] || formData['email'] || '') : '';

  const resendEmail = async () => {
    if (!participantEmail || resending) return;
    setResending(true);
    setResendStatus('idle');
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          email: participantEmail,
          from_name: 'NexAttend Events',
          participant_name: participantName || 'Participant',
          event_title: event?.title || 'Event',
          event_date: event ? new Date(event.event_date).toLocaleString() : '',
          event_location: event?.location || '',
          qr_code_id: qrCodeId,
          verify_url: window.location.href,
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      setResendStatus('success');
      setTimeout(() => setResendStatus('idle'), 3000);
    } catch (err) {
      console.error('Resend Email Error:', err);
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center pb-16 px-6 relative overflow-x-hidden font-sans">
      <ConfettiBurst />

      <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#00d4ff]/8 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <header className="w-full max-w-2xl flex items-center justify-between py-6 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
            NexAttend Events
          </span>
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, type: 'spring', bounce: 0.35 }}
        className="w-full max-w-lg flex flex-col items-center mt-4 relative z-10"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.25)]">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-full flex items-center justify-center shadow-lg"
          >
            <PartyPopper className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black mb-3 tracking-tight">You're In!</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Your spot at{' '}
            <span className="text-white font-semibold">{event?.title || 'the event'}</span>{' '}
            is confirmed. Present this QR code at the entrance.
          </p>
        </motion.div>

        {/* Ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full relative mb-4"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-[#0a0a1a] rounded-r-full z-10 -translate-x-2.5" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-[#0a0a1a] rounded-l-full z-10 translate-x-2.5" />

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border-b border-white/10 px-8 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Event Ticket</p>
                <p className="text-white font-bold truncate max-w-[220px]">{event?.title || 'Your Event'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Status</p>
                <span className="text-green-400 text-sm font-bold">Confirmed</span>
              </div>
            </div>

            <div className="px-8 py-6">
              {qrCodeId ? (
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <QRCodeDisplay value={qrCodeId} size={200} />
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center mb-6">Error: No QR Code ID found</div>
              )}

              <div className="flex items-center gap-2 my-5">
                <div className="flex-1 border-t border-dashed border-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="flex-1 border-t border-dashed border-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Registration ID</p>
                  <p className="font-mono text-[#00d4ff] text-xs break-all">{qrCodeId}</p>
                </div>
                {participantName && (
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Attendee</p>
                    <p className="text-white font-semibold truncate">{participantName}</p>
                  </div>
                )}
                {event && (
                  <>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#00d4ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Date</p>
                        <p className="text-gray-300 text-xs">{new Date(event.event_date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#7c3aed] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Venue</p>
                        <p className="text-gray-300 text-xs truncate">{event.location}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Email row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4"
        >
          <div className="flex items-center gap-3 text-sm text-gray-400 min-w-0">
            <Mail className="w-4 h-4 text-[#00d4ff] shrink-0" />
            <span className="truncate">Sent to: <span className="text-white">{participantEmail || 'your email'}</span></span>
          </div>
          {participantEmail && (
            <button
              onClick={resendEmail}
              disabled={resending}
              className={`ml-3 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                resendStatus === 'success'
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : resendStatus === 'error'
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-white/5 border-white/10 text-[#00d4ff] hover:bg-[#00d4ff]/10'
              } disabled:opacity-50`}
            >
              {resending ? 'Sending...' : resendStatus === 'success' ? 'Sent!' : resendStatus === 'error' ? 'Failed' : 'Resend'}
            </button>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 w-full"
        >
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl transition-colors font-medium text-gray-300 hover:text-white text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/events"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border border-white/10 hover:border-[#7c3aed]/40 rounded-xl transition-all font-medium text-white text-sm"
          >
            Explore More Events
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccessPage;
