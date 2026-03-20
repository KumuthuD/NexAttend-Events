import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Edit, QrCode, FileSpreadsheet, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: any;
  isDashboard?: boolean;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isDashboard = false, onDelete }) => {
  const capacity = event.capacity || 0;
  const registrations = event.registration_count || 0;
  const progress = capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
  
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    published: 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50',
    ongoing: 'bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/50',
    completed: 'bg-green-500/20 text-green-400 border-green-500/50'
  };

  const badgeColor = statusColors[event.status as keyof typeof statusColors] || statusColors.draft;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -5px rgba(124, 58, 237, 0.15)" }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col group hover:bg-white/10 transition-all duration-300"
    >
      <div className="h-48 relative bg-gray-900 overflow-hidden">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a1a] to-[#7c3aed]/30 flex items-center justify-center">
            <span className="text-gray-500 font-medium">No Image</span>
          </div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md capitalize ${badgeColor}`}>
          {event.status}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 truncate">{event.title}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-400 gap-2">
            <Calendar className="w-4 h-4 text-[#00d4ff]" />
            <span>{new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400 gap-2">
            <MapPin className="w-4 h-4 text-[#7c3aed]" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Registrations</span>
            <span className="font-medium text-white">{registrations} {capacity > 0 && `/ ${capacity}`}</span>
          </div>
          {capacity > 0 && (
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {isDashboard ? (
            <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-4">
              <Link to={`/events/${event._id || event.id}/edit`} className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
                <span className="text-[10px]">Edit</span>
              </Link>
              <Link to={`/events/${event._id || event.id}/scanner`} className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-[#00d4ff] hover:text-[#5ce1ff] transition-colors" title="Scanner">
                <QrCode className="w-4 h-4" />
                <span className="text-[10px]">Scanner</span>
              </Link>
              <Link to={`/events/${event._id || event.id}/attendance`} className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded-lg text-[#7c3aed] hover:text-[#9f6dff] transition-colors" title="Attendance">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-[10px]">Logs</span>
              </Link>
              <button 
                onClick={() => onDelete && onDelete(event._id || event.id)}
                className="flex flex-col items-center justify-center gap-1.5 py-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors" 
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px]">Delete</span>
              </button>
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
    </motion.div>
  );
};

export default EventCard;
