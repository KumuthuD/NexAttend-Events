import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import EventCard from '../components/EventCard';
import { getMyEvents, deleteEvent, duplicateEvent } from '../services/api';
import { Calendar, Users, CheckCircle, Activity, Plus, TrendingUp, BarChart2, Clock, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Event } from '../types';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data.events || res.data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget);
      setEvents(prev => prev.filter(e => (e._id || e.id) !== deleteTarget));
      success('Event Deleted', 'The event and all its registrations have been removed.');
    } catch (err) {
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

  // ── Derived Stats ──
  const activeEvents = events.filter(e => e.status === 'published' || e.status === 'ongoing').length;
  const totalRegistrations = events.reduce((acc, e) => acc + (e.registration_count || 0), 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + (e.checked_in_count || 0), 0);
  const checkInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;
  const recentEvents = [...events].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 6);

  // ── Chart Data (top 6 events by registrations) ──
  const chartData = [...events]
    .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
    .slice(0, 6)
    .map(e => ({
      name: e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title,
      registrations: e.registration_count || 0,
      checkedIn: e.checked_in_count || 0,
    }));

  // ── Most active event ──
  const topEvent = events.reduce<Event | null>((best, e) => {
    if (!best) return e;
    return (e.registration_count || 0) > (best.registration_count || 0) ? e : best;
  }, null);

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      <Sidebar />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Event?"
        message="This will permanently delete the event, all registrations, and form fields. This action cannot be undone."
        confirmLabel="Delete Event"
        cancelLabel="Cancel"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-[#7c3aed]/10 via-[#0a0a1a]/0 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 text-white"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
              <p className="text-gray-400">Overview of your events and attendees.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0, 212, 255, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/events/create')}
              className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2 cursor-pointer transition-shadow"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </motion.button>
          </motion.div>

          {/* ── Stats Row ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl" />
                    <div className="h-4 bg-white/10 rounded w-24" />
                  </div>
                  <div className="h-9 bg-white/10 rounded-lg w-16" />
                </div>
              ))
            ) : [
              { icon: <Calendar />, label: 'Total Events', value: events.length, color: '#00d4ff' },
              { icon: <Activity />, label: 'Active Events', value: activeEvents, color: '#7c3aed' },
              { icon: <Users />, label: 'Registrations', value: totalRegistrations, color: '#00d4ff' },
              { icon: <CheckCircle />, label: 'Checked In', value: totalCheckedIn, color: '#22c55e' },
            ].map((stat, i) => (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatsCard icon={stat.icon} label={stat.label} value={stat.value} />
              </motion.div>
            ))}
          </motion.div>

          {/* ── Bento Grid ── */}
          {!loading && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
            >
              {/* Check-in Rate Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Overall Check-In Rate</span>
                </div>
                <div className="text-5xl font-black text-green-400 mb-2">{checkInRate}%</div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${checkInRate}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">{totalCheckedIn} / {totalRegistrations} attendees checked in</p>
              </div>

              {/* Top Event Card */}
              {topEvent && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 bg-[#7c3aed]/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Most Registrations</span>
                  </div>
                  <h3 className="font-bold text-xl mb-1 truncate">{topEvent.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-3">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{topEvent.registration_count} reg.</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" />{topEvent.checked_in_count} in</span>
                  </div>
                  <Link
                    to={`/events/${topEvent.id || topEvent._id}/attendance`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#00d4ff] hover:underline"
                  >
                    View Attendance →
                  </Link>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Quick Actions</span>
                </div>
                <div className="space-y-2">
                  <button onClick={() => navigate('/events/create')} className="w-full text-left px-4 py-2.5 bg-white/5 hover:bg-[#00d4ff]/10 hover:text-[#00d4ff] rounded-xl text-sm transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Event
                  </button>
                  <Link to="/events/my" className="w-full text-left px-4 py-2.5 bg-white/5 hover:bg-[#7c3aed]/10 hover:text-[#7c3aed] rounded-xl text-sm transition-all flex items-center gap-2 block">
                    <Calendar className="w-4 h-4" /> Manage All Events
                  </Link>
                  <Link to="/events" className="w-full text-left px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-all flex items-center gap-2 block">
                    <Activity className="w-4 h-4" /> Discover Events
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Analytics Chart ── */}
          {!loading && chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Event Performance</h2>
                  <p className="text-gray-400 text-sm">Registrations vs Check-ins by event</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#00d4ff]" />Registrations</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#7c3aed]" />Checked In</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#13132b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="registrations" fill="#00d4ff" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill="#00d4ff" fillOpacity={0.8} />)}
                  </Bar>
                  <Bar dataKey="checkedIn" fill="#7c3aed" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill="#7c3aed" fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* ── Recent Events Grid ── */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Recent Events</h2>
              <Link to="/events/my" className="text-[#00d4ff] hover:underline text-sm font-medium">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-white/5" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-white/10 rounded-lg w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                      <div className="h-2 bg-white/5 rounded-full mt-4" />
                      <div className="grid grid-cols-4 gap-1 pt-3 border-t border-white/5">
                        {[1,2,3,4].map(j => <div key={j} className="h-10 bg-white/5 rounded-lg" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-sm"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Create your first event to start accepting registrations and managing attendance.</p>
                <Link
                  to="/events/create"
                  className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" /> Create Event
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event._id || event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.07 }}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
