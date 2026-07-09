import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import safeLocalStorage from '../utils/safeLocalStorage';

export default function GoogleAuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [loadingEmail, setLoadingEmail] = useState(null);
  const loginTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setLoadingEmail(null);
    }

    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const accounts = [
    { name: "Sulav Sharma", email: "sulav2080-0306@iimscollege.edu.np", avatar: "S" },
    { name: "John Doe", email: "john.doe@example.com", avatar: "J" },
  ];

  const handleAccountSelect = (account) => {
    setLoadingEmail(account.email);
    if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);

    loginTimeoutRef.current = setTimeout(() => {
      // Simulate OAuth success
      safeLocalStorage.setItem('veritas_display_name', account.name);
      safeLocalStorage.setItem('veritas_email', account.email);
      onLoginSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-[400px] rounded-[24px] shadow-2xl overflow-hidden animate-slide-up relative">
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b border-stone-100 relative">
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            className="h-6 w-auto" 
            alt="Google logo" 
          />
          <button 
            onClick={onClose}
            className="absolute right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-1">Sign in</h2>
          <p className="text-[14px] text-stone-500 font-medium mb-6">to continue to VeritasAI</p>

          {/* Account List */}
          <div className="flex flex-col gap-2">
            {accounts.map((account, i) => (
              <button
                key={i}
                onClick={() => handleAccountSelect(account)}
                disabled={loadingEmail !== null}
                className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 border border-transparent hover:border-stone-200 rounded-2xl transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1FA463] text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                  {account.avatar}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-[14px] text-stone-800 truncate">{account.name}</span>
                  <span className="text-[12px] text-stone-500 font-medium truncate">{account.email}</span>
                </div>
                {loadingEmail === account.email && (
                  <div className="ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA463] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA463] animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA463] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                )}
              </button>
            ))}

            <button 
              disabled={loadingEmail !== null}
              className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 border border-transparent hover:border-stone-200 rounded-2xl transition-all cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-full border border-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="font-bold text-[14px] text-stone-700">Use another account</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50/80 px-6 py-4 flex justify-between items-center text-[11px] font-bold text-stone-400 border-t border-stone-100">
          <span>English (United States)</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-stone-600 transition-colors">Help</a>
            <a href="#" className="hover:text-stone-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-stone-600 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}
