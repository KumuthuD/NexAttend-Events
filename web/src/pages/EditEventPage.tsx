import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Users, Tag, FileImage, Images,
  Edit, Send, ChevronRight, AlertCircle, Loader2,
  CheckCircle2, ArrowLeft, X, Plus
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FormFieldBuilder, { FormField } from '../components/FormFieldBuilder';
import {
  getEvent,
  getFormFields,
  updateEvent,
  addFormField,
  updateFormField,
  deleteFormField,
  updateEventStatus,
} from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateTempId() {
  return 'tmp_' + Math.random().toString(36).slice(2);
}

const CATEGORIES = ['Hackathon', 'Workshop', 'Conference', 'Seminar', 'Other'];

const inputClass =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 ' +
  'focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/8 transition-all duration-200';

const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

// Default field labels that the backend auto-creates — we don't POST these again
const DEFAULT_LABELS = new Set(['full_name', 'email', 'phone_number']);

function toKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, '_');
}

// ── Toast ─────────────────────────────────────────────────────────────────────
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
const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // — Event details —
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [eventDate, setEventDate]       = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [location, setLocation]         = useState('');
  const [capacity, setCapacity]         = useState<number | ''>('');
  const [category, setCategory]         = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');

  // — Form fields (loaded from DB, then managed locally) —
  const [fields, setFields]           = useState<FormField[]>([]);
  // Keep track of original field IDs so we can diff on save
  const [originalFieldIds, setOriginalFieldIds] = useState<Set<string>>(new Set());

  // — UI —
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState<ToastProps | null>(null);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  // ── Load event data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [eventRes, fieldsRes] = await Promise.all([
          getEvent(id),
          getFormFields(id),
        ]);

        const ev = eventRes.data;
        setTitle(ev.title ?? '');
        setDescription(ev.description ?? '');
        setEventDate(ev.event_date ? ev.event_date.slice(0, 16) : '');
        setEventEndDate(ev.event_end_date ? ev.event_end_date.slice(0, 16) : '');
        setLocation(ev.location ?? '');
        setCapacity(ev.capacity ?? 0);
        setCategory(ev.category ?? '');
        setGalleryImages(ev.gallery_images ?? (ev.cover_image_url ? [ev.cover_image_url] : []));
        setCurrentStatus(ev.status ?? 'draft');

        // Map backend fields → local FormField shape
        const backendFields: FormField[] = (fieldsRes.data as Record<string, unknown>[]).map((f) => ({
          id:          String(f.id ?? ''),
          tempId:      generateTempId(),
          label:       String(f.label ?? ''),
          field_type:  String(f.field_type ?? 'text'),
          placeholder: String(f.placeholder ?? ''),
          required:    Boolean(f.required),
          order:       Number(f.order ?? 1),
          options:     Array.isArray(f.options) ? f.options.map(String) : [],
          isDefault:   DEFAULT_LABELS.has(toKey(String(f.label ?? ''))),
        }));

        backendFields.sort((a, b) => a.order - b.order);
        setFields(backendFields);
        setOriginalFieldIds(new Set(backendFields.filter(f => f.id).map(f => f.id!)));
      } catch (err) {
        console.error('Failed to load event', err);
        showToast('Failed to load event data.', 'error');
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [id]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // — Multi-image upload —
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setGalleryImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // — Validation —
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())       errs.title       = 'Event title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!eventDate)          errs.eventDate    = 'Event date is required';
    if (!location.trim())    errs.location     = 'Location is required';
    if (!category)           errs.category     = 'Please select a category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // — Save handler —
  const handleSave = useCallback(async (publishAfter = false) => {
    if (!id) return;
    if (!validate()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      // 1. Update event details
      const eventPayload: Record<string, unknown> = {
        title:          title.trim(),
        description:    description.trim(),
        event_date:     new Date(eventDate).toISOString(),
        location:       location.trim(),
        capacity:       capacity === '' ? 0 : Number(capacity),
        category:       category.toLowerCase(),
        cover_image_url: galleryImages.length > 0 ? galleryImages[0] : null,
        gallery_images:  galleryImages,
      };
      if (eventEndDate) eventPayload.event_end_date = new Date(eventEndDate).toISOString();
      await updateEvent(id, eventPayload);

      // 2. Sync form fields
      //    a) Fields that now exist in local state but have an id → update
      //    b) Fields with no id (newly added) → POST
      //    c) originalFieldIds not present in the current list → DELETE
      const currentIds = new Set(fields.filter(f => f.id).map(f => f.id!));

      // Deletions: original IDs not in current
      for (const origId of originalFieldIds) {
        if (!currentIds.has(origId)) {
          await deleteFormField(id, origId);
        }
      }

      // Updates & Additions
      for (const field of fields) {
        const payload = {
          label:       field.label,
          field_type:  field.field_type,
          placeholder: field.placeholder,
          required:    field.required,
          order:       field.order,
          options:     field.options,
        };
        if (field.id && originalFieldIds.has(field.id)) {
          // Existing → update
          await updateFormField(id, field.id, payload);
        } else if (!field.id) {
          // New → add
          await addFormField(id, payload);
        }
      }

      // 3. Optionally publish
      if (publishAfter && currentStatus !== 'published') {
        await updateEventStatus(id, 'published');
      }

      showToast(
        publishAfter ? 'Event published!' : 'Changes saved!',
        'success'
      );
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: unknown) {
      console.error('Update event error:', err);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }, [id, title, description, eventDate, eventEndDate, location, capacity, category, galleryImages, fields, originalFieldIds, currentStatus, navigate]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <div className="flex h-screen bg-[#0a0a1a] text-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading event…</p>
          </div>
        </main>
      </div>
    );
  }

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[#7c3aed]/8 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 relative z-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="hover:text-[#00d4ff] transition-colors"
              >
                Dashboard
              </button>
              <ChevronRight size={14} />
              <span className="text-gray-300">Edit Event</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Edit Event</h1>
                <p className="text-gray-400">Update your event details and registration form.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
                {currentStatus === 'published' && (
                  <span className="px-3 py-1 bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff] text-xs rounded-full font-medium">
                    Published
                  </span>
                )}
                {currentStatus === 'draft' && (
                  <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 text-gray-400 text-xs rounded-full font-medium">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* ── LEFT ──────────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#7c3aed]/10 rounded-xl">
                  <Edit size={20} className="text-[#7c3aed]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Event Details</h2>
                  <p className="text-sm text-gray-500">Update the basic information</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="edit-event-title" className={labelClass}>Event Title *</label>
                  <input
                    id="edit-event-title"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                    className={`${inputClass} ${errors.title ? 'border-red-500/50' : ''}`}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="edit-event-description" className={labelClass}>Description *</label>
                  <textarea
                    id="edit-event-description"
                    value={description}
                    onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                    rows={4}
                    className={`${inputClass} resize-none ${errors.description ? 'border-red-500/50' : ''}`}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.description}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-event-date" className={labelClass}>
                      <Calendar size={13} className="inline mr-1 text-[#00d4ff]" />
                      Event Date *
                    </label>
                    <input
                      id="edit-event-date"
                      type="datetime-local"
                      value={eventDate}
                      onChange={e => { setEventDate(e.target.value); setErrors(p => ({ ...p, eventDate: '' })); }}
                      className={`${inputClass} ${errors.eventDate ? 'border-red-500/50' : ''}`}
                    />
                    {errors.eventDate && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.eventDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-event-end-date" className={labelClass}>
                      <Calendar size={13} className="inline mr-1 text-gray-500" />
                      End Date <span className="text-gray-600">(opt.)</span>
                    </label>
                    <input
                      id="edit-event-end-date"
                      type="datetime-local"
                      value={eventEndDate}
                      onChange={e => setEventEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="edit-event-location" className={labelClass}>
                    <MapPin size={13} className="inline mr-1 text-[#7c3aed]" />
                    Location *
                  </label>
                  <input
                    id="edit-event-location"
                    value={location}
                    onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: '' })); }}
                    className={`${inputClass} ${errors.location ? 'border-red-500/50' : ''}`}
                  />
                  {errors.location && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.location}</p>}
                </div>

                {/* Capacity + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-event-capacity" className={labelClass}>
                      <Users size={13} className="inline mr-1 text-[#00d4ff]" />
                      Capacity
                    </label>
                    <input
                      id="edit-event-capacity"
                      type="number"
                      min={0}
                      value={capacity}
                      onChange={e => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0 = unlimited"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-event-category" className={labelClass}>
                      <Tag size={13} className="inline mr-1 text-[#7c3aed]" />
                      Category *
                    </label>
                    <select
                      id="edit-event-category"
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

                {/* Event Gallery Images */}
                <div>
                  <label className={labelClass}>
                    <Images size={13} className="inline mr-1 text-gray-400" />
                    Event Gallery <span className="text-gray-600">(optional · first image = cover)</span>
                  </label>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden h-24 group border border-white/10">
                          <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-[10px] font-bold text-white rounded-md">
                              COVER
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all cursor-pointer group">
                        <Plus size={20} className="text-gray-600 group-hover:text-[#00d4ff] transition-colors" />
                        <span className="text-[10px] text-gray-600 group-hover:text-gray-400 mt-1">Add More</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}

                  {galleryImages.length === 0 && (
                    <label
                      id="edit-cover-image-upload"
                      className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-xl hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all cursor-pointer group"
                    >
                      <Images size={24} className="text-gray-600 group-hover:text-[#00d4ff] transition-colors mb-2" />
                      <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">Click to upload images</span>
                      <span className="text-xs text-gray-600">PNG, JPG · Select multiple files</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}

                  {galleryImages.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1.5">
                      {galleryImages.length} image{galleryImages.length > 1 ? 's' : ''} uploaded · These will appear as a slideshow on the registration page
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT: Form Builder ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-xl xl:sticky xl:top-8"
            >
              <FormFieldBuilder fields={fields} onChange={setFields} />
            </motion.div>
          </div>

          {/* ── Bottom action bar ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl"
          >
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Changes are applied immediately and affect the live registration form.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="edit-cancel-btn"
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium text-sm"
              >
                Cancel
              </button>

              {/* Save Changes */}
              <button
                id="save-changes-btn"
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Changes
              </button>

              {/* Publish (only if still draft) */}
              {currentStatus !== 'published' && (
                <button
                  id="edit-publish-btn"
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,212,255,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Publish Event
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default EditEventPage;
