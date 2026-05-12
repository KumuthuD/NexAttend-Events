import React, { useState, useEffect } from 'react';
import { discoverEvents } from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Compass, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Conference', 'Seminar', 'Other'];

const EventDiscoveryPage = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans flex flex-col relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-[url('/hero_bg.png')] bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/40 via-[#0a0a1a]/80 to-[#0a0a1a]" />
      </div>

      <header className="relative z-20 flex justify-between items-center max-w-7xl w-full mx-auto p-6 border-b border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-md bg-black/20">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Link to="/" className="flex items-center gap-2 group hidden sm:flex bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
              NexAttend Events
            </span>
          </Link>
        </div>
        <nav className="flex gap-4 items-center text-sm font-medium">
          <Link to="/login" className="px-5 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-colors hidden sm:block shadow-lg">Manager Portal</Link>
        </nav>
      </header>

      <main className="flex-1 w-full relative z-10 flex flex-col">
        {/* Banner Content Area */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12 w-full">
            <div className="inline-flex justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
              <Compass className="w-10 h-10 text-[#00d4ff]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">Events</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium">
              Find and register for the latest hackathons, workshops, and seminars near you. 
            </p>

            {/* Search & Filter */}
            <div className="max-w-3xl mx-auto relative z-20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative mb-8 group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 pointer-events-none" />
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input 
                    type="text" 
                    placeholder="Search events by name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/20 rounded-2xl py-5 pl-16 pr-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 transition-all shadow-2xl"
                  />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md ${
                      category === cat 
                        ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] border-transparent scale-105' 
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-24 relative z-10">
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
        </div>
      </main>
    </div>
  );
};

export default EventDiscoveryPage;
