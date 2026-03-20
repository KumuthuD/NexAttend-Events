import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import { getMyEvents, deleteEvent } from '../services/api';

export default function MyEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data?.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(e => (e._id || e.id) !== id));
      } catch (error) {
        console.error("Failed to delete event", error);
        alert("Failed to delete event.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <Sidebar />
      
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
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
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
                    onDelete={handleDelete}
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
