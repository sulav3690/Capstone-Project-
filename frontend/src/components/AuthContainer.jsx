"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Sparkles, Check, 
  ArrowRight, ArrowLeft, Loader2, Info,
  AlertCircle, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import Footer from './Footer';

const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch { /* ignore */ }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch { /* ignore */ }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  }
};

const DEMO_SENTENCES = [
  { text: "Research shows that regular physical activity boosts brain performance long-term.", type: "human", score: 98 },
  { text: "Staying active strengthens memory and supports the brain's ability to grow.", type: "human", score: 97 },
  { text: "It meaningfully lowers the chances of cognitive decline over the years.", type: "human", score: 97 },
  { text: "The algorithm analyzed the textual context to predict factual accuracy.", type: "ai", score: 42, misinfo: true },
  { text: "On top of that, even light workouts have been found to ease feelings of stress and low mood.", type: "human", score: 95 },
  { text: "Experts suggest getting around two and a half hours of moderate cardio each week for the best results.", type: "human", score: 97 },
];

export default function AuthContainer({ mode }) {
  const router = useRouter();
  const { showToast } = useToast();

  // Navigation Swapping state
  const [isSwapping, setIsSwapping] = useState(false);

  // Verification checkbox state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Form states
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [registerCreds, setRegisterCreds] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  // Animated Showcase States
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [highlightedSentences, setHighlightedSentences] = useState([]);
  const [currentScore, setCurrentScore] = useState(100);
  const [currentStatus, setCurrentStatus] = useState("Scan Ready");
  const [currentRisk, setCurrentRisk] = useState("Low");

  // On mount, handle initial slide-in entry
  useEffect(() => {
    setIsSwapping(false);
  }, [mode]);

  // Swapping route handler (illusion of smooth slides)
  const handleSwap = (targetPath) => {
    setIsSwapping(true);
    setTimeout(() => {
      router.push(targetPath);
    }, 450); // Match CSS transition timing
  };

  // Mock Human Verification handler
  const handleVerifyCheckbox = () => {
    if (isVerified || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showToast("Human status verified successfully!", "success");
    }, 1200);
  };

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      showToast("Please verify you are a human first.", "error");
      return;
    }
    safeLocalStorage.removeItem('veritas_onboarding_completed');
    showToast(`Welcome back! Logging in...`, "success");
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  // Register handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      showToast("Please verify you are a human first.", "error");
      return;
    }
    showToast("Account created successfully! Taking you to login...", "success");
    setTimeout(() => {
      handleSwap('/login');
    }, 800);
  };

  // Typing animation for StealthWriter Showcase
  useEffect(() => {
    let timer;
    const sentence = DEMO_SENTENCES[currentSentenceIndex];
    let charIndex = 0;

    // Initial delay before typing next sentence
    timer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < sentence.text.length) {
          setDisplayedText((prev) => prev + sentence.text.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);

          // Update Score & Highlights
          setTimeout(() => {
            setHighlightedSentences((prev) => [
              ...prev,
              { text: sentence.text, type: sentence.type }
            ]);
            setDisplayedText("");
            setCurrentScore(sentence.score);
            setCurrentStatus(sentence.type === "human" ? "Looks Human" : "AI Content Detected");
            setCurrentRisk(sentence.misinfo ? "High Risk" : "Low Risk");

            // Advance index or loop back
            setTimeout(() => {
              if (currentSentenceIndex < DEMO_SENTENCES.length - 1) {
                setCurrentSentenceIndex((prev) => prev + 1);
              } else {
                // Loop reset
                setHighlightedSentences([]);
                setCurrentSentenceIndex(0);
                setCurrentScore(100);
                setCurrentStatus("Scan Ready");
                setCurrentRisk("Low");
              }
            }, 1800);
          }, 400);
        }
      }, 30); // Typing speed
    }, 500);

    return () => clearTimeout(timer);
  }, [currentSentenceIndex]);

  const showcaseAnimClass = mode === 'login'
    ? (isSwapping ? 'lg:animate-slide-out-right' : 'lg:animate-slide-in-right')
    : (isSwapping ? 'lg:animate-slide-out-left' : 'lg:animate-slide-in-left');

  const formAnimClass = mode === 'login'
    ? (isSwapping ? 'lg:animate-slide-out-left' : 'lg:animate-slide-in-left')
    : (isSwapping ? 'lg:animate-slide-out-right' : 'lg:animate-slide-in-right');

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Website Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 sm:py-5 bg-[#FDFBF7]/85 backdrop-blur-md border-b border-stone-200/40 shadow-[0_2px_20px_rgba(28,25,23,0.02)] transition-all">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all">
            <img 
              src="/Headerfinal.webp" 
              alt="VeritasAI" 
              className="h-10 w-auto object-contain" 
            />
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/subscription" className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              Pricing
            </Link>
            <Link href="/#faq" className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              FAQ
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
            Login
          </Link>
          <Link href="/dashboard" className="bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content (Centered Card) */}
      <main className="flex-1 w-full flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 relative z-10">
        <div className="w-full max-w-[1100px] bg-white border border-stone-200/50 rounded-[32px] shadow-[0_25px_60px_rgba(28,25,23,0.03)] overflow-hidden min-h-[640px] flex flex-col lg:flex-row relative">
          
          {/* 50/50 Sliding Container */}
          <div 
            className={`w-full flex flex-col lg:flex-row transition-all duration-500 ease-in-out ${
              isSwapping 
                ? 'opacity-30 scale-[0.98]' 
                : 'opacity-100 scale-100'
            } ${
              mode === 'register' ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            
            {/* ==================== 1. DYNAMIC SHOWCASE SIDE (DARK PANEL) ==================== */}
            <div className={`hidden lg:flex flex-1 bg-[#090D16] text-[#F8FAFC] relative flex-col items-center justify-center p-12 overflow-hidden select-none transition-all duration-500 ${showcaseAnimClass}`}>
              
              {/* Neon gradient background details */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#1FA463]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7B82FF]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 w-full max-w-[500px] flex flex-col gap-8">
                
                {/* Tagline */}
                <div className="self-start bg-[#1FA463]/10 border border-[#1FA463]/25 text-[#1FA463] text-[11px] font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 tracking-wider uppercase select-none shadow-sm">
                  <Sparkles size={13} className="animate-pulse" />
                  Dynamic Content Analysis
                </div>

                {/* Simulated Live Scan Screen (StealthWriter Style) */}
                <div className="bg-[#121824]/90 border border-stone-800/80 rounded-[28px] p-6 shadow-2xl flex flex-col gap-6 backdrop-blur-sm">
                  
                  {/* Header block */}
                  <div className="flex justify-between items-center border-b border-stone-800/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-stone-500 text-xs font-bold font-mono tracking-widest uppercase">Deep Scan v2.5</span>
                  </div>

                  {/* Text Scanning Window */}
                  <div className="min-h-[160px] text-left text-[14.5px] leading-relaxed select-none font-medium flex flex-col justify-start gap-3.5">
                    
                    {/* Log of scanned/highlighted sentences */}
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                      {highlightedSentences.map((h, i) => (
                        <span 
                          key={i} 
                          className={`px-1 rounded-md transition-all duration-300 ${
                            h.type === 'human' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 underline decoration-emerald-500/40 decoration-dotted underline-offset-4' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20 underline decoration-red-500/40 decoration-solid underline-offset-4'
                          }`}
                        >
                          {h.text}
                        </span>
                      ))}
                      
                      {/* Current typing sentence */}
                      {displayedText && (
                        <span className="text-stone-300 font-normal">
                          {displayedText}
                          <span className="w-1.5 h-4 bg-emerald-400 inline-block animate-pulse ml-0.5" />
                        </span>
                      )}
                    </div>

                    {!displayedText && highlightedSentences.length === 0 && (
                      <div className="text-stone-500 text-xs italic">Initializing text editor simulator...</div>
                    )}
                  </div>

                  {/* Status & Gauge Block */}
                  <div className="grid grid-cols-2 gap-4 border-t border-stone-800/60 pt-5 items-center">
                    
                    {/* Concentric Circle Gauge (No overlap/displacement border bug) */}
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center relative shadow-sm shrink-0 bg-transparent">
                        <span className={`text-[15px] font-black tracking-tight z-10 ${
                          currentScore > 70 ? 'text-[#1FA463]' : 'text-red-400'
                        }`}>
                          {currentScore}%
                        </span>
                        {/* SVG circular concentric track and progress indicator */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="26" 
                            fill="none" 
                            stroke="#1F2937" 
                            strokeWidth="6"
                          />
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="26" 
                            fill="none" 
                            stroke={currentScore > 70 ? '#1FA463' : '#F87171'} 
                            strokeWidth="6"
                            strokeDasharray="163.36"
                            strokeDashoffset={163.36 - (163.36 * currentScore) / 100}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Score</span>
                        <span className={`text-[13px] font-extrabold truncate uppercase ${
                          currentScore > 70 ? 'text-[#1FA463]' : 'text-red-400'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Risk Indicator */}
                    <div className="bg-[#182030] rounded-2xl p-3 border border-stone-800/40 text-left flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        currentRisk === 'Low Risk' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {currentRisk === 'Low Risk' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest">Misinfo Risk</span>
                        <span className="text-[13px] font-bold text-stone-200 truncate">{currentRisk}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Bottom text explanation */}
                <div className="text-left flex flex-col gap-1.5 px-2">
                  <h3 className="text-lg font-bold text-stone-100 tracking-tight">AI Content &amp; Factual Verifier</h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    VeritasAI runs semantic highlights and lexical entropy scoring in real-time, verifying structural consistency and flags unverified clickbait.
                  </p>
                </div>

              </div>

            </div>

            {/* ==================== 2. FORM SIDE (LIGHT PANEL - NO NESTED FLOATING CARD) ==================== */}
            <div className={`flex-1 flex items-center justify-center p-6 sm:p-12 transition-all duration-500 ${formAnimClass}`}>
              
              <div className="w-full max-w-md flex flex-col gap-6 relative">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="bg-gradient-to-br from-[#1FA463]/10 to-transparent p-3 rounded-2xl border border-[#1FA463]/10 mb-1 select-none">
                    <ShieldCheck className="text-[#1FA463]" size={32} strokeWidth={2.5} />
                  </div>
                  <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-stone-400 text-xs font-semibold">
                    {mode === 'login' ? 'Access your VeritasAI workspace' : 'Get started with an administrator account'}
                  </p>
                </div>

                {/* ==================== A. LOGIN FORM ==================== */}
                {mode === 'login' && (
                  <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleLoginSubmit}>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter username"
                        value={loginCreds.username}
                        onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Password</label>
                        <button type="button" onClick={() => showToast("Password reset demo clicked.", "success")} className="text-[11px] font-bold text-[#7B82FF] hover:underline bg-transparent border-0 cursor-pointer">Forgot password?</button>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="Enter password"
                        value={loginCreds.password}
                        onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                      />
                    </div>

                    {/* Human Verify Widget */}
                    <VerifyCheckboxWidget 
                      isVerifying={isVerifying} 
                      isVerified={isVerified} 
                      onVerify={handleVerifyCheckbox} 
                    />

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={!isVerified}
                      className={`w-full py-3 rounded-xl text-[14px] font-extrabold transition-all duration-300 shadow-md flex items-center justify-center gap-2 select-none border-0 ${
                        isVerified 
                          ? 'bg-[#1FA463] hover:bg-[#178a52] text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-98 active:translate-y-0 cursor-pointer' 
                          : 'bg-stone-100 text-stone-400 border border-stone-200/40 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Sign In
                      <ArrowRight size={16} />
                    </button>

                    {/* Swap Link */}
                    <p className="text-stone-400 text-center text-xs font-semibold mt-2">
                      New to VeritasAI?{' '}
                      <button 
                        type="button" 
                        onClick={() => handleSwap('/register')}
                        className="text-[#7B82FF] font-bold hover:underline select-none cursor-pointer bg-transparent border-0"
                      >
                        Create an account
                      </button>
                    </p>
                  </form>
                )}

                {/* ==================== B. REGISTER FORM ==================== */}
                {mode === 'register' && (
                  <form className="w-full flex flex-col gap-4 text-left" onSubmit={handleRegisterSubmit}>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Username"
                          value={registerCreds.username}
                          onChange={(e) => setRegisterCreds({ ...registerCreds, username: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          required
                          placeholder="Password"
                          value={registerCreds.password}
                          onChange={(e) => setRegisterCreds({ ...registerCreds, password: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Enter complete name"
                        value={registerCreds.fullName}
                        onChange={(e) => setRegisterCreds({ ...registerCreds, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={registerCreds.email}
                          onChange={(e) => setRegisterCreds({ ...registerCreds, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Phone <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          required
                          placeholder="+977-XXXXXXXX"
                          value={registerCreds.phone}
                          onChange={(e) => setRegisterCreds({ ...registerCreds, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Select Your Role <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          required
                          value={registerCreds.role}
                          onChange={(e) => setRegisterCreds({ ...registerCreds, role: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/30 text-stone-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition duration-300 shadow-sm cursor-pointer text-[14px] font-medium"
                        >
                          <option value="" disabled>Choose account type</option>
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-stone-400 text-xs">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Human Verify Widget */}
                    <VerifyCheckboxWidget 
                      isVerifying={isVerifying} 
                      isVerified={isVerified} 
                      onVerify={handleVerifyCheckbox} 
                    />

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={!isVerified}
                      className={`w-full py-3 rounded-xl text-[14px] font-extrabold transition-all duration-300 shadow-md flex items-center justify-center gap-2 select-none border-0 ${
                        isVerified 
                          ? 'bg-[#1FA463] hover:bg-[#178a52] text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-98 active:translate-y-0 cursor-pointer' 
                          : 'bg-stone-100 text-stone-400 border border-stone-200/40 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Create Account
                      <ArrowRight size={16} />
                    </button>

                    {/* Swap Link */}
                    <p className="text-stone-400 text-center text-xs font-semibold mt-2">
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => handleSwap('/login')}
                        className="text-[#7B82FF] font-bold hover:underline select-none cursor-pointer bg-transparent border-0"
                      >
                        Sign In
                      </button>
                    </p>
                  </form>
                )}

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Website Footer */}
      <Footer className="w-full !mt-0 !rounded-b-none" />
    </div>
  );
}

// ==================== HELPER SUB-COMPONENT: CAPTCHA CHECKBOX ====================
function VerifyCheckboxWidget({ isVerifying, isVerified, onVerify }) {
  return (
    <div 
      onClick={onVerify}
      className={`border rounded-2xl p-4.5 flex items-center justify-between transition-all duration-300 mt-2 ${
        isVerified 
          ? 'bg-emerald-50/20 border-emerald-500/30' 
          : 'bg-[#FCFAF7] border-stone-200/80 hover:border-stone-300 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3.5 select-none">
        
        {/* Mock Checkbox Button */}
        <div className="w-[22px] h-[22px] rounded-md border-2 border-stone-300 flex items-center justify-center bg-white transition select-none relative shrink-0">
          {isVerifying && (
            <Loader2 className="text-[#1FA463] animate-spin" size={14} strokeWidth={3} />
          )}
          {isVerified && (
            <div className="absolute inset-0 bg-[#1FA463] rounded-sm flex items-center justify-center">
              <Check className="text-white" size={15} strokeWidth={3.5} />
            </div>
          )}
        </div>

        <span className="text-[13px] font-bold text-stone-700">Verify you are human</span>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <div className="flex items-center gap-1">
          <ShieldCheck size={16} className="text-[#1FA463]" strokeWidth={2.5} />
          <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest leading-none">Veritas</span>
        </div>
        <span className="text-[9px] font-semibold text-stone-400 leading-none mt-0.5">Mock Security</span>
      </div>
    </div>
  );
}
