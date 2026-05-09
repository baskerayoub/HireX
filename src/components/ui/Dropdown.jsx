import { useState, useRef, useEffect } from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-60 glass-panel rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] border border-slate-200/40 dark:border-white/[0.06] py-1 animate-dropdown overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, icon: Icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all mx-1',
        'rounded-lg',
        danger
          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-100',
      )}
      style={{ width: 'calc(100% - 8px)' }}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-slate-200/40 dark:bg-white/[0.04]" />;
}

export function DropdownHeader({ children }) {
  return <div className="px-3 py-2.5 border-b border-slate-200/40 dark:border-white/[0.04]">{children}</div>;
}
