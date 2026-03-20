import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Users, Tag, FileImage,
  Sparkles, Send, ChevronRight, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FormFieldBuilder, { FormField } from '../components/FormFieldBuilder';
import { createEvent, addFormField, updateEventStatus } from '../services/api';

// ── Helper ────────────────────────────────────────────────────────────────────
function generateTempId() {
  return 'tmp_' + Math.random().toString(36).slice(2);
}

const DEFAULT_FIELDS: FormField[] = [
  { tempId: generateTempId(), label: 'Full Name',    field_type: 'text',  placeholder: 'Enter your full name',    required: true,  order: 1, options: [], isDefault: true },
  { tempId: generateTempId(), label: 'Email',        field_type: 'email', placeholder: 'Enter your email',        required: true,  order: 2, options: [], isDefault: true },
  { tempId: generateTempId(), label: 'Phone Number', field_type: 'phone', placeholder: 'Enter your phone number', required: true,  order: 3, options: [], isDefault: true },
];

const CATEGORIES = ['Hackathon', 'Workshop', 'Conference', 'Seminar', 'Other'];

// ── Input wrappers ────────────────────────────────────────────────────────────
const inputClass =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 ' +
  'focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/8 transition-all duration-200';

const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

// ── Toast Notification ────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
interface ToastProps { message: string; type: ToastType }
function Toast({ message, type }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm ${
        type === 'success'
          ? 'bg-green-500/20 border-green-500/30 text-green-300'
          : 'bg-red-500/20 border-red-500/30 text-red-300'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  // — Event details state —
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate]     = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [location, setLocation]       = useState('');
  const [capacity, setCapacity]       = useState<number | ''>('');
  const [category, setCategory]       = useState('');
  const [coverImage, setCoverImage]   = useState<string>('');

  // — Form fields state (starts with 3 defaults) —
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS.map(f => ({ ...f, tempId: generateTempId() })));

  // — UI state —
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<ToastProps | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // — Image upload handler (base64) —
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // — Validation —
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())       errs.title    = 'Event title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!eventDate)          errs.eventDate = 'Event date is required';
    if (!location.trim())    errs.location  = 'Location is required';
    if (!category)           errs.category  = 'Please select a category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // — Save handler (shared for draft and publish) —
  const handleSave = useCallback(async (publishAfter = false) => {
    if (!validate()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      // 1. Create the event
      const eventPayload: Record<string, unknown> = {
        title:          title.trim(),
        description:    description.trim(),
        event_date:     new Date(eventDate).toISOString(),
        location:       location.trim(),
        capacity:       capacity === '' ? 0 : Number(capacity),
        category:       category.toLowerCase(),
        cover_image_url: coverImage || null,
      };
      if (eventEndDate) eventPayload.event_end_date = new Date(eventEndDate).toISOString();

      const eventRes = await createEvent(eventPayload);
      const eventId: string = eventRes.data.id ?? eventRes.data._id;

      // 2. POST each non-default field to the backend
      //    (default fields are auto-created by the backend when the event is created)
      const customFields = fields.filter(f => !f.isDefault);
      for (const field of customFields) {
        await addFormField(eventId, {
          label:       field.label,
          field_type:  field.field_type,
          placeholder: field.placeholder,
          required:    field.required,
          order:       field.order,
          options:     field.options,
        });
      }

      // 3. Optionally publish
      if (publishAfter) {
        await updateEventStatus(eventId, 'published');
      }

      showToast(
        publishAfter ? 'Event published successfully!' : 'Event saved as draft!',
        'success'
      );
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: unknown) {
      console.error('Create event error:', err);
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Something went wrong. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }, [title, description, eventDate, eventEndDate, location, capacity, category, coverImage, fields, navigate]);

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[#7c3aed]/8 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span className="hover:text-[#00d4ff] cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-gray-300">Create Event</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Create New Event</h1>
            <p className="text-gray-400">Fill in the event details and build your registration form.</p>
          </motion.div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* ── LEFT: Event Details ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#00d4ff]/10 rounded-xl">
                  <Sparkles size={20} className="text-[#00d4ff]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Event Details</h2>
                  <p className="text-sm text-gray-500">Basic information about your event</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="event-title" className={labelClass}>Event Title *</label>
                  <input
                    id="event-title"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                    placeholder="e.g. VisioNEX 2026 Hackathon"
                    className={`${inputClass} ${errors.title ? 'border-red-500/50' : ''}`}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="event-description" className={labelClass}>Description *</label>
                  <textarea
                    id="event-description"
                    value={description}
                    onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                    rows={4}
                    placeholder="Describe your event — what it's about, who should attend…"
                    className={`${inputClass} resize-none ${errors.description ? 'border-red-500/50' : ''}`}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.description}</p>}
                </div>

                {/* Date row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-date" className={labelClass}>
                      <Calendar size={13} className="inline mr-1 text-[#00d4ff]" />
                      Event Date *
                    </label>
                    <input
                      id="event-date"
                      type="datetime-local"
                      value={eventDate}
                      onChange={e => { setEventDate(e.target.value); setErrors(p => ({ ...p, eventDate: '' })); }}
                      className={`${inputClass} ${errors.eventDate ? 'border-red-500/50' : ''}`}
                    />
                    {errors.eventDate && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.eventDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="event-end-date" className={labelClass}>
                      <Calendar size={13} className="inline mr-1 text-gray-500" />
                      End Date <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      id="event-end-date"
                      type="datetime-local"
                      value={eventEndDate}
                      onChange={e => setEventEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="event-location" className={labelClass}>
                    <MapPin size={13} className="inline mr-1 text-[#7c3aed]" />
                    Location *
                  </label>
                  <input
                    id="event-location"
                    value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })); }}
                    placeholder="e.g. IIT Main Hall, Auditorium Block C"
                    className={`${inputClass} ${errors.location ? 'border-red-500/50' : ''}`}
                  />
                  {errors.location && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.location}</p>}
                </div>

                {/* Capacity + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-capacity" className={labelClass}>
                      <Users size={13} className="inline mr-1 text-[#00d4ff]" />
                      Capacity
                    </label>
                    <input
                      id="event-capacity"
                      type="number"
                      min={0}
                      value={capacity}
                      onChange={e => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0 = unlimited"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-category" className={labelClass}>
                      <Tag size={13} className="inline mr-1 text-[#7c3aed]" />
                      Category *
                    </label>
                    <select
                      id="event-category"
                      value={category}
                      onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: '' })); }}
                      className={`${inputClass} ${errors.category ? 'border-red-500/50' : ''}`}
                    >
                      <option value="" disabled>Select…</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c.toLowerCase()} className="bg-[#0a0a1a]">{c}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.category}</p>}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className={labelClass}>
                    <FileImage size={13} className="inline mr-1 text-gray-400" />
                    Cover Image <span className="text-gray-600">(optional)</span>
                  </label>
                  {coverImage ? (
                    <div className="relative rounded-xl overflow-hidden h-36">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg transition-colors backdrop-blur-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      id="cover-image-upload"
                      className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-xl hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all cursor-pointer group"
                    >
                      <FileImage size={24} className="text-gray-600 group-hover:text-[#00d4ff] transition-colors mb-2" />
                      <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">Click to upload image</span>
                      <span className="text-xs text-gray-600">PNG, JPG up to 5 MB</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT: Form Builder ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl xl:sticky xl:top-8"
            >
              <FormFieldBuilder fields={fields} onChange={setFields} />
            </motion.div>
          </div>

          {/* ── Bottom action bar ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl"
          >
            <p className="text-sm text-gray-500 text-center sm:text-left">
              You can always edit event details and form fields after creation.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Cancel */}
              <button
                id="cancel-create-event-btn"
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 sm:flex-none px-6 py-3 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium text-sm"
                disabled={saving}
              >
                Cancel
              </button>

              {/* Save as Draft */}
              <button
                id="save-draft-btn"
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save as Draft
              </button>

              {/* Publish */}
              <button
                id="publish-event-btn"
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,212,255,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Publish Event
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default CreateEventPage;
