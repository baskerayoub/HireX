import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    className:
      'border-emerald-200/50 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 shadow-emerald-500/5',
    iconClass: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    className:
      'border-rose-200/50 bg-rose-50/95 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 shadow-rose-500/5',
    iconClass: 'text-rose-500',
  },
  warning: {
    icon: TriangleAlert,
    className:
      'border-amber-200/50 bg-amber-50/95 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 shadow-amber-500/5',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    className:
      'border-slate-200/60 bg-white/95 text-slate-800 dark:border-white/[0.06] dark:bg-[#111318]/95 dark:text-slate-200 shadow-slate-500/5',
    iconClass: 'text-slate-400 dark:text-slate-500',
  },
};

function ToastItem({ toast, onClose }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.2)] backdrop-blur-xl animate-toast-in ${style.className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${style.iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-lg p-1 text-current/40 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/5 shrink-0"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const removeToastByMessage = useCallback((type, message) => {
    setToasts((prev) => prev.filter((t) => !(t.type === type && t.message === message.trim())));
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const duration = options.duration ?? 3500;
    if (!message?.trim()) return;

    setToasts((prev) => {
      const dedupeKey = `${type}:${message.trim()}`;
      if (prev.some((item) => item.dedupeKey === dedupeKey)) return prev;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next = [...prev, { id, message: message.trim(), type, dedupeKey }];
      return next.slice(-5);
    });

    if (duration > 0) {
      const timeoutId = setTimeout(() => removeToastByMessage(type, message), duration);
      return () => clearTimeout(timeoutId);
    }
  }, [removeToastByMessage]);

  const value = useMemo(
    () => ({
      notify: showToast,
      success: (message, options) => showToast(message, 'success', options),
      error: (message, options) => showToast(message, 'error', options),
      warning: (message, options) => showToast(message, 'warning', options),
      info: (message, options) => showToast(message, 'info', options),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2.5 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
