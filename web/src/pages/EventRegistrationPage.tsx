import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventBySlug, getFormFields, registerForEvent } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

const EventRegistrationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) fetchEventData(slug);
  }, [slug]);

  const fetchEventData = async (eventSlug: string) => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Event by Slug
      const eventRes = await getEventBySlug(eventSlug);
      const eventData = eventRes.data;
      setEvent(eventData);

      // 2. Fetch Form Fields by Event ID
      const fieldsRes = await getFormFields(eventData._id || eventData.id);
      
      // Sort fields by order
      const sortedFields = (fieldsRes.data || []).sort((a: any, b: any) => a.order - b.order);
      setFields(sortedFields);

      // Initialize form state
      const initialData: Record<string, any> = {};
      sortedFields.forEach((field: any) => {
        initialData[field.label] = field.field_type === 'checkbox' ? false : '';
      });
      setFormData(initialData);

    } catch (err: any) {
      console.error(err);
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (label: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // API payload expects { event_id: string, form_data: dict }
      const payload = {
        event_id: event._id || event.id,
        form_data: formData
      };
      
      const res = await registerForEvent(payload);
      const qrCodeId = res.data.qr_code_id;
      
      // Navigate to success page
      navigate(`/registration/success/${qrCodeId}`, { state: { event, formData } });
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to register. You might be already registered.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <Link to="/events" className="text-[#00d4ff] hover:underline">Back to Events</Link>
      </div>
    );
  }

  // Check if fully booked
  const isFull = event.capacity > 0 && event.registration_count >= event.capacity;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans flex flex-col items-center pb-20 overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
      {/* Header Banner */}
      <div className="w-full h-64 md:h-80 relative bg-gray-900 border-b border-white/10">
        {event.cover_image_url ? (
           <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover opacity-60" />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-[#0a0a1a] to-[#7c3aed]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
        
        <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 group bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/50 transition-colors">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
            NexAttend
          </span>
        </Link>
      </div>

      <main className="w-full max-w-3xl mx-auto px-6 -mt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
            <div>
              <div className="inline-block px-3 py-1 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff] text-xs font-semibold mb-4 capitalize">
                {event.category || 'Event'}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Calendar className="w-4 h-4 text-[#00d4ff]" /></div>
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-[#7c3aed]" /></div>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/10 my-6" />
          <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </motion.div>

        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative"
        >
          <h2 className="text-2xl font-bold items-center flex gap-3 mb-6">
            <CheckCircle2 className="text-[#00d4ff]" />
            Registration Form
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-4 text-sm mb-6 flex items-center gap-3">
              {error}
            </div>
          )}

          {isFull ? (
             <div className="bg-orange-500/10 border border-orange-500/50 text-orange-400 rounded-xl p-6 text-center">
               <h3 className="text-xl font-bold mb-2">Event is Full</h3>
               <p>Sorry, this event has reached its maximum capacity of {event.capacity} participants.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => (
                <div key={field._id || field.id}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex gap-1">
                    {field.label} {field.required && <span className="text-[#00d4ff]">*</span>}
                  </label>
                  
                  {field.field_type === 'textarea' ? (
                    <textarea 
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      className="w-full bg-[#0a0a1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all min-h-[100px]"
                    />
                  ) : field.field_type === 'dropdown' ? (
                    <select
                      required={field.required}
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      className="w-full bg-[#0a0a1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all appearance-none"
                    >
                      <option value="" disabled>Select an option</option>
                      {(field.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.field_type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer mt-2 group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          required={field.required}
                          checked={formData[field.label] || false}
                          onChange={(e) => handleInputChange(field.label, e.target.checked)}
                          className="w-5 h-5 opacity-0 absolute cursor-pointer z-10"
                        />
                        <div className={`w-5 h-5 rounded flex border transition-colors ${formData[field.label] ? 'bg-[#00d4ff] border-[#00d4ff]' : 'border-gray-500 bg-transparent group-hover:border-[#00d4ff]/50'}`}>
                           {formData[field.label] && <svg className="w-4 h-4 text-[#0a0a1a] m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                      <span className="text-gray-300 text-sm">{field.placeholder || 'Yes, I agree'}</span>
                    </label>
                  ) : (
                    <input 
                      type={field.field_type === 'phone' ? 'tel' : field.field_type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.label] || ''}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      className="w-full bg-[#0a0a1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all"
                    />
                  )}
                </div>
              ))}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-medium py-3.5 rounded-xl mt-8 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default EventRegistrationPage;
