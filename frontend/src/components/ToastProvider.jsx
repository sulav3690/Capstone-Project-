"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Check, Info, X } from 'lucide-react';

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
  const nextIdRef = useRef(0);
  const timersRef = useRef(new Map());

  const showToast = useCallback((message, type = 'success') => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4.5 seconds
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, 4500);
    timersRef.current.set(id, timer);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current.get(id));
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Notification Container (Bottom-Right, Cream Sand-Beige Glass Theme) */}
      <div
        className="fixed inset-x-4 bottom-4 z-[9999] flex flex-col items-end gap-3 pointer-events-none sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-[340px]"
        aria-live="polite"
        aria-atomic="false"
      >
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
            ) : toast.type === 'info' ? (
              <div className="w-6 h-6 rounded-full bg-[#7B82FF] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Info size={13} strokeWidth={3} />
              </div>
            ) : (
              /* Error Indicator: Red cross circle */
              <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white shrink-0 shadow-sm">
                <X size={13} strokeWidth={3.5} />
              </div>
            )}
            
            <span className="flex-1 text-[12px] font-bold leading-snug text-stone-800 select-none text-left">
              {toast.message}
            </span>
            
            {/* Close toast button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition shrink-0 cursor-pointer"
              title="Close notification"
              aria-label="Close notification"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
