import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import ConfirmModal from '../components/ConfirmModal';
import { getMyEvents, deleteEvent, duplicateEvent } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { Event } from '../types';

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { success, info, error: toastError } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data?.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      toastError('Load Failed', 'Could not load your events.');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget);
      setEvents(events.filter(e => (e._id || e.id) !== deleteTarget));
      success('Event Deleted', 'The event and all registrations were completely removed.');
    } catch (error) {
      console.error("Failed to delete event", error);
      toastError('Delete Failed', 'Could not delete the event. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    try {
      await duplicateEvent(id);
      info('Event Duplicated', 'A copy was created as a new draft.');
      await fetchEvents();
    } catch (err) {
      toastError('Duplicate Failed', 'Could not duplicate the event.');
    } finally {
      setDuplicating(null);
    }
  };


  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <Sidebar />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Event?"
        message="This will permanently delete the event, all registrations, and form fields. This action cannot be undone."
        confirmLabel="Delete Event"
        cancelLabel="Cancel"
        danger
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a1a] to-[#0a0a1a] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                My Events
              </h1>
              <p className="text-gray-400 mt-2">Manage and track your created events.</p>
            </div>
            
            <button
              onClick={() => navigate('/events/create')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-white/[0.05]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-white/10 rounded-lg w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    <div className="h-3 bg-white/5 rounded-full w-2/3" />
                    <div className="h-1.5 bg-white/5 rounded-full mt-4" />
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                      {[1, 2, 3, 4].map(j => <div key={j} className="h-9 bg-white/5 rounded-xl" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <EventCard 
                    event={event} 
                    isDashboard={true} 
                    onDelete={(id) => setDeleteTarget(id)}
                    onDuplicate={handleDuplicate}
                    duplicating={duplicating === (event._id || event.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No events found</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-6">
                You haven't created any events yet. Get started by creating your first event!
              </p>
              <button
                onClick={() => navigate('/events/create')}
                className="px-6 py-2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create New Event
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
