"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  AlertCircle,
  ShieldCheck,
  Clipboard,
  Undo,
  Redo,
  Type,
  Bold,
  Italic,
  Underline,
  Link,
  MoreVertical,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
  CreditCard,
  User,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import safeLocalStorage from '../../utils/safeLocalStorage';
import { analyzeText, buildHighlightedSegments } from '../../utils/analyzeText';

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
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [segments, setSegments] = useState([]);

  // Account subview states
  const [accountSubTab, setAccountSubTab] = useState('general');
  const [displayName, setDisplayName] = useState('Sulav Sharma');
  const [emailAddress, setEmailAddress] = useState('sulav2080-0306@iimscollege.edu.np');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const resultsRef = useRef(null);

  const handleSubscribe = (planName) => {
    let price = 'Rs. 250';
    if (planName === 'Yearly') price = 'Rs. 2500';
    router.push(`/payment?planName=${encodeURIComponent(planName + ' Plan')}&planPrice=${encodeURIComponent(price)}`);
  };

  // Read subscription plan and user profile from localStorage on mount
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
  const [surveyData, setSurveyData] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const completed = safeLocalStorage.getItem('veritas_onboarding_completed');
    if (!completed) {
      router.push('/survey');
    } else if (completed !== 'skipped') {
      try {
        setSurveyData(JSON.parse(completed));
      } catch (e) {
        // ignore errors
      }
    }

    // Load active tab from URL query parameters if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [router]);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (['dashboard', 'detector', 'account', 'plans'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, []);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    showToast('General profile changes saved successfully!', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }
    showToast('Password updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const MAX_WORDS = 5000;

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

  const handleFormat = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'createLink') {
      const url = prompt('Enter the link URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, value);
    }

    const textVal = editorRef.current.innerText || '';
    checkAndResetResults(textVal);
  };

  const handlePasteClick = async () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        document.execCommand('insertText', false, clipboardText);
        const textVal = editorRef.current.innerText || '';
        checkAndResetResults(textVal);
      }
    } catch (err) {
      showToast("Please use Ctrl+V to paste or grant clipboard permission to the browser.", "error");
    }
  };

  const handleAnalyze = () => {
    const plainText = editorRef.current ? editorRef.current.innerText || '' : '';
    if (plainText.trim().length < 20) {
      setError('Please enter at least 20 characters to analyze.');
      showToast('Please enter at least 20 characters to analyze.', 'error');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setShowResults(true);

    // Smoothly scroll to the results ref area using custom ease function
    setTimeout(() => {
      smoothScrollTo(resultsRef.current, 900);
    }, 100);

    // Save states to localStorage for compatibility
    safeLocalStorage.setItem('veritas_text', plainText);
    safeLocalStorage.setItem('veritas_aiDetection', aiDetection.toString());
    safeLocalStorage.setItem('veritas_misinformation', misinformation.toString());

    setTimeout(() => {
      const analysis = analyzeText(plainText);
      setResultsData(analysis);
      setSegments(buildHighlightedSegments(plainText, analysis.aiPct));
      setIsAnalyzing(false);
      showToast('Analysis completed successfully!', 'success');
      // Scroll again in case the container expanded
      setTimeout(() => {
        smoothScrollTo(resultsRef.current, 700);
      }, 100);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (editorRef.current) {
        editorRef.current.innerText = ev.target.result;
        setError('');
        checkAndResetResults(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">

      {/* Shared Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
      />

      {/* Main Content Pane - Automatically stretches dynamically when sidebar collapses */}
      <main className="flex-1 p-4 sm:p-8 pt-14 md:pt-10 sm:pt-16 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto text-left">
            {/* Header / Welcome Banner */}
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden shadow-lg">
              {/* Background patterns */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider w-fit">
                    <Sparkles size={12} />
                    Personalized Workspace
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Welcome back, {displayName}!
                  </h1>
                  <p className="text-white/80 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                    VeritasAI is optimized and ready. Analyze text, evaluate burstiness, and detect AI signatures in seconds.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('detector')}
                  className="px-6 py-3 bg-white text-stone-900 font-bold rounded-2xl hover:bg-stone-50 hover:scale-[1.02] active:scale-98 transition shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap text-[14px]"
                >
                  Start New Scan
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-2 hover:-translate-y-0.5 transition duration-300">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Total Scans Run</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-stone-900 tracking-tight">3</span>
                  <span className="text-stone-400 text-xs font-semibold">scans</span>
                </div>
                <p className="text-[11px] font-semibold text-[#1FA463] mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA463]"></span>
                  All systems operating normally
                </p>
              </div>
              <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-2 hover:-translate-y-0.5 transition duration-300">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Average AI Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-stone-900 tracking-tight">24.2%</span>
                  <span className="text-stone-400 text-xs font-semibold">AI signature</span>
                </div>
                <p className="text-[11px] font-semibold text-stone-400 mt-1">
                  Based on recent scan history
                </p>
              </div>
              <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-2 hover:-translate-y-0.5 transition duration-300">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Current Plan</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-black text-stone-800 tracking-tight">{subscriptionPlan} Plan</span>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="text-xs font-bold text-[#7755FF] hover:underline"
                  >
                    Upgrade
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-stone-400 mt-1">
                  5,000 words limit per scan
                </p>
              </div>
            </div>

            {/* User Profile Insights & Recent Scans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Onboarding Survey profile summary */}
              <div className="bg-white border border-stone-200/50 rounded-[32px] p-6 md:p-8 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 mb-1">Your Onboarding Profile</h3>
                  <p className="text-stone-400 text-xs font-medium">Customized based on your onboarding answers.</p>
                </div>

                {surveyData ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Primary Role</span>
                      <span className="text-sm font-semibold text-stone-800 bg-[#7B82FF]/10 text-[#7B82FF] px-3 py-1 rounded-full">{surveyData.role || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Experience Level</span>
                      <span className="text-[13px] font-semibold text-stone-800">{surveyData.experience || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Usage Frequency</span>
                      <span className="text-[13px] font-semibold text-stone-800">{surveyData.frequency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">AI Detector Familiarity</span>
                      <span className="text-[13px] font-semibold text-stone-800">{surveyData.detectorUsed || 'N/A'}</span>
                    </div>
                    {surveyData.helpText && (
                      <div className="flex flex-col gap-2 pt-2 text-left">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Specific Assistance Request</span>
                        <div className="text-xs font-medium text-stone-600 bg-stone-50 rounded-2xl p-4 border border-stone-200/40 italic">
                          "{surveyData.helpText}"
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">No Profile Data</span>
                    <p className="text-stone-400 text-xs max-w-[200px]">You skipped onboarding or completed it elsewhere.</p>
                  </div>
                )}
              </div>

              {/* Recent Scan History */}
              <div className="bg-white border border-stone-200/50 rounded-[32px] p-6 md:p-8 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Recent Activity</h3>
                    <p className="text-stone-400 text-xs font-medium">Your most recent scans.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('detector')}
                    className="text-xs font-bold text-[#7755FF] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { filename: "assignment_final.txt", score: 16, time: "2 hours ago" },
                    { filename: "blog_post_draft.txt", score: 2, time: "1 day ago" },
                    { filename: "research_abstract.txt", score: 88, time: "2 days ago" },
                  ].map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-50/50 border border-stone-100 rounded-2xl">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-white border border-stone-200/60 rounded-xl">
                          <CheckCircle size={16} className={scan.score > 50 ? "text-amber-500" : "text-[#1FA463]"} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-stone-800">{scan.filename}</span>
                          <span className="text-[11px] font-semibold text-stone-400">{scan.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${scan.score > 50
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                          {scan.score}% AI
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
              <Card className="flex flex-col h-[64vh] min-h-[380px] max-h-[590px] bg-white border border-stone-200/40 shadow-[0_20px_50px_rgba(28,25,23,0.02)] p-5 sm:p-6 rounded-3xl transition-all duration-300">
                {/* Toggles */}
                <div className="flex items-center gap-8 mb-4.5 flex-wrap">
                  <Toggle
                    label="AI Generated Detection"
                    enabled={aiDetection}
                    onChange={setAiDetection}
                  />
                  <Toggle
                    label="Misinformation Signals"
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

                {/* Toolbar + Upload + Word Count */}
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
                      accept=".txt,.md,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Functional Rich-Text Formatting Toolbar */}
                  <div className="flex items-center gap-2 border border-stone-200/60 bg-stone-50/50 rounded-xl px-3.5 py-2 shadow-sm self-center sm:self-auto">
                    <button
                      type="button"
                      onClick={handlePasteClick}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Paste from clipboard"
                    >
                      <Clipboard size={22} />
                    </button>
                    <div className="w-px h-6 bg-stone-200 mx-2"></div>
                    <button
                      type="button"
                      onClick={() => handleFormat('undo')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Undo"
                    >
                      <Undo size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('redo')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Redo"
                    >
                      <Redo size={22} />
                    </button>
                    <div className="w-px h-6 bg-stone-200 mx-2"></div>
                    <button
                      type="button"
                      onClick={() => showToast('Text formatting options', 'success')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Text Size"
                    >
                      <Type size={22} />
                    </button>
                    <div className="w-px h-6 bg-stone-200 mx-2"></div>
                    <button
                      type="button"
                      onClick={() => handleFormat('bold')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-bold"
                      title="Bold"
                    >
                      <Bold size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('italic')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors italic"
                      title="Italic"
                    >
                      <Italic size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('underline')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors underline"
                      title="Underline"
                    >
                      <Underline size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormat('createLink')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Insert Link"
                    >
                      <Link size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('More editing options', 'success')}
                      className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="More options"
                    >
                      <MoreVertical size={22} />
                    </button>
                  </div>

                  {/* Word Count Pill */}
                  <div className="flex items-center justify-end">
                    <span className={`text-[16.5px] font-semibold px-5 py-2.5 rounded-full border ${wordCount > MAX_WORDS
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200/60'
                      }`}>
                      {wordCount} / {MAX_WORDS} words
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
                disabled={isAnalyzing || wordCount > MAX_WORDS}
                className={`px-16 py-5 text-xl font-bold rounded-xl text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 ${isAnalyzing || wordCount > MAX_WORDS
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
                ) : 'Analyze Now'}
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
                            <div className="w-28 h-28 rounded-full border-8 border-stone-100 flex flex-col items-center justify-center relative shadow-sm mb-4">
                              <span className={`text-2xl font-black uppercase ${resultsData.misinfoRisk === 'High'
                                  ? 'text-red-500'
                                  : resultsData.misinfoRisk === 'Medium'
                                    ? 'text-amber-500'
                                    : 'text-[#1FA463]'
                                }`}>{resultsData.misinfoRisk}</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase">Risk</span>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="w-full h-2 bg-stone-100 rounded-full mb-6">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${resultsData.misinfoRisk === 'High'
                                    ? 'bg-red-500'
                                    : resultsData.misinfoRisk === 'Medium'
                                      ? 'bg-amber-500'
                                      : 'bg-[#1FA463]'
                                  }`}
                                style={{ width: resultsData.misinfoRisk === 'High' ? '90%' : resultsData.misinfoRisk === 'Medium' ? '50%' : '15%' }}
                              />
                            </div>
                          </div>

                          <div className="space-y-3.5 w-full text-left">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-[13px] text-stone-500 font-semibold">Unverified Claims Flags</span>
                              <span className="text-[14px] font-bold text-stone-800">
                                {resultsData.misinfoRisk === 'High' ? '3 flags' : resultsData.misinfoRisk === 'Medium' ? '1 flag' : '0 flags'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-[13px] text-stone-500 font-semibold">Sensationalism & Clickbait</span>
                              <span className="text-[14px] font-bold text-stone-800">
                                {resultsData.misinfoRisk === 'High' ? 'High Presence' : resultsData.misinfoRisk === 'Medium' ? 'Moderate' : 'Negligible'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[13px] text-stone-500 font-semibold">Capitalization Ratio</span>
                              <span className="text-[14px] font-bold text-stone-800">Normal</span>
                            </div>
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
                          {subscriptionPlan === 'Free' && (
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                              <Lock size={10} /> Pro Locked
                            </span>
                          )}
                        </div>

                        <p className="text-stone-400 text-xs font-semibold mb-6">
                          Understand how each sentence impacts AI probabilities and factcheck metrics.
                        </p>

                        {/* Sentence display container */}
                        <div className={`transition-all duration-500 ${subscriptionPlan === 'Free' ? 'blur-[5px] select-none pointer-events-none' : ''}`}>
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
                        {subscriptionPlan === 'Free' && (
                          <div className="absolute inset-0 bg-stone-50/15 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
                            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center shadow-lg text-white mb-4 animate-bounce">
                              <Lock size={20} />
                            </div>
                            <h4 className="text-lg font-bold text-stone-900 mb-2">Detailed Report is Locked</h4>
                            <p className="text-stone-500 text-sm max-w-sm mb-6 leading-relaxed">
                              Get sentence-by-sentence highlights, clickbait breakdown, and structural statistics by upgrading your plan.
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
                  name: 'Free Tier',
                  badge: 'Current Plan',
                  badgeClassName: 'bg-stone-100 text-stone-500 border-stone-200',
                  price: 'Rs. 0',
                  period: '',
                  features: [
                    'Access to AI detector',
                    'AI deep scan',
                    '10,000 words per input',
                    '50 AI detections',
                    'Basic misinformation detection',
                    'Standard response times'
                  ],
                  buttonText: 'Current Plan',
                  disabled: true
                },
                {
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
              ].map((plan) => (
                <article
                  key={plan.name}
                  className={`flex min-h-[455px] flex-col rounded-2xl bg-white px-6 py-6 ${
                    plan.popular
                      ? 'border-2 border-[#1FA463]'
                      : 'border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-stone-950">{plan.name}</h2>
                    {plan.badge && (
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${plan.badgeClassName}`}>
                        {plan.badge}
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
                    disabled={plan.disabled}
                    onClick={() => plan.subscribePlan && handleSubscribe(plan.subscribePlan)}
                    className={`mt-6 h-11 rounded-xl px-5 text-sm font-bold ${
                      plan.disabled
                        ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                        : 'bg-stone-950 text-white hover:bg-[#1FA463]'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </article>
              ))}
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
                      Upgrade Plan
                      <ChevronRight size={15} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">Billing Cycle</span>
                    <span className="text-[15px] font-bold text-stone-800">Monthly</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Detector;
