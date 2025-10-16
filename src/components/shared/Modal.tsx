import React, { ReactNode, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-300 mb-6">
          {children}
        </div>
        {actions && (
          <div className="flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/**
 * Hook for confirmation dialogs (replaces browser confirm())
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (
    title: string, 
    message: string,
    options: { confirmText?: string; cancelText?: string; destructive?: boolean } = {}
  ): Promise<boolean> => {
    return new Promise(resolve => {
      setConfig({
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        destructive: options.destructive || false
      });
      setResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
    setConfig(null);
    setResolver(null);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
    setConfig(null);
    setResolver(null);
  };

  const ConfirmModal = config ? (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={config.title}
      actions={
        <>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
          >
            {config.cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              config.destructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {config.confirmText}
          </button>
        </>
      }
    >
      {config.message}
    </Modal>
  ) : null;

  return { confirm, ConfirmModal };
}

