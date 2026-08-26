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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={handleBackdropClick}
        />

        {/* Modal Dialog */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
          <div
            className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl border border-slate-200 transition-all w-full ${maxWidth} max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={handleAttemptClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 overflow-y-auto flex-1 text-slate-900">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
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
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white border border-slate-200 text-left shadow-2xl transition-all w-full max-w-md my-8 animate-in fade-in zoom-in-95 p-6"
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
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">{title}</h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
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
