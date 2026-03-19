import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, CalendarDays, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
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
    <div className="w-64 bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen sticky top-0 font-sans z-50">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
            NexAttend Events
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
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

      <div className="p-4 border-t border-white/10">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-white truncate">{user?.name || 'Event Manager'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
