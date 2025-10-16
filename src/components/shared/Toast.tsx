import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in pointer-events-auto ${getToastColor(toast.type)}`}
          >
            <span className="text-lg font-bold">{getToastIcon(toast.type)}</span>
            <span className="text-sm">{toast.message}</span>
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

