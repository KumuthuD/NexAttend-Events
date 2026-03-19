import React, { useState, useEffect } from 'react';
import { discoverEvents } from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Conference', 'Seminar', 'Other'];

const EventDiscoveryPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [debouncedSearch, category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const catParam = category === 'All' ? undefined : category.toLowerCase();
      const res = await discoverEvents(debouncedSearch || undefined, catParam);
      setEvents(res.data.events || res.data || []);
    } catch (error) {
      console.error("Failed to discover events", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans flex flex-col">
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto p-6 z-10 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
            NexAttend Events
          </span>
        </Link>
        <nav className="flex gap-6 items-center text-sm font-medium">
          <Link to="/login" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">Login / Manager Portal</Link>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[#00d4ff]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="text-center mb-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-center mb-4">
              <Compass className="w-12 h-12 text-[#00d4ff]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Events</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Find and register for the latest hackathons, workshops, and seminars near you. 
            </p>
          </motion.div>
        </div>

        {/* Search & Filter */}
        <div className="max-w-3xl mx-auto mb-16 relative z-10">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search events by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 backdrop-blur-md transition-all shadow-xl"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat 
                    ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white shadow-lg' 
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards */}
        <div className="relative z-10">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff]"></div>
             </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <h3 className="text-2xl font-semibold mb-2 text-gray-300">No events found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard event={event} isDashboard={false} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventDiscoveryPage;
