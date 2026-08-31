import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export const ModalContext = createContext({ requestClose: () => {} });

export const ModalCancelButton = ({ onClick, children = 'Cancel', ...props }) => {
  const { requestClose } = useContext(ModalContext);
  return (
    <Button
      variant="outline"
      onClick={(e) => {
        if (onClick) onClick(e);
        requestClose();
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  footer,
  closeOnBackdrop = false,
  confirmOnClose = false,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleAttemptClose = () => {
    if (confirmOnClose) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleAttemptClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, confirmOnClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (closeOnBackdrop) {
      handleAttemptClose();
    }
  };

  return (
    <ModalContext.Provider value={{ requestClose: handleAttemptClose }}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={handleBackdropClick}
        />

        {/* Modal Dialog */}
        <div className="flex min-h-full items-center justify-center p-3 sm:p-5 text-center">
          <div
            className={`relative transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl text-left shadow-2xl border border-white/80 transition-all w-full ${maxWidth} max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={handleAttemptClose}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1 text-slate-900">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex justify-end gap-3 shrink-0">
                {typeof footer === 'function' ? footer({ requestClose: handleAttemptClose }) : footer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Exit Confirmation Dialog */}
      {showExitConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            onClose();
          }}
          title="Close Without Saving?"
          message="Are you sure you want to close? Any details you typed will be lost."
          confirmText="OK, Close"
          cancelText="Keep Editing"
          variant="danger"
        />
      )}
    </ModalContext.Provider>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="relative transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 text-left shadow-2xl transition-all w-full max-w-md my-8 animate-in fade-in zoom-in-95 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl flex-shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : variant === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{title}</h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} size="md">
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm} loading={loading} size="md">
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
