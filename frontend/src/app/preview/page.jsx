"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  Play, 
  Loader2, 
  LayoutDashboard, 
  ArrowLeft 
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function DesignPreview() {
  const router = useRouter();
  const [toasts, setToasts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skeletonStyle, setSkeletonStyle] = useState('paragraphs');

  // Trigger Toast helper
  const triggerToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 p-6 sm:p-12 relative flex flex-col justify-between">
      
      {/* Top Header & Navigation */}
      <div className="max-w-5xl mx-auto w-full mb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-stone-200/60 pb-6">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Sparkles size={16} className="text-[#1FA463]" />
              <span className="text-xs font-bold uppercase tracking-wider">Design & UX Preview Station</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-none">
              UI Enhancements Lab
            </h1>
            <p className="text-stone-500 text-sm mt-2 font-medium">
              Interact with custom warm-beige Toast notifications and Loading skeletons matching the profile card theme.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl shadow-sm transition active:scale-98 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Preview Playground Grid */}
      <div className="max-w-5xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Left Column: Toast Notification Station */}
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-white border border-stone-200/50 shadow-soft p-6 sm:p-8 rounded-3xl">
            <h2 className="text-lg font-bold text-stone-900 mb-1">1. Toast Notifications</h2>
            <p className="text-stone-400 text-xs font-medium mb-6">
              Toasts appear at the bottom-right corner. They match the sandy beige glass style (`bg-[#EBE5D8]/95`) of the user card, featuring detailed status icons and high readability.
            </p>

            {/* Test Action Buttons */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Success Scenarios (Green Accent / Check Circle)</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => triggerToast("Changes saved successfully!", "success")}
                    className="px-4 py-2 bg-stone-100 hover:bg-[#22C55E]/10 hover:text-[#22C55E] text-stone-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-[#22C55E]/30 transition active:scale-98 cursor-pointer"
                  >
                    Trigger Save Success
                  </button>
                  <button
                    onClick={() => triggerToast("File upload complete! 340 words processed.", "success")}
                    className="px-4 py-2 bg-stone-100 hover:bg-[#22C55E]/10 hover:text-[#22C55E] text-stone-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-[#22C55E]/30 transition active:scale-98 cursor-pointer"
                  >
                    Trigger File Upload Success
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Failure Scenarios (Red Accent / Cross Circle / Explicit Text)</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => triggerToast("ERROR: Please enter at least 20 characters.", "error")}
                    className="px-4 py-2 bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-red-200 transition active:scale-98 cursor-pointer"
                  >
                    Trigger Validation Error
                  </button>
                  <button
                    onClick={() => triggerToast("FAILED: Password mismatch. Please try again.", "error")}
                    className="px-4 py-2 bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-red-200 transition active:scale-98 cursor-pointer"
                  >
                    Trigger Security Failure
                  </button>
                </div>
              </div>
            </div>

            {/* Design Spec Box */}
            <div className="mt-8 pt-6 border-t border-stone-100 bg-stone-50/50 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">Design Specifications</span>
              <ul className="text-stone-600 text-xs space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#1FA463] font-bold">✓</span>
                  <span><strong>Color Themes</strong>: Green status indicators indicate correct actions/saves. Red status indicators specify errors/failures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1FA463] font-bold">✓</span>
                  <span><strong>Fail Text Readability</strong>: To ensure high clarity, fail/error messages are explicitly prefixed with bold capitals like <strong>FAILED</strong> or <strong>ERROR</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1FA463] font-bold">✓</span>
                  <span><strong>Glass Reflection</strong>: Inset shadows (`shadow-[inset_2px_2px_8px_rgba(255,255,255,0.75)]`) mimic a glossy physical glass lens reflection.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Right Column: Loading Skeleton Station */}
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-white border border-stone-200/50 shadow-soft p-6 sm:p-8 rounded-3xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-stone-900">2. Loading Skeleton</h2>
              
              {/* Skeleton Style Selector */}
              <select
                value={skeletonStyle}
                onChange={(e) => setSkeletonStyle(e.target.value)}
                className="text-[11px] font-bold text-stone-600 border border-stone-200 rounded-lg p-1 bg-stone-50 focus:outline-none"
              >
                <option value="paragraphs">Paragraph Pulse</option>
                <option value="report">Analytic Report Skeleton</option>
              </select>
            </div>
            
            <p className="text-stone-400 text-xs font-medium mb-6">
              When analysis triggers, a pulsing warm sand-beige skeleton animates in place of the text editor container, instead of using intrusive fullscreen loaders.
            </p>

            {/* Toggle Switch */}
            <div className="mb-6 flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isAnalyzing ? 'bg-[#1FA463] animate-ping' : 'bg-stone-300'}`}></div>
                <span className="text-xs font-bold text-stone-700">Toggle Analyzing State:</span>
              </div>
              <button
                onClick={() => setIsAnalyzing(!isAnalyzing)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer select-none ${
                  isAnalyzing 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                    : 'bg-[#1FA463] text-white hover:bg-[#178a52]'
                }`}
              >
                {isAnalyzing ? 'Stop Analysis' : 'Start Mock Analysis'}
              </button>
            </div>

            {/* Mock Editor Workspace Box */}
            <div className="flex-1 border border-stone-200/60 rounded-2xl p-5 bg-stone-50/20 min-h-[220px] flex flex-col justify-between">
              
              {isAnalyzing ? (
                /* Toggleable Skeleton layouts */
                skeletonStyle === 'paragraphs' ? (
                  /* Standard Paragraph Lines Pulse */
                  <div className="flex-1 flex flex-col gap-4 animate-pulse pt-2 select-none pointer-events-none">
                    <div className="h-6 w-1/4 bg-[#EBE5D8]/70 rounded-lg"></div>
                    <div className="space-y-3.5 pt-4">
                      <div className="h-4 bg-[#EBE5D8]/50 rounded-md w-full"></div>
                      <div className="h-4 bg-[#EBE5D8]/50 rounded-md w-11/12"></div>
                      <div className="h-4 bg-[#EBE5D8]/50 rounded-md w-5/6"></div>
                      <div className="h-4 bg-[#EBE5D8]/50 rounded-md w-full"></div>
                      <div className="h-4 bg-[#EBE5D8]/50 rounded-md w-9/12"></div>
                    </div>
                  </div>
                ) : (
                  /* Complex Analytic Report Layout Pulse */
                  <div className="flex-1 flex flex-col gap-5 animate-pulse pt-2 select-none pointer-events-none">
                    <div className="flex justify-between items-center">
                      <div className="h-7 w-1/3 bg-[#EBE5D8]/70 rounded-lg"></div>
                      <div className="h-5 w-1/6 bg-[#EBE5D8]/50 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="h-16 bg-[#EBE5D8]/40 rounded-xl"></div>
                      <div className="h-16 bg-[#EBE5D8]/40 rounded-xl"></div>
                      <div className="h-16 bg-[#EBE5D8]/40 rounded-xl"></div>
                    </div>
                    <div className="space-y-2.5 pt-2">
                      <div className="h-3.5 bg-[#EBE5D8]/50 rounded w-full"></div>
                      <div className="h-3.5 bg-[#EBE5D8]/50 rounded w-10/12"></div>
                    </div>
                  </div>
                )
              ) : (
                /* Mock Normal Textarea */
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="text-stone-400 text-sm italic select-none">
                    Sample content typed in the editor. Toggle "Start Mock Analysis" above to see the loading skeleton pulse.
                  </div>
                  <div className="pt-8 text-stone-600 text-xs font-semibold select-none">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Embedded Informative Footer */}
      <div className="max-w-5xl mx-auto w-full border-t border-stone-200/60 pt-6 text-center text-stone-400 text-[11px] font-semibold">
        VeritasAI Design Preview Lab &copy; 2026. Custom layout built with Next.js &amp; Tailwind CSS v4 theme variables.
      </div>

      {/* Toast Notification Container (Bottom-Right, Cream Sand-Beige Glass Theme) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[340px] w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3.5 p-4 rounded-2xl bg-[#EBE5D8]/95 backdrop-blur-[6px] border border-stone-300/60 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.75),0_10px_25px_rgba(28,25,23,0.08)] text-stone-900 transition-all duration-300 transform translate-y-0 opacity-100"
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
            
            <span className="flex-1 text-[12px] font-bold leading-snug text-stone-800 select-none text-left">
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

    </div>
  );
}
