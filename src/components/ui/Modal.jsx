import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Premium Modal System
 * - Smooth fade in/out without backdrop-blur glitch
 * - ESC close + click-outside
 * - Focus trapping
 * - Background scroll lock
 * - Uses React Portal to avoid z-index conflicts
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  icon: Icon,
  iconColor = 'text-prpl',
  iconBg = 'bg-prpl/10 dark:bg-prpl/20',
  footer,
  noPadding = false,
  closeOnBackdrop = true,
}) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  // Mount → show (animate in)
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setMounted(true);
      // Next frame: trigger CSS transition
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    } else if (mounted) {
      // Animate out, then unmount
      setShow(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = '';
        if (previousFocus.current?.focus) previousFocus.current.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // ESC key + focus trap
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); handleClose(); }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted, handleClose]);

  // Auto-focus first input
  useEffect(() => {
    if (show && panelRef.current) {
      const el = panelRef.current.querySelector('input, select, textarea');
      if (el) setTimeout(() => el.focus(), 80);
    }
  }, [show]);

  if (!mounted) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  }[size] || 'max-w-lg';

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop — solid overlay, no backdrop-blur to avoid glitch */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out bg-black/60 dark:bg-black/75 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnBackdrop ? handleClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          relative w-full ${sizeClass}
          bg-white dark:bg-[#14161E]
          border border-slate-200/60 dark:border-white/[0.08]
          rounded-2xl
          shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)]
          dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${show
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.97] translate-y-2'
          }
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        {(title || Icon) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all active:scale-95 shrink-0 ml-3"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 overflow-y-auto overscroll-contain ${noPadding ? '' : 'px-6 py-5'}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/[0.06] shrink-0 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
