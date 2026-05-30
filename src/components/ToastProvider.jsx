"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container (Bottom-Right, Cream Sand-Beige Glass Theme) */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-[340px] w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            className="pointer-events-auto flex items-center gap-3 p-4 rounded-2xl bg-[#EBE5D8]/95 backdrop-blur-[6px] border border-stone-300/60 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.75),0_10px_25px_rgba(28,25,23,0.08)] text-stone-900 transition-all duration-300"
          >
            {toast.type === 'success' ? (
              /* Success Indicator: Green check circle (correct clicks) */
              <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Check size={13} strokeWidth={3.5} />
              </div>
            ) : (
              /* Error Indicator: Red cross circle */
              <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white shrink-0 shadow-sm">
                <X size={13} strokeWidth={3.5} />
              </div>
            )}
            
            <span className="flex-1 text-[12px] font-bold leading-snug text-stone-850 select-none text-left">
              {toast.message}
            </span>
            
            {/* Close toast button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition shrink-0 cursor-pointer"
              title="Close notification"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
