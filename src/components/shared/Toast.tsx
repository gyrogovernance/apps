import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Z_INDEX, UI_CONSTANTS } from '../../lib/constants';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  show: (message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, type: Toast['type']) => {
    const id = Date.now() + Math.random(); // Ensure uniqueness
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Errors persist until manually dismissed, success/info auto-dismiss after 3s
    if (type !== 'error') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
    // Error toasts stay until user clicks X
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 dark:bg-green-700';
      case 'error':
        return 'bg-red-600 dark:bg-red-700';
      case 'info':
        return 'bg-blue-600 dark:bg-blue-700';
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      
      {/* Toast Container - Top Center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 space-y-2 pointer-events-none" style={{ zIndex: Z_INDEX.TOAST }} role="status" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in pointer-events-auto ${getToastColor(toast.type)} max-w-lg`}
          >
            <span className="text-lg font-bold">{getToastIcon(toast.type)}</span>
            <span className="text-sm flex-1">{toast.message}</span>
            {/* Close button for errors (persistent) or any toast on hover */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-2 hover:bg-white/20 rounded p-1 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

