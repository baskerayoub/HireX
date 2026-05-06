import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${styles[type]} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }} className="ml-2 p-0.5 rounded hover:bg-black/5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container hook for managing multiple toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const remove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-6 right-6 z-[100] space-y-3">
      {toasts.map((toast, i) => (
        <div key={toast.id} style={{ transform: `translateY(${i * 4}px)` }}>
          <Toast message={toast.message} type={toast.type} onClose={() => remove(toast.id)} />
        </div>
      ))}
    </div>
  );

  return { show, ToastContainer };
}
