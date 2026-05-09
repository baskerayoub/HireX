import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Archive, ShieldAlert, Info } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ██  PREMIUM CONFIRM DIALOG                                  ██
   Replaces native confirm() with a cinematic, glassmorphism    
   dialog featuring smooth spring animations, backdrop blur,    
   shimmer effects, and full keyboard/click-outside support.    
   ═══════════════════════════════════════════════════════════════ */

const VARIANTS = {
  danger: {
    icon: Trash2,
    accentFrom: '#ef4444',
    accentTo: '#dc2626',
    ringGlow: 'rgba(239,68,68,0.15)',
    buttonGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    buttonShadow: '0 4px 20px -4px rgba(239,68,68,0.5)',
    buttonHoverShadow: '0 8px 30px -4px rgba(239,68,68,0.6)',
    iconBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    iconBgDark: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.08) 100%)',
    iconColor: '#ef4444',
  },
  warning: {
    icon: AlertTriangle,
    accentFrom: '#f59e0b',
    accentTo: '#d97706',
    ringGlow: 'rgba(245,158,11,0.15)',
    buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    buttonShadow: '0 4px 20px -4px rgba(245,158,11,0.5)',
    buttonHoverShadow: '0 8px 30px -4px rgba(245,158,11,0.6)',
    iconBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    iconBgDark: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.08) 100%)',
    iconColor: '#f59e0b',
  },
  info: {
    icon: Info,
    accentFrom: '#7c3aed',
    accentTo: '#6d28d9',
    ringGlow: 'rgba(124,58,237,0.15)',
    buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    buttonShadow: '0 4px 20px -4px rgba(124,58,237,0.5)',
    buttonHoverShadow: '0 8px 30px -4px rgba(124,58,237,0.6)',
    iconBg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    iconBgDark: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(109,40,217,0.08) 100%)',
    iconColor: '#7c3aed',
  },
};

function ConfirmDialogUI({ config, onResolve }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [hoverConfirm, setHoverConfirm] = useState(false);

  const variant = VARIANTS[config.variant] || VARIANTS.danger;
  const Icon = config.icon || variant.icon;

  const handleClose = useCallback((result) => {
    setClosing(true);
    setTimeout(() => onResolve(result), 200);
  }, [onResolve]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  // Auto-focus dialog
  useEffect(() => {
    requestAnimationFrame(() => dialogRef.current?.focus());
  }, []);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const isDark = document.documentElement.classList.contains('dark');

  const content = (
    <div
      ref={overlayRef}
      onClick={(e) => { if (dialogRef.current && !dialogRef.current.contains(e.target)) handleClose(false); }}
      className={`confirm-overlay ${closing ? 'confirm-closing' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        className="confirm-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px) saturate(180%)',
          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="confirm-dialog"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(145deg, rgba(26,28,34,0.98) 0%, rgba(20,22,28,0.98) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,250,252,0.98) 100%)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: `0 32px 64px -12px rgba(0,0,0,${isDark ? '0.6' : '0.25'}), 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}`,
          outline: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${variant.accentFrom}, ${variant.accentTo}, transparent)`,
          borderRadius: '0 0 2px 2px',
          opacity: 0.7,
        }} />

        {/* Close button */}
        <button
          onClick={() => handleClose(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            border: 'none',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
            e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
            e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
          }}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 28px 24px' }}>

          {/* Icon container with glow ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '20px',
                background: variant.ringGlow,
                filter: 'blur(12px)',
                opacity: 0.6,
              }} />
              {/* Icon box */}
              <div style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: isDark ? variant.iconBgDark : variant.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
              }}>
                <Icon style={{ width: '26px', height: '26px', color: variant.iconColor }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#0f172a',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}>
            {config.title || 'Are you sure?'}
          </h3>

          {/* Message */}
          <p style={{
            fontSize: '14px',
            color: isDark ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '340px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {config.message || 'This action cannot be undone.'}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Cancel */}
            <button
              onClick={() => handleClose(false)}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 600,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                color: isDark ? '#cbd5e1' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              }}
            >
              {config.cancelText || 'Cancel'}
            </button>

            {/* Confirm */}
            <button
              onClick={() => handleClose(true)}
              onMouseEnter={() => setHoverConfirm(true)}
              onMouseLeave={() => setHoverConfirm(false)}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                background: variant.buttonGradient,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: hoverConfirm ? variant.buttonHoverShadow : variant.buttonShadow,
                transform: hoverConfirm ? 'translateY(-1px)' : 'translateY(0)',
                letterSpacing: '0.01em',
              }}
            >
              {config.confirmText || 'Confirm'}
            </button>
          </div>
        </div>

        {/* Bottom subtle gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}, transparent)`,
        }} />
      </div>

      {/* Animation styles */}
      <style>{`
        .confirm-overlay {
          animation: confirmOverlayIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .confirm-overlay.confirm-closing {
          animation: confirmOverlayOut 200ms ease-in forwards;
        }
        .confirm-overlay .confirm-backdrop {
          animation: confirmFadeIn 200ms ease-out forwards;
        }
        .confirm-overlay.confirm-closing .confirm-backdrop {
          animation: confirmFadeOut 200ms ease-in forwards;
        }
        .confirm-overlay .confirm-dialog {
          animation: confirmDialogIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .confirm-overlay.confirm-closing .confirm-dialog {
          animation: confirmDialogOut 200ms ease-in forwards;
        }

        @keyframes confirmOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirmOverlayOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirmFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes confirmDialogIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes confirmDialogOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}

/* ── Hook: useConfirm ─────────────────────────── */
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      setState({ config, resolve });
    });
  }, []);

  const handleResolve = useCallback((result) => {
    if (state) {
      state.resolve(result);
      setState(null);
    }
  }, [state]);

  const ConfirmDialog = state ? (
    <ConfirmDialogUI config={state.config} onResolve={handleResolve} />
  ) : null;

  return { confirm, ConfirmDialog };
}

export default ConfirmDialogUI;
