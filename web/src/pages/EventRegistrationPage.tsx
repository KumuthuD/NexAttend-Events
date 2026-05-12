import emailjs from '@emailjs/browser';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventBySlug, getFormFields, registerForEvent } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, ArrowRight, Users, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, CheckCircle2, Share2, Flame
} from 'lucide-react';

const EMAILJS_SERVICE_ID = "service_1xv6a6l";
const EMAILJS_TEMPLATE_ID = "template_om2l17u";
const EMAILJS_PUBLIC_KEY = "FvRTD3Dv3pJS6gj1b";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans">
      <div className="w-full h-72 md:h-80 bg-white/[0.05] animate-pulse" />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-5 bg-white/10 rounded-full w-20" />
          <div className="h-9 bg-white/10 rounded-xl w-4/5" />
          <div className="h-4 bg-white/5 rounded-full w-2/3" />
          <div className="h-4 bg-white/5 rounded-full w-1/2" />
          <div className="h-20 bg-white/5 rounded-xl mt-4" />
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 animate-pulse space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 bg-white/10 rounded w-24" />
              <div className="h-12 bg-white/5 rounded-xl" />
            </div>
          ))}
          <div className="h-14 bg-white/10 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

// ── Input class ───────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white ' +
  'placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/60 focus:bg-white/[0.06] ' +
  'focus:ring-1 focus:ring-[#7c3aed]/30 transition-all duration-200 text-sm';

// ── Page ─────────────────────────────────────────────────────────────────────

const EventRegistrationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const galleryImages: string[] = event?.gallery_images?.length > 0
    ? event.gallery_images
    : (event?.cover_image_url ? [event.cover_image_url] : []);
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    if (slug) fetchEventData(slug);
  }, [slug]);

  useEffect(() => {
    if (!hasMultipleImages || bannerPaused) return;
    const timer = setInterval(() => setBannerIndex(prev => (prev + 1) % galleryImages.length), 5000);
    return () => clearInterval(timer);
  }, [hasMultipleImages, bannerPaused, galleryImages.length]);

  const bannerPrev = useCallback(() => {
    setBannerIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  const bannerNext = useCallback(() => {
    setBannerIndex(prev => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const fetchEventData = async (eventSlug: string) => {
    setLoading(true);
    setError('');
    try {
      const eventRes = await getEventBySlug(eventSlug);
      const eventData = eventRes.data;
      setEvent(eventData);
      const fieldsRes = await getFormFields(eventData._id || eventData.id);
      const sortedFields = (fieldsRes.data || []).sort((a: any, b: any) => a.order - b.order);
      setFields(sortedFields);
      const initialData: Record<string, any> = {};
      sortedFields.forEach((field: any) => {
        initialData[field.label] = field.field_type === 'checkbox' ? false : '';
      });
      setFormData(initialData);
    } catch (err: any) {
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (label: string, value: any) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const sendConfirmationEmail = async (regRes: any) => {
    try {
      const email = formData['Email'] || formData['email'] || '';
      const name = formData['Full Name'] || formData['Name'] || 'Participant';
      if (!email) return;
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        email, from_name: 'NexAttend Events', participant_name: name,
        event_title: event.title, event_date: new Date(event.event_date).toLocaleString(),
        event_location: event.location, qr_code_id: regRes.data.qr_code_id,
        verify_url: `${window.location.origin}/registration/success/${regRes.data.qr_code_id}`,
      }, EMAILJS_PUBLIC_KEY);
    } catch (err) {
      console.error('EmailJS error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await registerForEvent({ event_id: event._id || event.id, form_data: formData });
      sendConfirmationEmail(res);
      navigate(`/registration/success/${res.data.qr_code_id}`, { state: { event, formData } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. You might already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) return <SkeletonPage />;

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center text-white gap-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">{error || 'Event not found'}</h2>
        <Link to="/events" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition-colors">
          Browse Events
        </Link>
      </div>
    );
  }

  const capacity = event.capacity || 0;
  const registrations = event.registration_count || 0;
  const isFull = capacity > 0 && registrations >= capacity;
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - registrations) : null;
  const fillPct = capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= Math.ceil(capacity * 0.15);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans overflow-x-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* ── Banner ── */}
      <div
        className="w-full h-64 md:h-80 relative bg-[#080815] overflow-hidden group"
        onMouseEnter={() => setBannerPaused(true)}
        onMouseLeave={() => setBannerPaused(false)}
      >
        {galleryImages.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={bannerIndex}
              src={galleryImages[bannerIndex]}
              alt={`${event.title} photo`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 0.55, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/30 via-[#0a0a1a] to-[#00d4ff]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/50 to-transparent" />

        {hasMultipleImages && (
          <>
            <button onClick={bannerPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={bannerNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {galleryImages.map((_: string, idx: number) => (
                <button key={idx} onClick={() => setBannerIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === bannerIndex ? 'w-6 h-2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}

        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 z-20 flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors text-sm font-medium">
          <ChevronLeft size={16} /> Back
        </button>
        <Link to="/" className="absolute top-5 right-5 z-20 hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">NexAttend</span>
        </Link>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 relative z-10">

        {/* ── LEFT: Event info ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:sticky lg:top-8 self-start space-y-6"
        >
          {/* Category + title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold uppercase tracking-wider mb-4 capitalize">
              {event.category || 'Event'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{event.title}</h1>
            {event.organization && (
              <p className="text-gray-500 text-sm font-medium">Hosted by {event.organization}</p>
            )}
          </div>

          {/* Date & Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-xl">
              <div className="w-9 h-9 bg-[#00d4ff]/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Date & Time</p>
                <p className="text-sm text-white font-medium">{new Date(event.event_date).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-xl">
              <div className="w-9 h-9 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Location</p>
                <p className="text-sm text-white font-medium">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Capacity meter */}
          {capacity > 0 && (
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{registrations} / {capacity} registered</span>
                </div>
                {spotsLeft !== null && !isFull && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    isAlmostFull
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {isAlmostFull && <Flame className="w-3 h-3" />}
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                  </div>
                )}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPct}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${fillPct >= 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'}`}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">About this event</p>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">{event.description}</p>
            </div>
          )}

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
              copied
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link Copied!' : 'Share Event'}
          </button>
        </motion.div>

        {/* ── RIGHT: Registration form ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 md:p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 rounded-xl flex items-center justify-center border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Register Now</h2>
                <p className="text-gray-500 text-xs">Fill in your details to secure your spot</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm mb-6 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}

            {isFull ? (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-orange-400 mb-2">Event is Full</h3>
                <p className="text-gray-400 text-sm">This event has reached its maximum capacity of <span className="text-white font-semibold">{capacity} participants</span>.</p>
                <Link to="/events" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium transition-colors">
                  Find Other Events
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field) => (
                  <div key={field._id || field.id}>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-[#00d4ff] text-xs">*</span>}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.label] || ''}
                        onChange={e => handleInputChange(field.label, e.target.value)}
                        className={`${inputCls} resize-none min-h-[100px]`}
                      />
                    ) : field.field_type === 'dropdown' ? (
                      <select
                        required={field.required}
                        value={formData[field.label] || ''}
                        onChange={e => handleInputChange(field.label, e.target.value)}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="" disabled>Select an option</option>
                        {(field.options || []).map((opt: string) => (
                          <option key={opt} value={opt} className="bg-[#0a0a1a]">{opt}</option>
                        ))}
                      </select>
                    ) : field.field_type === 'checkbox' ? (
                      <label className="flex items-center gap-3 cursor-pointer group mt-1">
                        <div className="relative flex items-center shrink-0">
                          <input
                            type="checkbox"
                            required={field.required}
                            checked={formData[field.label] || false}
                            onChange={e => handleInputChange(field.label, e.target.checked)}
                            className="w-5 h-5 opacity-0 absolute cursor-pointer z-10"
                          />
                          <div className={`w-5 h-5 rounded-md flex border-2 transition-all ${
                            formData[field.label]
                              ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] border-transparent shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                              : 'border-white/20 bg-transparent group-hover:border-[#00d4ff]/50'
                          }`}>
                            {formData[field.label] && (
                              <svg className="w-3.5 h-3.5 text-white m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-300 text-sm">{field.placeholder || 'I agree'}</span>
                      </label>
                    ) : (
                      <input
                        type={field.field_type === 'phone' ? 'tel' : field.field_type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.label] || ''}
                        onChange={e => handleInputChange(field.label, e.target.value)}
                        className={inputCls}
                      />
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full relative bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-bold py-4 rounded-xl text-base shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all flex justify-center items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-gray-600 text-xs mt-3">Your QR ticket will be emailed to you instantly.</p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;
