import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const ctx: ToastContextType = {
    toast: add,
    success: (title, message) => add({ type: 'success', title, message }),
    error: (title, message) => add({ type: 'error', title, message, duration: 6000 }),
    warning: (title, message) => add({ type: 'warning', title, message }),
    info: (title, message) => add({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// ─── Toast Container (renders in portal-like fixed position) ─────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Individual Toast Item ────────────────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, { border: string; icon: React.ReactNode; glow: string }> = {
  success: {
    border: 'border-green-500/30 bg-green-500/10',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    icon: <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />,
  },
  error: {
    border: 'border-red-500/30 bg-red-500/10',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    icon: <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
  },
  warning: {
    border: 'border-yellow-500/30 bg-yellow-500/10',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    icon: <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />,
  },
  info: {
    border: 'border-[#00d4ff]/30 bg-[#00d4ff]/10',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
    icon: <Info className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5" />,
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const style = TOAST_STYLES[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        pointer-events-auto flex items-start gap-3 
        w-80 max-w-[calc(100vw-3rem)] 
        px-4 py-3.5 rounded-2xl border backdrop-blur-xl
        ${style.border} ${style.glow}
      `}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-gray-500 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
