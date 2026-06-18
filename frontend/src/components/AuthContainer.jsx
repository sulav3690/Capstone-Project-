"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Sparkles, Check, ArrowRight, Eye, EyeOff, CheckCircle, Shield,
  ArrowLeft, ArrowRight as ArrowRightIcon, Menu, X, Loader2, Info,
  AlertCircle, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import Footer from './Footer';
import safeLocalStorage from '../utils/safeLocalStorage';
import useFormValidation from '../hooks/useFormValidation';
import GoogleAuthModal from './GoogleAuthModal';
import ReCAPTCHA from 'react-google-recaptcha';

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
  
  // Google Auth state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form Validation Hooks
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const loginForm = useFormValidation(
    { username: '', password: '' },
    (values) => {
      const errors = {};
      if (!values.username) errors.username = "Username is required";
      if (!values.password) errors.password = "Password is required";
      return errors;
    }
  );

  const registerForm = useFormValidation(
    { username: '', password: '', fullName: '', email: '', phone: '', countryCode: '+977', role: '' },
    (values) => {
      const errors = {};
      if (!values.username || !/^[a-zA-Z0-9]+$/.test(values.username)) {
        errors.username = "Username must be alphanumeric";
      }
      if (!values.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]|.*[^a-zA-Z0-9]).{8,}$/.test(values.password)) {
        errors.password = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number/symbol";
      }
      if (!values.fullName || !/^[a-zA-Z]+\s+[a-zA-Z\s]+$/.test(values.fullName)) {
        errors.fullName = "Full Name must contain at least 2 words (letters only)";
      }
      if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Valid email is required";
      }
      if (!values.phone || !/^[0-9]{10}$/.test(values.phone)) {
        errors.phone = "Phone must be exactly 10 digits";
      }
      if (!values.role) errors.role = "Role is required";
      return errors;
    }
  );

  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState("");

  // Calculate password strength whenever register password changes
  useEffect(() => {
    if (mode === 'register') {
      const pwd = registerForm.values.password;
      let strength = 0;
      if (pwd.length > 5) strength += 25;
      if (pwd.length >= 8) strength += 25;
      if (/[A-Z]/.test(pwd)) strength += 25;
      if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) strength += 25;
      setPasswordStrength(strength);

      if (strength >= 75 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]|.*[^a-zA-Z0-9]).{8,}$/.test(pwd)) {
        setPasswordLabel("Strong");
      } else if (strength > 0) {
        setPasswordLabel("Weak");
      } else {
        setPasswordLabel("");
      }
    }
  }, [registerForm.values.password, mode]);

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

  // reCAPTCHA handler
  const handleRecaptchaChange = (value) => {
    if (value) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };
  
  const handleGoogleSuccess = () => {
    setShowGoogleModal(false);
    showToast('Signed in with Google Successfully!', 'success');
    
    setTimeout(() => {
      if (!safeLocalStorage.getItem('veritas_onboarding_completed')) {
        safeLocalStorage.setItem('veritas_onboarding_completed', 'skipped');
      }
      
      const redirectPath = safeLocalStorage.getItem('veritas_redirect_after_login');
      if (redirectPath) {
        safeLocalStorage.removeItem('veritas_redirect_after_login');
        router.push(redirectPath);
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  // Login handler
  const handleLoginSubmit = async (values) => {
    if (!isVerified) {
      showToast("Please verify you are a human first.", "error");
      return;
    }
    safeLocalStorage.removeItem('veritas_onboarding_completed');
    safeLocalStorage.setItem('veritas_display_name', values.username || 'Sulav Sharma');
    showToast(`Welcome back! Logging in...`, "success");
    await new Promise(res => setTimeout(res, 800));
    router.push('/dashboard');
  };

  // Register handler
  const handleRegisterSubmit = async (values) => {
    if (!isVerified) {
      showToast("Please verify you are a human first.", "error");
      return;
    }
    safeLocalStorage.setItem('veritas_display_name', values.fullName || values.username);
    if (values.email) safeLocalStorage.setItem('veritas_email', values.email);
    showToast("Account created successfully! Taking you to login...", "success");
    await new Promise(res => setTimeout(res, 800));
    handleSwap('/login');
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
          <div className="hidden md:flex items-center gap-8">
            <Link href="/subscription" className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              Pricing
            </Link>
            <Link href="/#faq" className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              FAQ
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="hidden md:flex text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
            Login
          </Link>
          <Link href="/dashboard" className="hidden md:flex bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all">
            Dashboard
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`fixed inset-x-0 top-[72px] bg-white border-b border-stone-200/50 shadow-xl transition-all duration-300 ease-in-out z-40 md:hidden overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-6 gap-6">
          <nav className="flex flex-col gap-4">
            <Link href="/subscription" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold text-stone-800">Pricing</Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold text-stone-800">FAQ</Link>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center text-[15px] font-bold text-stone-700 bg-stone-100 rounded-xl">
              Login
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center text-[15px] font-bold text-white bg-[#7B82FF] rounded-xl">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

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
                
                {/* Mobile Mini Showcase (Visible only on small screens) */}
                <div className="lg:hidden flex flex-col items-center gap-4 mb-2 pb-6 border-b border-stone-100">
                  <div className="bg-[#1FA463]/10 border border-[#1FA463]/25 text-[#1FA463] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wider uppercase select-none shadow-sm">
                    <Sparkles size={11} className="animate-pulse" />
                    Dynamic Analysis Active
                  </div>
                  <div className="flex items-center justify-between w-full bg-[#121824] rounded-2xl p-4 shadow-lg border border-stone-800">
                    <div className="flex flex-col gap-1">
                      <span className="text-stone-400 text-[10px] font-extrabold uppercase tracking-widest">Live Score</span>
                      <span className={`text-[15px] font-black ${currentScore > 70 ? 'text-[#1FA463]' : 'text-red-400'}`}>
                        {currentScore}% {currentStatus}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-stone-700/50"></div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-stone-400 text-[10px] font-extrabold uppercase tracking-widest">Misinfo Risk</span>
                      <span className={`text-[13px] font-bold ${currentRisk === 'Low Risk' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentRisk}
                      </span>
                    </div>
                  </div>
                </div>

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
                  <form className="w-full flex flex-col gap-4 text-left" onSubmit={loginForm.handleSubmit(handleLoginSubmit)} noValidate>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        placeholder="Enter username"
                        {...loginForm.getInputProps('username')}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${loginForm.errors.username || loginForm.getInputProps('username').className.includes('animate-input-shake') ? loginForm.getInputProps('username').className : 'border-stone-200/80'}`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Password</label>
                        <button type="button" onClick={() => showToast("Password reset demo clicked.", "success")} className="text-[11px] font-bold text-[#7B82FF] hover:underline bg-transparent border-0 cursor-pointer">Forgot password?</button>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...loginForm.getInputProps('password')}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${loginForm.errors.password || loginForm.getInputProps('password').className.includes('animate-input-shake') ? loginForm.getInputProps('password').className : 'border-stone-200/80'} pr-10`}
                        />
                        <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none bg-transparent border-0 cursor-pointer">
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Human Verify Widget (reCAPTCHA) */}
                    <div className="flex justify-center mt-2 w-full" style={{ transform: 'scale(0.85)', transformOrigin: 'center top' }}>
                      <ReCAPTCHA
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={handleRecaptchaChange}
                      />
                    </div>

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
                  <form className="w-full flex flex-col gap-4 text-left" onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} noValidate>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Username"
                          {...registerForm.getInputProps('username')}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${registerForm.errors.username || registerForm.getInputProps('username').className.includes('animate-input-shake') ? registerForm.getInputProps('username').className : 'border-stone-200/80'}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="Password"
                            {...registerForm.getInputProps('password')}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${registerForm.errors.password || registerForm.getInputProps('password').className.includes('animate-input-shake') ? registerForm.getInputProps('password').className : 'border-stone-200/80'} pr-10`}
                          />
                          <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none bg-transparent border-0 cursor-pointer">
                            {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {/* Password Strength Indicator */}
                        {registerForm.values.password && (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 animate-strength-grow ${passwordStrength < 50 ? 'bg-red-400' : passwordStrength < 100 ? 'bg-amber-400' : 'bg-[#1FA463]'}`} 
                                style={{ width: `${passwordStrength}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-bold text-right ${passwordLabel === 'Strong' ? 'text-[#1FA463]' : 'text-red-400'}`}>
                              {passwordLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter complete name"
                        {...registerForm.getInputProps('fullName')}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${registerForm.errors.fullName || registerForm.getInputProps('fullName').className.includes('animate-input-shake') ? registerForm.getInputProps('fullName').className : 'border-stone-200/80'}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          {...registerForm.getInputProps('email')}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${registerForm.errors.email || registerForm.getInputProps('email').className.includes('animate-input-shake') ? registerForm.getInputProps('email').className : 'border-stone-200/80'}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Phone <span className="text-red-500">*</span></label>
                        <div className="flex">
                          <select 
                            {...registerForm.getInputProps('countryCode')}
                            className="bg-stone-50/30 border border-r-0 border-stone-200/80 rounded-l-xl px-2 py-2.5 text-stone-700 text-[13px] font-medium focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] z-10 cursor-pointer"
                          >
                            <option value="+977">🇳🇵 +977</option>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                          </select>
                          <input
                            type="tel"
                            placeholder="98XXXXXXXX"
                            {...registerForm.getInputProps('phone')}
                            className={`w-full px-3 py-2.5 rounded-r-xl border bg-stone-50/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition font-medium text-[14px] ${registerForm.errors.phone || registerForm.getInputProps('phone').className.includes('animate-input-shake') ? registerForm.getInputProps('phone').className : 'border-stone-200/80'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Role <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          {...registerForm.getInputProps('role')}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50/30 text-stone-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition duration-300 shadow-sm cursor-pointer text-[14px] font-medium ${registerForm.errors.role || registerForm.getInputProps('role').className.includes('animate-input-shake') ? registerForm.getInputProps('role').className : 'border-stone-200/80'}`}
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

                    {/* Human Verify Widget (reCAPTCHA) */}
                    <div className="flex justify-center mt-2 w-full" style={{ transform: 'scale(0.85)', transformOrigin: 'center top' }}>
                      <ReCAPTCHA
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={handleRecaptchaChange}
                      />
                    </div>

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

                {/* ==================== OR DIVIDER ==================== */}
                <div className="flex items-center gap-4 w-full my-6">
                  <div className="h-px bg-stone-200/60 flex-1"></div>
                  <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest">or continue with</span>
                  <div className="h-px bg-stone-200/60 flex-1"></div>
                </div>

                {/* ==================== GOOGLE LOGIN ==================== */}
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 py-3 rounded-xl text-[14px] font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition duration-300 shadow-sm cursor-pointer"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                  Google
                </button>

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Website Footer */}
      <Footer className="w-full !mt-0 !rounded-b-none" />

      {/* Google Auth Modal Overlay */}
      <GoogleAuthModal 
        isOpen={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)} 
        onLoginSuccess={handleGoogleSuccess}
      />
    </div>
  );
}

