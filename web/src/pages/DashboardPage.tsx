import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import EventCard from '../components/EventCard';
import { getMyEvents, deleteEvent } from '../services/api';
import { Calendar, Users, CheckCircle, Activity, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getMyEvents();
      // Handle array or wrapped {events: []} format
      setEvents(res.data.events || res.data || []);
    } catch (error) {
      console.error("Failed to fetch events", error);
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

  const activeEvents = events.filter(e => e.status === 'published' || e.status === 'ongoing').length;
  const totalRegistrations = events.reduce((acc, e) => acc + (e.registration_count || 0), 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + (e.checked_in_count || 0), 0);

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-[#7c3aed]/10 via-[#0a0a1a]/0 to-transparent blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-between items-center mb-10 text-white"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
              <p className="text-gray-400">Overview of your events and attendees.</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 212, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/events/create')}
              className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2 cursor-pointer transition-shadow"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}><StatsCard icon={<Calendar />} label="Total Events" value={events.length} /></motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}><StatsCard icon={<Activity />} label="Active Events" value={activeEvents} /></motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}><StatsCard icon={<Users />} label="Total Registrations" value={totalRegistrations} /></motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}><StatsCard icon={<CheckCircle />} label="Total Checked In" value={totalCheckedIn} /></motion.div>
          </motion.div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Recent Events</h2>
              <Link to="/events/my" className="text-[#00d4ff] hover:underline text-sm font-medium">View All</Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff]"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-sm">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">Create your first event to start accepting registrations.</p>
                <Link 
                  to="/events/create" 
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors inline-block"
                >
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 6).map((event, index) => (
                  <motion.div
                    key={event._id || event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard 
                      event={event} 
                      isDashboard={true} 
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
