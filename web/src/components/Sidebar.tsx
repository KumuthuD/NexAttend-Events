import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarPlus, CalendarDays, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SWIPE_THRESHOLD = 60;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const navItems = [
    { label: 'Dashboard',    path: '/dashboard',     Icon: LayoutDashboard },
    { label: 'Create Event', path: '/events/create', Icon: CalendarPlus },
    { label: 'My Events',    path: '/events/my',     Icon: CalendarDays },
    { label: 'Settings',     path: '/settings',      Icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (!isOpen && dx > SWIPE_THRESHOLD && touchStartX.current < 40) setIsOpen(true);
      else if (isOpen && dx < -SWIPE_THRESHOLD) setIsOpen(false);
      touchStartX.current = null;
      touchStartY.current = null;
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-8 right-6 z-40 p-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] shadow-[0_0_24px_rgba(124,58,237,0.5)] rounded-full text-white transition-all transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-105'}`}
      >
        <Menu size={24} />
      </button>

      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar panel */}
      <motion.div
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed md:relative top-0 left-0 h-screen
          bg-[#07071a]/95 md:bg-[#07071a]/90
          backdrop-blur-2xl border-r border-white/[0.07]
          flex flex-col font-sans z-50 shrink-0 overflow-hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#00d4ff]/5 to-transparent pointer-events-none" />

        {/* Mobile close */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-5 right-4 p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between px-4 py-5 min-h-[68px]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden min-w-0" onClick={() => setIsOpen(false)}>
            <div className="relative shrink-0 flex items-center justify-center w-9 h-9">
              <div className="absolute inset-0 bg-[#00d4ff] blur-lg opacity-25 rounded-full" />
              <img src="/logo.png" alt="NexAttend" className="w-9 h-9 object-contain relative z-10" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="text-[17px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] whitespace-nowrap tracking-tight"
                >
                  NexAttend
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 hover:text-white transition-all shrink-0"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden mt-1">
          {navItems.map(({ label, path, Icon }) => {
            const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border border-white/[0.08]"
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                {/* Active left glow bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#00d4ff] rounded-r-full"
                    style={{ boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff40' }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}

                <Icon
                  size={19}
                  className={`shrink-0 relative z-10 transition-colors ${isActive ? 'text-[#00d4ff]' : ''}`}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="font-semibold text-[13px] whitespace-nowrap relative z-10 tracking-wide"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#13132b] border border-white/10 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#13132b]" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.07] mt-auto">
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white select-none">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#07071a] shadow-[0_0_6px_#4ade80]" />
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate leading-tight">{user?.name || 'Event Manager'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                  >
                    <LogOut size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {collapsed && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
