import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, CalendarDays, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Create Event', path: '/events/create', icon: <CalendarPlus size={20} /> },
    { label: 'My Events', path: '/events/my', icon: <CalendarDays size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Toggle FAB */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-8 right-6 z-40 p-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.4)] rounded-full text-white transition-all transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-105'}`}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`
        fixed md:relative top-0 left-0 h-screen w-64 bg-[#0a0a1a]/95 md:bg-[#0a0a1a]/80 
        backdrop-blur-xl border-r border-white/10 flex flex-col font-sans z-50 
        transition-transform duration-300 ease-in-out shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close Button Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
              NexAttend Events
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#7c3aed]/20 text-white shadow-[inset_2px_0_0_#00d4ff]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#00d4ff]' : ''}>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between p-4 border-t border-white/10 mt-auto bg-[#0a0a1a]">
          <div className="truncate pr-2">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Event Manager'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
