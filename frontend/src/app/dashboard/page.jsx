"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  AlertCircle,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
  CreditCard,
  User,
  ChevronRight,
  Clock,
  Trash2,
  FileText,
  X,
  TrendingUp
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import safeLocalStorage from '../../utils/safeLocalStorage';
import { analyzeText, buildHighlightedSegments } from '../../utils/analyzeText';
import api from '../../utils/api';

const DEFAULT_SUBSCRIPTION_ACCESS = {
  plan: 'Free',
  word_limit: 10000,
  detection_limit: 50,
  detections_used: 0,
  detections_remaining: 50,
  features: {
    ai_detector: true,
    deep_scan: false,
    advanced_misinformation: false,
    detailed_reports: false,
  },
  response_tier: 'standard',
  support_tier: 'community',
};

const SUPPORTED_DOCUMENT_ACCEPT = [
  '.pdf',
  '.docx',
  '.pptx',
  '.xlsx',
  '.ods',
  '.odt',
  '.odp',
  '.tex',
  '.latex',
  '.txt',
  '.text',
  '.md',
  '.csv',
  '.tsv',
  '.rtf',
  '.html',
  '.htm',
  '.json',
  '.xml',
].join(',');

const riskTier = (verdict) => {
  const value = String(verdict || '').toLowerCase();
  if (value.includes('high')) return 'high';
  if (value.includes('moderate') || value.includes('medium')) return 'medium';
  return 'low';
};

const PLAN_ACCESS_FALLBACKS = {
  Free: DEFAULT_SUBSCRIPTION_ACCESS,
  Monthly: {
    plan: 'Monthly',
    word_limit: 50000,
    detection_limit: 500,
    detections_used: 0,
    detections_remaining: 500,
    features: {
      ai_detector: true,
      deep_scan: true,
      advanced_misinformation: true,
      detailed_reports: false,
    },
    response_tier: 'fast',
    support_tier: 'standard',
  },
  Yearly: {
    plan: 'Yearly',
    word_limit: 500000,
    detection_limit: null,
    detections_used: 0,
    detections_remaining: null,
    features: {
      ai_detector: true,
      deep_scan: true,
      advanced_misinformation: true,
      detailed_reports: true,
    },
    response_tier: 'fastest',
    support_tier: 'priority',
  },
};

function getFallbackSubscriptionAccess(plan) {
  return PLAN_ACCESS_FALLBACKS[plan] || DEFAULT_SUBSCRIPTION_ACCESS;
}

// ─── Analysis engine and localStorage are now imported from shared utils ──────

const Detector = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiDetection, setAiDetection] = useState(true);
  const [misinformation, setMisinformation] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const { showToast } = useToast();

  // App features state
  const [subscriptionPlan, setSubscriptionPlan] = useState(() => {
    if (typeof window !== 'undefined') {
      return safeLocalStorage.getItem('veritas_subscription_plan') || 'Free';
    }
    return 'Free';
  });
  const [subscriptionAccess, setSubscriptionAccess] = useState(DEFAULT_SUBSCRIPTION_ACCESS);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [segments, setSegments] = useState([]);

  // Account subview states
  const [accountSubTab, setAccountSubTab] = useState('general');
  const [displayName, setDisplayName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [scans, setScans] = useState([]);
  const maxWords = subscriptionAccess.word_limit || DEFAULT_SUBSCRIPTION_ACCESS.word_limit;
  const detectionLimitReached = subscriptionAccess.detections_remaining === 0;
  const hasDeepScan = Boolean(subscriptionAccess.features?.deep_scan);
  const hasAdvancedMisinformation = Boolean(
    subscriptionAccess.features?.advanced_misinformation
  );
  const hasDetailedReports = Boolean(subscriptionAccess.features?.detailed_reports);

  const handleLoadScan = (scan) => {
    setActiveTab('detector');
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerText = scan.text;
      }
      setIsEmpty(false);
      
      const words = scan.text.trim().split(/\s+/).length;
      setWordCount(words);
      
      setIsAnalyzing(true);
      setShowResults(true);
      setError('');
      
      setTimeout(() => {
        const analysis = analyzeText(scan.text);
        analysis.aiPct = scan.score;
        analysis.humanPct = 100 - scan.score;
        analysis.authenticity = 100 - scan.score;
        
        setResultsData(analysis);
        setSegments(buildHighlightedSegments(scan.text, scan.score));
        setIsAnalyzing(false);
        showToast(`Loaded results for ${scan.filename}`, 'success');
        
        setTimeout(() => {
          smoothScrollTo(resultsRef.current, 700);
        }, 100);
      }, 800);
    }, 50);
    
    setIsHistoryOpen(false);
  };

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const resultsRef = useRef(null);
  const analysisControllerRef = useRef(null);

  useEffect(() => {
    return () => analysisControllerRef.current?.abort();
  }, []);

  const handleSubscribe = (planName) => {
    router.push(`/payment?plan=${planName === 'Yearly' ? 'yearly' : 'monthly'}`);
  };

  // Read subscription plan and user profile from localStorage on mount
  const loadHistory = async () => {
    try {
      const res = await api.get('/api/analyze/history/');
      if (res.status === 'success' && res.history) {
        const formattedScans = res.history.map(item => {
          const date = new Date(item.created_at);
          const timeStr = isNaN(date.getTime()) ? 'recently' : date.toLocaleString();
          const wordList = item.input_text.trim().split(/\s+/);
          const name = wordList.slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '') + '.txt';
          return {
            id: item.id,
            filename: name || 'scan_result.txt',
            score: Math.round(item.ai_score),
            time: timeStr,
            text: item.input_text,
            misinfoRisk: item.detailed_breakdown?.misinfo_details?.verdict || 'Low Risk',
            details: item.detailed_breakdown
          };
        });
        setScans(formattedScans);
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
    }
  };

  useEffect(() => {
    const savedPlan = safeLocalStorage.getItem('veritas_subscription_plan');
    if (savedPlan) {
      setSubscriptionPlan(savedPlan);
    }
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    if (savedName) {
      setDisplayName(savedName);
    }
    const savedEmail = safeLocalStorage.getItem('veritas_email');
    if (savedEmail) {
      setEmailAddress(savedEmail);
    }
  }, []);

  // Onboarding survey states
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('/api/auth/me/');
        if (res.status === 'success' && res.user) {
          if (res.user.onboarding_completed === false) {
            router.replace('/survey');
            return;
          }

          const verifiedPlan = res.user.subscription_plan || 'Free';
          const serverAccess = res.user.subscription_access;
          const verifiedAccess = serverAccess?.plan === verifiedPlan
            ? serverAccess
            : getFallbackSubscriptionAccess(verifiedPlan);

          setDisplayName(res.user.username);
          setEmailAddress(res.user.email);
          setSubscriptionPlan(verifiedPlan);
          setSubscriptionAccess(verifiedAccess);
          safeLocalStorage.setItem('veritas_display_name', res.user.username);
          safeLocalStorage.setItem('veritas_email', res.user.email);
          safeLocalStorage.setItem('veritas_subscription_plan', res.user.subscription_plan || 'Free');
          if (res.user.is_admin) {
            safeLocalStorage.setItem('veritas_is_admin', 'true');
          } else {
            safeLocalStorage.removeItem('veritas_is_admin');
          }
          await loadHistory();
          setIsMounted(true);
        } else {
          router.replace('/login');
        }
      } catch {
        safeLocalStorage.removeItem('veritas_display_name');
        safeLocalStorage.removeItem('veritas_email');
        safeLocalStorage.removeItem('veritas_is_admin');
        router.replace('/login');
      }
    };

    checkUser();

    // Load active tab from URL query parameters if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [router]);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      showToast('Saving profile updates...', 'info');
      const res = await api.put('/api/auth/me/', {
        username: displayName,
        email: emailAddress
      });
      if (res.status === 'success') {
        safeLocalStorage.setItem('veritas_display_name', res.user.username);
        safeLocalStorage.setItem('veritas_email', res.user.email);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(res.message || 'Profile update failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Connection to update server failed.', 'error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }
    try {
      await api.post('/api/auth/password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated. Please sign in again.', 'success');
      router.push('/login');
    } catch (err) {
      showToast(err.message || 'Password update failed.', 'error');
    }
  };

  const smoothScrollTo = (targetElement, duration = 800) => {
    if (!targetElement) return;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 40;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(Math.min(timeElapsed / duration, 1));
      window.scrollTo(0, startPosition + distance * run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const checkAndResetResults = (textVal) => {
    const isTextEmpty = textVal.trim() === '';
    setIsEmpty(isTextEmpty);
    const words = isTextEmpty ? 0 : textVal.trim().split(/\s+/).length;
    setWordCount(words);
    if (isTextEmpty) {
      setShowResults(false);
      setResultsData(null);
    }
  };

  const handleInput = (e) => {
    setError('');
    const textVal = e.target.innerText || '';
    checkAndResetResults(textVal);
  };

  const handleAnalyze = async () => {
    const plainText = editorRef.current ? editorRef.current.innerText || '' : '';
    if (detectionLimitReached) {
      const limitMessage = `You have used all ${subscriptionAccess.detection_limit?.toLocaleString()} detections included with your ${subscriptionPlan} plan.`;
      setError(limitMessage);
      showToast(limitMessage, 'error');
      return;
    }
    if (plainText.trim().length < 20) {
      setError('Please enter at least 20 characters to analyze.');
      showToast('Please enter at least 20 characters to analyze.', 'error');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setShowResults(true);
    analysisControllerRef.current?.abort();
    const controller = new AbortController();
    analysisControllerRef.current = controller;

    // Smoothly scroll to the results ref area using custom ease function
    setTimeout(() => {
      smoothScrollTo(resultsRef.current, 900);
    }, 100);

    try {
      // Dispatch job to backend API
      const res = await api.post(
        '/api/analyze/',
        {
          text: plainText,
          aiDetection,
          misinformation
        },
        { signal: controller.signal, timeoutMs: 30000 }
      );

      if (res.status === 'success' && res.job_id) {
        const jobId = res.job_id;
        let job = res.job;
        const completedSynchronously = Boolean(res.job);

        for (let attempt = 0; attempt < 30; attempt += 1) {
          if (job?.status === 'SUCCESS' || job?.status === 'FAILED') break;
          await new Promise((resolve) => setTimeout(resolve, 750));
          if (controller.signal.aborted) return;
          const statusRes = await api.get(
            `/api/analyze/status/${jobId}/`,
            { signal: controller.signal }
          );
          if (statusRes.status === 'success') job = statusRes.job;
        }

        if (job?.status === 'SUCCESS' && job.result) {
          const record = job.result;
          const analysis = {
            authenticity: Math.round(100 - record.ai_score),
            humanPct: Math.round(100 - record.ai_score),
            aiPct: Math.round(record.ai_score),
            humanizedPct: 0,
            misinfoRisk: record.detailed_breakdown?.misinfo_details?.verdict || 'Low Risk',
            details: record.detailed_breakdown
          };

          setResultsData(analysis);
          setSegments(buildHighlightedSegments(plainText, record.ai_score));
          if (completedSynchronously && res.subscription_access) {
            setSubscriptionAccess(res.subscription_access);
          } else {
            setSubscriptionAccess((currentAccess) => {
              const detectionsUsed = (currentAccess.detections_used || 0) + 1;
              const detectionLimit = currentAccess.detection_limit;
              return {
                ...currentAccess,
                detections_used: detectionsUsed,
                detections_remaining: detectionLimit === null
                  ? null
                  : Math.max(0, detectionLimit - detectionsUsed),
              };
            });
          }
          setIsAnalyzing(false);
          showToast('Analysis completed successfully!', 'success');
          loadHistory();
          setTimeout(() => smoothScrollTo(resultsRef.current, 700), 100);
        } else if (job?.status === 'FAILED') {
          setIsAnalyzing(false);
          showToast("Analysis could not be completed. Please try again.", "error");
        } else {
          setIsAnalyzing(false);
          showToast("Analysis timed out. Please try again.", "error");
        }
      } else {
        setIsAnalyzing(false);
        showToast(res.message || "Failed to launch analysis job.", "error");
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err.data?.subscription_access) {
        setSubscriptionAccess(err.data.subscription_access);
      }
      setIsAnalyzing(false);
      showToast(err.message || "Connection to analysis server failed.", "error");
    }
  };

  const handleDeleteScan = async (event, scan) => {
    event.stopPropagation();
    try {
      await api.delete(`/api/analyze/history/${scan.id}/`);
      setScans((currentScans) => currentScans.filter((item) => item.id !== scan.id));
      showToast(`Deleted ${scan.filename} from history`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not delete this scan.', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showToast('Please upload a document smaller than 25 MB.', 'error');
      e.target.value = '';
      return;
    }

    try {
      showToast(`Reading ${file.name}...`, 'info');
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/analyze/extract/', formData, {
        timeoutMs: 60000,
      });

      if (editorRef.current) {
        editorRef.current.innerText = response.text;
        setError('');
        checkAndResetResults(response.text);
      }
      showToast(`Loaded ${response.word_count.toLocaleString()} words from ${file.name}.`, 'success');
    } catch (err) {
      const message = err.message || 'Could not read this document.';
      setError(message);
      showToast(message, 'error');
    } finally {
      e.target.value = '';
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800 overflow-x-hidden relative">

      {/* Shared Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
      />

      {/* Main Content Pane - Automatically stretches dynamically when sidebar collapses */}
      <main className={`flex-1 w-full max-w-[1240px] mx-auto flex flex-col justify-start p-4 pt-16 sm:p-8 md:pt-10 transition-all duration-300 ${
        isHistoryOpen ? 'lg:pr-[320px]' : ''
      }`}>
        {activeTab === 'dashboard' && (
          <div className="flex min-h-[calc(100vh-6rem)] w-full max-w-[1000px] flex-col gap-0 mx-auto text-left lg:h-[calc(100vh-6rem)]">
            
            {/* Pastel Greeting Banner */}
            <div className="bg-[#EEEDFC] rounded-[28px] px-8 py-8 md:px-10 md:py-10 text-stone-800 relative overflow-hidden border border-stone-200/30 flex-[3]">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-5 h-full">
                <div className="flex flex-col justify-center gap-3 max-w-lg text-left">
                  <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-stone-900 leading-tight">
                    Hi, {displayName}
                  </h1>
                  <p className="text-stone-500 font-medium text-[14px] leading-relaxed">
                    Ready to scan and verify your content today?
                  </p>
                  <div className="mt-1">
                    <button
                      onClick={() => setActiveTab('detector')}
                      className="px-6 py-3 bg-[#1FA463] hover:bg-[#178a52] text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-98 transition shadow-md shadow-[#1FA463]/15 flex items-center gap-2 cursor-pointer whitespace-nowrap text-[14px] border-none outline-none"
                    >
                      Start New Scan
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                {/* SVG Illustration */}
                <div className="hidden md:flex shrink-0 items-center justify-center w-48 h-36">
                  <svg className="w-full h-full" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="75" r="55" fill="#E0DDF9" />
                    <rect x="30" y="115" width="140" height="6" rx="3" fill="#D1D5DB" />
                    <path d="M110 115H170L174 109H106L110 115Z" fill="#9CA3AF" />
                    <path d="M110 109L114 75H166L170 109H110Z" fill="#374151" />
                    <rect x="117" y="78" width="46" height="27" rx="1.5" fill="#4B5563" />
                    <rect x="122" y="82" width="36" height="19" rx="1" fill="#EEF2F6" />
                    <circle cx="140" cy="91" r="5" fill="#7755FF" />
                    <rect x="126" y="86" width="3" height="8" rx="0.5" fill="#1FA463" />
                    <rect x="131" y="88" width="3" height="6" rx="0.5" fill="#F36C3D" />
                    <path d="M50 115C50 90 70 85 85 85C100 85 105 92 105 115H50Z" fill="#7755FF" />
                    <rect x="71" y="73" width="8" height="15" rx="2" fill="#FDE047" />
                    <circle cx="75" cy="65" r="13" fill="#FDE047" />
                    <path d="M60 62C60 50 72 48 78 48C88 48 90 54 90 64C90 66 87 60 82 58C77 56 68 59 64 63C62 64 60 65 60 62Z" fill="#1F2937" />
                    <path d="M80 98C92 98 108 108 116 109L114 113C104 112 90 102 80 102V98Z" fill="#FDE047" />
                    <rect x="94" y="103" width="8" height="12" rx="1.5" fill="#EF4444" />
                    <path d="M102 106C104 106 105 108 105 109C105 110 104 112 102 112" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M96 98C96 99.5 95 100 95 101" stroke="#D1D5DB" strokeWidth="1" strokeLinecap="round" />
                    <path d="M98 97C98 98.5 97 99 97 100" stroke="#D1D5DB" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            <div className="flex flex-col gap-3 pt-6 flex-[2]">
              <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest text-left">Overview</h2>
              
              {/* Unified color overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                
                {/* Total Scans Run */}
                <div className="bg-[#EEEDFC] border border-[#E0DDF9] rounded-[20px] px-6 py-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} className="text-[#7755FF]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-2">Total Scans</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-stone-900 tracking-tight leading-none">{scans.length}</span>
                      <span className="text-stone-400 text-xs font-semibold leading-none">scans</span>
                    </div>
                  </div>
                </div>

                {/* Average AI Score */}
                <div className="bg-[#EEEDFC] border border-[#E0DDF9] rounded-[20px] px-6 py-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-[#7755FF]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-2">Avg. AI Score</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-stone-900 tracking-tight leading-none">
                        {scans.length
                          ? `${(scans.reduce((sum, scan) => sum + scan.score, 0) / scans.length).toFixed(1)}%`
                          : '0.0%'}
                      </span>
                      <span className="text-stone-400 text-xs font-semibold leading-none">AI avg</span>
                    </div>
                  </div>
                </div>

                {/* Current Plan */}
                <div className="bg-[#EEEDFC] border border-[#E0DDF9] rounded-[20px] px-6 py-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                      <Sparkles size={20} className="text-[#7755FF]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-2">Current Plan</span>
                      <span className="text-xl font-black text-stone-900 tracking-tight leading-none">{subscriptionPlan}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 bg-white/80 hover:bg-white text-stone-800 text-xs font-bold rounded-xl transition border border-[#E0DDF9] shrink-0 cursor-pointer outline-none"
                  >
                    Upgrade
                  </button>
                </div>

              </div>
            </div>

            {/* Recent Activity - Flat, No Box */}
            <div className="flex flex-col gap-4 w-full text-left pt-6 flex-[3]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-stone-900">Recent Activity</h3>
                  <p className="text-stone-400 text-[12px] font-medium">Your most recent scans.</p>
                </div>
                
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-600 font-bold rounded-xl text-[12px] transition cursor-pointer flex items-center gap-2 outline-none border-none"
                >
                  <Clock size={14} />
                  View All History
                </button>
              </div>

              <div className="flex flex-col flex-1 justify-evenly">
                {scans.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-200 px-5 py-8 text-center text-sm font-medium text-stone-400">
                    Your completed scans will appear here.
                  </div>
                )}
                {scans.slice(0, 3).map((scan, idx) => (
                  <div 
                    key={scan.id} 
                    onClick={() => handleLoadScan(scan)}
                    className={`flex items-center justify-between py-4 px-3 hover:bg-stone-50 rounded-xl transition duration-200 cursor-pointer ${
                      idx < Math.min(scans.length, 3) - 1 ? 'border-b border-stone-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <FileText size={20} className={scan.score > 50 ? "text-amber-500" : "text-[#1FA463]"} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-bold text-stone-800 truncate">{scan.filename}</span>
                        <span className="text-[11px] font-semibold text-stone-400 mt-0.5">{scan.time}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shrink-0 ${
                      scan.score > 50
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {scan.score}% AI
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
        {activeTab === 'detector' && (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-6 text-center tracking-tight">
              AI Content &amp; Misinformation Detector
            </h1>

            <div className="flex flex-col gap-1.5 w-full">
              {/* Main Card container */}
              <Card className="flex min-h-[540px] flex-col bg-white border border-stone-200/40 shadow-[0_20px_50px_rgba(28,25,23,0.02)] p-5 sm:p-6 rounded-3xl transition-all duration-300">
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#1FA463]/15 bg-[#1FA463]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#1FA463] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                      {subscriptionPlan} plan
                    </span>
                    <span className="text-sm font-bold text-stone-700">
                      Up to {maxWords.toLocaleString()} words per scan
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${detectionLimitReached ? 'text-red-500' : 'text-stone-500'}`}>
                    {subscriptionAccess.detection_limit === null
                      ? `${subscriptionAccess.detections_used.toLocaleString()} scans used · Unlimited`
                      : `${subscriptionAccess.detections_used.toLocaleString()} / ${subscriptionAccess.detection_limit.toLocaleString()} scans used`}
                  </span>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-8 mb-4.5 flex-wrap">
                  <Toggle
                    label="AI Generated Detection"
                    enabled={aiDetection}
                    onChange={setAiDetection}
                  />
                  <Toggle
                    label={hasAdvancedMisinformation ? 'Advanced Misinformation Signals' : 'Basic Misinformation Signals'}
                    enabled={misinformation}
                    onChange={setMisinformation}
                  />
                </div>

                {/* Rich-Text Input area with contentEditable or Loading Skeleton */}
                <div className="relative flex-1 flex flex-col">
                  {isEmpty && (
                    <div className="absolute top-6 left-6 text-stone-400 pointer-events-none select-none text-[19px]">
                      Enter or paste the text you want to verify here...
                    </div>
                  )}
                  <div
                    ref={editorRef}
                    id="analyze-input"
                    contentEditable={true}
                    role="textbox"
                    aria-label="Text to analyze"
                    aria-multiline="true"
                    onInput={handleInput}
                    onFocus={() => setIsEmpty(false)}
                    onBlur={(e) => {
                      const textVal = e.target.innerText || '';
                      setIsEmpty(textVal.trim() === '');
                    }}
                    className="flex-1 w-full p-5 text-stone-700 bg-stone-50/30 rounded-2xl border border-stone-200/40 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 overflow-y-auto text-[19px] leading-relaxed transition focus:border-[#1FA463] outline-none"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  />
                </div>

                {/* Upload + Word Count */}
                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                  {/* File Upload Trigger */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-6.5 py-3.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-[18.5px] font-semibold transition"
                    >
                      <Upload size={22} />
                      Upload File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={SUPPORTED_DOCUMENT_ACCEPT}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Word Count Pill */}
                  <div className="flex items-center justify-end">
                    <span className={`text-[16.5px] font-semibold px-5 py-2.5 rounded-full border ${wordCount > maxWords
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200/60'
                      }`}>
                      {wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
                    </span>
                  </div>
                </div>

                {/* Validation error */}
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}
              </Card>
            </div>

            {/* Analyze Now button */}
            <div className="mt-4 flex justify-center translate-y-0">
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || wordCount > maxWords || detectionLimitReached}
                className={`w-full px-8 py-4 text-lg font-bold rounded-xl text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 sm:w-auto sm:px-16 sm:py-5 sm:text-xl ${isAnalyzing || wordCount > maxWords || detectionLimitReached
                    ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                    : 'bg-[#1FA463] hover:bg-[#178a52] hover:-translate-y-0.5 shadow-[#1FA463]/25'
                  }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : detectionLimitReached ? 'Plan scan limit reached' : 'Analyze Now'}
              </button>
            </div>

            {/* Scroll Target for Results */}
            <div ref={resultsRef} className="scroll-mt-10" />

            {showResults && (
              <div className="mt-12 w-full max-w-[1100px] mx-auto transition-all duration-500">
                {isAnalyzing ? (
                  /* Loading Spinner / Brain animation */
                  <Card className="bg-white border border-stone-200/40 p-10 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full border-4 border-stone-100 border-t-[#1FA463] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#1FA463]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">Analyzing your text...</h3>
                    <p className="text-stone-500 text-sm max-w-xs leading-relaxed mx-auto">
                      VeritasAI is scanning perplexity, burstiness, and factual signals. This usually takes under 5 seconds.
                    </p>
                  </Card>
                ) : resultsData && (
                  <div className="space-y-8 animate-fadeIn text-left">
                    <h2 className="text-2xl font-bold text-stone-800 border-b border-stone-200 pb-3 mb-6">
                      Analysis Results
                    </h2>

                    {/* Dual detection results card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                      {/* 1. AI Generated Detection Card */}
                      {aiDetection ? (
                        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition hover:shadow-md">
                          <div className="text-left mb-6">
                            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">AI Generated Detection</span>
                            <h3 className="text-lg font-bold text-stone-900">Overall Authenticity</h3>
                          </div>

                          <div className="flex flex-col items-center mb-6">
                            {/* Authenticity Gauge */}
                            <div className="w-28 h-28 rounded-full border-8 border-stone-100 flex flex-col items-center justify-center relative shadow-sm mb-4">
                              <span className="text-3xl font-black text-[#1FA463]">{resultsData.authenticity}%</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase">Human</span>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="w-full h-2 bg-stone-100 rounded-full mb-6">
                              <div
                                className="h-full rounded-full bg-[#1FA463] transition-all duration-1000"
                                style={{ width: `${resultsData.authenticity}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-3.5 w-full text-left">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-[13px] text-stone-500 font-semibold">Human Written Score</span>
                              <span className="text-[14px] font-bold text-stone-800">{resultsData.humanPct}%</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-[13px] text-stone-500 font-semibold">AI Generated Score</span>
                              <span className="text-[14px] font-bold text-red-500">{resultsData.aiPct}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[13px] text-stone-500 font-semibold">Humanized AI Probability</span>
                              <span className="text-[14px] font-bold text-amber-500">{resultsData.humanizedPct}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-stone-200/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-inner min-h-[300px]">
                          <Lock size={28} className="text-stone-300 mb-4" />
                          <h3 className="text-base font-bold text-stone-700 mb-1">AI Detection Disabled</h3>
                          <p className="text-stone-400 text-xs max-w-[200px]">Toggle AI Generated Detection above to run this scan.</p>
                        </div>
                      )}

                      {/* 2. Misinformation Signals Card */}
                      {misinformation ? (
                        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition hover:shadow-md">
                          <div className="text-left mb-6">
                            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Misinformation Signals</span>
                            <h3 className="text-lg font-bold text-stone-900">Factcheck Integrity</h3>
                          </div>

                          <div className="flex flex-col items-center mb-6">
                            {/* Misinformation Risk Gauge */}
                            <div className="w-28 h-28 rounded-full border-8 border-stone-100 flex flex-col items-center justify-center relative shadow-sm mb-4 px-4 text-center overflow-hidden">
                              <span className={`block w-full text-lg font-black uppercase ${riskTier(resultsData.misinfoRisk) === 'high'
                                  ? 'text-red-500'
                                  : riskTier(resultsData.misinfoRisk) === 'medium'
                                    ? 'text-amber-500'
                                    : 'text-[#1FA463]'
                                } leading-none break-words`}>{resultsData.misinfoRisk}</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase">Risk</span>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="w-full h-2 bg-stone-100 rounded-full mb-6">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${riskTier(resultsData.misinfoRisk) === 'high'
                                    ? 'bg-red-500'
                                    : riskTier(resultsData.misinfoRisk) === 'medium'
                                      ? 'bg-amber-500'
                                      : 'bg-[#1FA463]'
                                  }`}
                                style={{ width: riskTier(resultsData.misinfoRisk) === 'high' ? '90%' : riskTier(resultsData.misinfoRisk) === 'medium' ? '50%' : '15%' }}
                              />
                            </div>
                          </div>

                          <div className="relative min-h-[112px] w-full">
                            <div className={`space-y-3.5 w-full text-left transition ${hasAdvancedMisinformation ? '' : 'select-none blur-[4px]'}`}>
                              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <span className="text-[13px] text-stone-500 font-semibold">Unverified Claims Flags</span>
                                <span className="text-[14px] font-bold text-stone-800">
                                  {resultsData.details?.misinfo_details?.unverified_claims_count ?? 0} flags
                                </span>
                              </div>
                              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <span className="text-[13px] text-stone-500 font-semibold">Contradicted Claims</span>
                                <span className="text-[14px] font-bold text-stone-800">
                                  {resultsData.details?.misinfo_details?.contradicted_count ?? 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[13px] text-stone-500 font-semibold">Claims Checked</span>
                                <span className="text-[14px] font-bold text-stone-800">
                                  {resultsData.details?.misinfo_details?.claims_checked ?? 0}
                                </span>
                              </div>
                            </div>
                            {!hasAdvancedMisinformation && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('plans')}
                                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-stone-200/70 bg-white/75 px-4 text-center backdrop-blur-[1px]"
                              >
                                <Lock size={18} className="mb-1.5 text-stone-500" />
                                <span className="text-xs font-black text-stone-800">Advanced misinformation is locked</span>
                                <span className="mt-1 text-[11px] font-semibold text-[#1FA463]">Available on Monthly and Yearly</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-stone-200/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-inner min-h-[300px]">
                          <Lock size={28} className="text-stone-300 mb-4" />
                          <h3 className="text-base font-bold text-stone-700 mb-1">Misinformation Disabled</h3>
                          <p className="text-stone-400 text-xs max-w-[200px]">Toggle Misinformation Signals above to run this scan.</p>
                        </div>
                      )}

                    </div>

                    {/* Advanced Sentence Scanning Section (Blurred Paywall) */}
                    <div className="w-full text-left mt-8">
                      <Card className="bg-white border border-stone-200/40 shadow-[0_15px_45px_rgba(28,25,23,0.02)] p-6 sm:p-8 rounded-3xl relative overflow-hidden">

                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-bold text-stone-900 font-sans">Advanced Sentence Scanning</h3>
                          {!hasDeepScan && (
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                              <Lock size={10} /> Pro Locked
                            </span>
                          )}
                        </div>

                        <p className="text-stone-400 text-xs font-semibold mb-6">
                          Understand how each sentence impacts AI probabilities and factcheck metrics.
                        </p>

                        {/* Sentence display container */}
                        <div className={`transition-all duration-500 ${!hasDeepScan ? 'blur-[5px] select-none pointer-events-none' : ''}`}>
                          <div className="text-stone-700 leading-relaxed text-[16px] space-y-4 font-sans">
                            {segments.map((seg, i) => (
                              <span
                                key={i}
                                className={seg.color ? `px-1 rounded ${seg.color} underline decoration-dotted decoration-2 underline-offset-4` : undefined}
                              >
                                {seg.text}{' '}
                              </span>
                            ))}
                          </div>

                          {/* Legend for sentences */}
                          <div className="flex flex-wrap gap-4 items-center border-t border-stone-100 pt-4 mt-6">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-5 rounded bg-red-100 border border-red-200" />
                              <span className="text-[11px] font-bold text-stone-400 uppercase">AI Generated</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-5 rounded bg-green-100 border border-green-200" />
                              <span className="text-[11px] font-bold text-stone-400 uppercase">Human Written</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-5 rounded bg-amber-100 border border-amber-200" />
                              <span className="text-[11px] font-bold text-stone-400 uppercase">Humanized AI</span>
                            </div>
                          </div>
                        </div>

                        {/* Lock Overlay when Free */}
                        {!hasDeepScan && (
                          <div className="absolute inset-0 bg-stone-50/15 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
                            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center shadow-lg text-white mb-4 animate-bounce">
                              <Lock size={20} />
                            </div>
                            <h4 className="text-lg font-bold text-stone-900 mb-2">Deep Scan is Locked</h4>
                            <p className="text-stone-500 text-sm max-w-sm mb-6 leading-relaxed">
                              Get sentence-by-sentence highlights and structural analysis with a Monthly or Yearly plan.
                            </p>
                            <button
                              onClick={() => {
                                setActiveTab('plans');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-8 py-3 bg-[#1FA463] hover:bg-[#178a52] text-white rounded-xl font-bold text-sm shadow-md shadow-[#1FA463]/10 active:scale-95 transition-all cursor-pointer pointer-events-auto border-none outline-none"
                            >
                              Unlock with Premium Plan
                            </button>
                          </div>
                        )}

                      </Card>
                    </div>

                    <div className="w-full text-left">
                      <Card className="relative overflow-hidden rounded-3xl border border-stone-200/40 bg-white p-6 shadow-[0_15px_45px_rgba(28,25,23,0.02)] sm:p-8">
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-stone-900">Detailed Report Insights</h3>
                          <span className="rounded-full border border-[#1FA463]/20 bg-[#1FA463]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#1FA463]">
                            Yearly
                          </span>
                        </div>
                        <div className={`grid grid-cols-2 gap-4 transition sm:grid-cols-4 ${hasDetailedReports ? '' : 'select-none blur-[5px]'}`}>
                          {[
                            ['Words analyzed', resultsData.details?.metrics?.word_count ?? wordCount],
                            ['Sentences', resultsData.details?.metrics?.sentence_count ?? 0],
                            ['Perplexity', resultsData.details?.ai_details?.perplexity_score ?? 0],
                            ['Burstiness', resultsData.details?.ai_details?.burstiness_score ?? 0],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">{label}</span>
                              <span className="mt-1 block text-xl font-black text-stone-900">{value}</span>
                            </div>
                          ))}
                        </div>
                        {!hasDetailedReports && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('plans')}
                            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-white/70 px-6 text-center backdrop-blur-[1px]"
                          >
                            <Lock size={22} className="mb-2 text-stone-600" />
                            <span className="text-sm font-black text-stone-900">Detailed reports are locked</span>
                            <span className="mt-1 text-xs font-semibold text-[#1FA463]">Available with the Yearly plan</span>
                          </button>
                        )}
                      </Card>
                    </div>

                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'plans' && (
          /* Plans & Pricing Subview */
          <div className="w-full overflow-x-hidden px-2 pb-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-[36px] font-black leading-tight tracking-normal text-stone-950 sm:text-[44px]">
                Pricing Plans
              </h1>
              <p className="mt-3 text-base font-medium leading-7 text-stone-500 sm:text-[17px]">
                Choose the plan that fits your AI detection and misinformation review needs.
              </p>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-[1180px] grid-cols-1 gap-5 text-left md:grid-cols-3">
              {[
                {
                  planValue: 'Free',
                  name: 'Free Tier',
                  price: 'Rs. 0',
                  period: '',
                  features: [
                    'Access to AI detector',
                    'Standard AI scan',
                    '10,000 words per input',
                    '50 AI detections',
                    'Basic misinformation detection',
                    'Standard response times'
                  ],
                },
                {
                  planValue: 'Monthly',
                  name: 'Monthly Plan',
                  price: 'Rs. 250',
                  period: '/mo',
                  features: [
                    'Access to AI detector',
                    'AI deep scan',
                    '50,000 words per input',
                    '500 AI detections',
                    'Advanced misinformation detection',
                    'Fast response times',
                    'Standard support'
                  ],
                  buttonText: 'Upgrade',
                  subscribePlan: 'Monthly'
                },
                {
                  planValue: 'Yearly',
                  name: 'Yearly Plan',
                  badge: 'Most Popular',
                  badgeClassName: 'bg-[#1FA463]/10 text-[#1FA463] border-[#1FA463]/20',
                  price: 'Rs. 2500',
                  period: '/yr',
                  popular: true,
                  features: [
                    'Access to AI detector',
                    'AI deep scan',
                    '500,000 words per input',
                    'Unlimited AI detections',
                    'Detailed misinformation reports + AI vs Human detection',
                    'Fastest response times',
                    'Priority support'
                  ],
                  buttonText: 'Upgrade',
                  subscribePlan: 'Yearly'
                }
              ].map((plan) => {
                const planRanks = { Free: 0, Monthly: 1, Yearly: 2 };
                const currentPlanRank = planRanks[subscriptionPlan] ?? 0;
                const cardPlanRank = planRanks[plan.planValue] ?? 0;
                const isCurrent = subscriptionPlan === plan.planValue;
                const isIncluded = !isCurrent && cardPlanRank < currentPlanRank;
                const isDisabled = isCurrent || isIncluded || plan.planValue === 'Free';
                const badge = isCurrent ? 'Current Plan' : plan.badge;
                const badgeClassName = isCurrent
                  ? 'bg-[#1FA463]/10 text-[#1FA463] border-[#1FA463]/20'
                  : plan.badgeClassName;
                const buttonText = isCurrent
                  ? 'Current Plan'
                  : isIncluded
                    ? 'Included in your plan'
                    : plan.buttonText;

                return (
                  <article
                    key={plan.name}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`flex min-h-[455px] flex-col rounded-2xl bg-white px-6 py-6 transition-colors ${
                      isCurrent
                        ? 'border-2 border-[#1FA463] ring-4 ring-[#1FA463]/5'
                        : plan.popular
                          ? 'border-2 border-[#1FA463]/70'
                          : 'border border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-stone-950">{plan.name}</h2>
                      {badge && (
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${badgeClassName}`}>
                          {badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-end gap-1">
                      <span className="text-4xl font-black leading-none tracking-normal text-stone-950">{plan.price}</span>
                      {plan.period && (
                        <span className="pb-1 text-sm font-bold text-stone-400">{plan.period}</span>
                      )}
                    </div>

                    <ul className="mt-6 flex flex-1 flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm font-medium leading-6 text-stone-600">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1FA463]/10 text-[#1FA463]">
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && plan.subscribePlan && handleSubscribe(plan.subscribePlan)}
                      className={`mt-6 h-11 rounded-xl px-5 text-sm font-bold ${
                        isDisabled
                          ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                          : 'bg-stone-950 text-white hover:bg-[#1FA463]'
                      }`}
                    >
                      {buttonText}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          /* Account Settings Subview */
          <div className="w-full flex flex-col items-start max-w-[850px] mx-auto">
            {/* Identity Info Bar */}
            <div className="flex items-center gap-5 mb-8 text-left w-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0 select-none">
                {displayName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-none">{displayName}</h2>
                  <span className="px-2.5 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-stone-200/60 select-none">
                    {subscriptionPlan}
                  </span>
                </div>
                <span className="text-stone-400 text-sm font-medium mt-1 truncate">{emailAddress}</span>
              </div>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="flex items-center gap-6 border-b border-stone-200/60 pb-px mb-8 w-full">
              {[
                { id: 'general', label: 'General', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'billing', label: 'Billing', icon: CreditCard },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = accountSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAccountSubTab(tab.id)}
                    className={`flex items-center gap-2 pb-3.5 px-1 text-sm font-semibold tracking-tight transition-all relative cursor-pointer select-none ${isActive
                        ? 'text-stone-900 border-b-2 border-stone-900 font-bold'
                        : 'text-stone-400 hover:text-stone-700'
                      }`}
                  >
                    <TabIcon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub Tab Content Area */}
            <div className="w-full flex flex-col gap-6">
              {accountSubTab === 'general' && (
                <div className="w-full bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                  <h3 className="text-lg font-bold text-stone-900 mb-1">General Information</h3>
                  <p className="text-stone-400 text-[13px] font-medium mb-6">Update your display name and personal details</p>

                  <form onSubmit={handleSaveGeneral} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-stone-50/50 border border-stone-200/80 focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] focus:outline-none text-stone-800 rounded-xl px-4 py-2.5 text-[14px] font-medium transition"
                      />
                      <span className="text-stone-400 text-xs font-medium">This is how your name appears across the app.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={emailAddress}
                        disabled
                        className="w-full bg-stone-100/60 border border-stone-200/60 text-stone-400 cursor-not-allowed rounded-xl px-4 py-2.5 text-[14px] font-medium"
                      />
                      <span className="text-stone-400 text-xs font-medium">Your email is tied to your account and cannot be changed.</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition active:scale-98 cursor-pointer select-none"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {accountSubTab === 'security' && (
                <div className="w-full flex flex-col gap-6">
                  {/* Change Password Card */}
                  <div className="bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Change Password</h3>
                    <p className="text-stone-400 text-[13px] font-medium mb-6">Update your password to keep your account secure</p>

                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-stone-50/50 border border-stone-200/80 focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] focus:outline-none text-stone-800 rounded-xl px-4 py-2.5 text-[14px] font-medium transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-stone-50/50 border border-stone-200/80 focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] focus:outline-none text-stone-800 rounded-xl px-4 py-2.5 text-[14px] font-medium transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-stone-50/50 border border-stone-200/80 focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] focus:outline-none text-stone-800 rounded-xl px-4 py-2.5 text-[14px] font-medium transition"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-stone-400 text-xs font-semibold">
                          Signed up with Google? Use the <span className="underline hover:text-stone-600 cursor-pointer">forgot password</span> flow first.
                        </span>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition active:scale-98 cursor-pointer select-none"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Sessions Card */}
                  <div className="bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex flex-col text-left">
                      <h3 className="text-lg font-bold text-stone-900 mb-1">Active Sessions</h3>
                      <p className="text-stone-400 text-[13px] font-medium">Sign out of all other devices and browsers.</p>
                    </div>
                    <button
                      onClick={() => showToast('Successfully signed out of all other sessions.', 'success')}
                      className="px-6 py-2.5 border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 rounded-xl transition active:scale-98 cursor-pointer shrink-0 select-none"
                    >
                      Sign Out All
                    </button>
                  </div>

                  {/* Delete Account Card */}
                  <div className="bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex flex-col text-left">
                      <h3 className="text-lg font-bold text-stone-950 mb-1 text-red-600">Delete Account</h3>
                      <p className="text-stone-400 text-[13px] font-medium">Permanently remove your account and all data. This cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to permanently delete your account? This action is irreversible.')) {
                          showToast('Account deletion request received.', 'success');
                          router.push('/login');
                        }
                      }}
                      className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-sm rounded-xl transition active:scale-98 cursor-pointer shrink-0 select-none border border-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {accountSubTab === 'billing' && (
                <div className="w-full bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-stone-100 pb-6 mb-6">
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase mb-1">Current Plan</span>
                      <h3 className="text-2xl font-black text-stone-900 tracking-tight">{subscriptionPlan} Plan</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="px-6 py-2.5 bg-[#1FA463] text-white hover:bg-[#178a52] rounded-xl font-bold text-sm shadow-md shadow-[#1FA463]/10 hover:shadow-lg active:scale-98 transition flex items-center gap-2 cursor-pointer select-none"
                    >
                      {subscriptionPlan === 'Yearly' ? 'View Plans' : 'Upgrade Plan'}
                      <ChevronRight size={15} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">Billing Cycle</span>
                      <span className="text-[15px] font-bold text-stone-800">
                        {subscriptionPlan === 'Free' ? 'No paid billing cycle' : subscriptionPlan}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">Words Per Scan</span>
                      <span className="text-[15px] font-bold text-stone-800">{maxWords.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">Detection Usage</span>
                      <span className="text-[15px] font-bold text-stone-800">
                        {subscriptionAccess.detection_limit === null
                          ? `${subscriptionAccess.detections_used.toLocaleString()} / Unlimited`
                          : `${subscriptionAccess.detections_used.toLocaleString()} / ${subscriptionAccess.detection_limit.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 border-t border-stone-100 pt-6 sm:grid-cols-3">
                    {[
                      ['Deep scan', hasDeepScan],
                      ['Advanced misinformation', hasAdvancedMisinformation],
                      ['Detailed reports', hasDetailedReports],
                    ].map(([label, isUnlocked]) => (
                      <div key={label} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                        <span className="text-xs font-bold text-stone-700">{label}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wide ${isUnlocked ? 'text-[#1FA463]' : 'text-stone-400'}`}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ChatGPT / Claude style sliding Right History Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-[320px] bg-[#FDFBF7] border-l border-stone-200/80 shadow-2xl z-[60] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-stone-500" />
              <h3 className="font-extrabold text-[16px] text-stone-900 tracking-tight">Scan History</h3>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer border-none outline-none"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {scans.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 mt-20">
                <FileText size={32} className="opacity-40 mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider">No history found</span>
              </div>
            ) : (
              scans.map((scan) => (
                <div
                  key={scan.id}
                  className="group relative flex items-center justify-between p-3.5 bg-white border border-stone-200/60 rounded-xl hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition duration-200 cursor-pointer"
                >
                  {/* Select Scan */}
                  <div
                    onClick={() => handleLoadScan(scan)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0 pr-8"
                  >
                    <FileText size={16} className="text-stone-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-stone-700 group-hover:text-stone-950 truncate leading-tight">
                        {scan.filename}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-400 mt-1 leading-none">
                        {scan.time} • {scan.score}% AI
                      </span>
                    </div>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={(event) => handleDeleteScan(event, scan)}
                    className="absolute right-3 p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition duration-150 cursor-pointer border-none outline-none md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Scan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay for drawer */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[55]"
        />
      )}
    </div>
  );
};

export default Detector;
