"use client";

import React, { useEffect } from 'react';
import { KeyRound, X } from 'lucide-react';

export default function GoogleAuthModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 px-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-signin-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          aria-label="Close Google sign-in information"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B82FF]/10 text-[#686FF5]">
            <KeyRound size={26} />
          </div>
          <h2 id="google-signin-title" className="text-xl font-extrabold text-stone-900">
            Google sign-in isn&apos;t configured yet
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-stone-500">
            Use your VeritasAI username and password for now. Google sign-in will only be enabled after secure OAuth credentials are connected.
          </p>
          <button
            onClick={onClose}
            className="mt-7 w-full rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
          >
            Continue with password
          </button>
        </div>
      </div>
    </div>
  );
}
