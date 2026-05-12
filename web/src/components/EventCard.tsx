import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Edit, QrCode, FileSpreadsheet, Trash2, Copy, Link2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
  isDashboard?: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  duplicating?: boolean;
}

// Category-based gradient fallbacks (no cover image)
const CATEGORY_GRADIENTS: Record<string, string> = {
  hackathon: 'from-[#7c3aed] to-[#4f1d96]',
  workshop: 'from-[#0369a1] to-[#00d4ff]',
  conference: 'from-[#0f766e] to-[#06b6d4]',
  seminar: 'from-[#9333ea] to-[#db2777]',
  other: 'from-[#1e293b] to-[#334155]',
};

const EventCard: React.FC<EventCardProps> = ({ event, isDashboard = false, onDelete, onDuplicate, duplicating }) => {
  const [copied, setCopied] = useState(false);
  const capacity = event.capacity || 0;
  const registrations = event.registration_count || 0;
  const progress = capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
  const isNearFull = capacity > 0 && progress >= 80;

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    published: 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50',
    ongoing: 'bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/50',
    completed: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  const badgeColor = statusColors[event.status as keyof typeof statusColors] || statusColors.draft;
  const categoryGrad = CATEGORY_GRADIENTS[event.category?.toLowerCase() ?? 'other'] || CATEGORY_GRADIENTS.other;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}/register`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const eventId = event._id || event.id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
      viewport={{ once: true, margin: '-50px' }}
      className="relative rounded-2xl overflow-hidden flex flex-col group"
      style={{ isolation: 'isolate' }}
    >
      {/* Gradient glow border on hover */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#00d4ff]/0 via-[#7c3aed]/0 to-[#00d4ff]/0 group-hover:from-[#00d4ff]/40 group-hover:via-[#7c3aed]/40 group-hover:to-[#00d4ff]/20 transition-all duration-500 pointer-events-none z-0" />
      <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/[0.07] transition-colors duration-300 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden rounded-2xl" style={{ backdropFilter: 'blur(16px)' }}>
      {/* Cover Image / Gradient Fallback */}
      <div className="h-48 relative overflow-hidden">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${categoryGrad} flex items-center justify-center relative`}>
            <span className="text-white/20 text-6xl font-black uppercase select-none">
              {event.title.charAt(0)}
            </span>
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md capitalize ${badgeColor}`}>
          {event.status}
        </div>

        {/* Near Full Warning */}
        {isNearFull && isDashboard && (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-semibold backdrop-blur-md">
            {Math.round(progress)}% full
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 truncate">{event.title}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400 gap-2">
            <Calendar className="w-4 h-4 text-[#00d4ff] shrink-0" />
            <span className="truncate">
              {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400 gap-2">
            <MapPin className="w-4 h-4 text-[#7c3aed] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Registrations</span>
            <span className="font-medium text-white">{registrations} {capacity > 0 && `/ ${capacity}`}</span>
          </div>
          {capacity > 0 && (
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isNearFull ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {isDashboard ? (
            <div className="border-t border-white/10 pt-3">
              {/* Primary actions row */}
              <div className="grid grid-cols-4 gap-1 mb-2">
                <Link
                  to={`/events/${eventId}/edit`}
                  className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-xs">Edit</span>
                </Link>
                <Link
                  to={`/events/${eventId}/scanner`}
                  className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-[#00d4ff] hover:text-[#5ce1ff] transition-colors"
                  title="Scanner"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs">Scanner</span>
                </Link>
                <Link
                  to={`/events/${eventId}/attendance`}
                  className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-[#7c3aed] hover:text-[#9f6dff] transition-colors"
                  title="Attendance"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-xs">Logs</span>
                </Link>
                <button
                  onClick={() => onDelete && onDelete(eventId)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs">Delete</span>
                </button>
              </div>

              {/* Secondary actions row */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
                  title="Copy Registration Link"
                >
                  {copied ? <Copy className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => onDuplicate && onDuplicate(eventId)}
                  disabled={duplicating}
                  className="flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-[#7c3aed]/10 hover:text-[#7c3aed] rounded-lg text-xs font-medium text-gray-400 border border-white/5 hover:border-[#7c3aed]/20 transition-all disabled:opacity-50"
                  title="Duplicate Event"
                >
                  {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                  Duplicate
                </button>
              </div>
            </div>
          ) : (
            <Link
              to={`/events/${event.slug}/register`}
              className="w-full block text-center bg-white/10 hover:bg-gradient-to-r hover:from-[#00d4ff] hover:to-[#7c3aed] hover:border-transparent text-white font-medium py-3 rounded-xl transition-all duration-300 mt-4 border border-white/5 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] shadow-sm"
            >
              Register Now
            </Link>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
