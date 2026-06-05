"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  AlertCircle, 
  ShieldCheck, 
  LayoutDashboard, 
  User, 
  CreditCard, 
  HelpCircle, 
  LifeBuoy, 
  MessageSquare, 
  LogOut, 
  Clipboard, 
  Undo, 
  Redo, 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Lock,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Footer from '../../components/Footer';
import { useToast } from '../../components/ToastProvider';

// ─── Simulated Analysis Engine ────────────────────────────────────────────────
// Produces realistic, text-dependent scores without a backend
function analyzeText(text) {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Avg words per sentence (AI tends to be consistent: ~18-22)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

  // Vocabulary richness: unique / total words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/\W/g, '')));
  const lexicalDiversity = uniqueWords.size / Math.max(wordCount, 1);

  // Repetition score: how many words repeat >3 times
  const freq = {};
  words.forEach((w) => {
    const wl = w.toLowerCase().replace(/\W/g, '');
    freq[wl] = (freq[wl] || 0) + 1;
  });
  const repeatedWords = Object.values(freq).filter((c) => c > 3).length;
  const repetitionRatio = repeatedWords / Math.max(uniqueWords.size, 1);

  // AI probability signal: uniform sentence length + low lexical diversity + repetition
  let aiSignal = 0;
  if (avgWordsPerSentence > 16 && avgWordsPerSentence < 24) aiSignal += 0.25;
  if (lexicalDiversity < 0.55) aiSignal += 0.30;
  if (repetitionRatio > 0.05) aiSignal += 0.20;
  if (wordCount < 30) aiSignal += 0.10; // Short texts are less conclusive

  // Clamp aiSignal 0–0.80  (never 100% AI — always some uncertainty)
  aiSignal = Math.min(aiSignal + Math.random() * 0.08, 0.80);

  const aiPct = Math.round(aiSignal * 100);
  const humanPct = Math.round((1 - aiSignal) * 0.88 * 100); // small gap for "humanized AI"
  const humanizedPct = 100 - aiPct - humanPct;
  const authenticity = humanPct;

  // Misinformation: random-ish but seeded by text length + content
  const misinfoKeywords = ['fake', 'false', 'hoax', 'conspiracy', 'rumor', 'unverified', 'claim'];
  const misinfoHits = misinfoKeywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const misinfoRisk = misinfoHits > 1 ? 'High' : misinfoHits === 1 ? 'Medium' : 'Low';

  return { aiPct, humanPct, humanizedPct, authenticity, misinfoRisk };
}

// ─── Highlight words in the user's text ───────────────────────────────────────
function buildHighlightedSegments(text, aiPct) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, i) => {
    const hash = sentence.length + i;
    if (aiPct > 50 && hash % 4 === 0) return { text: sentence, color: 'decoration-red-400 bg-red-50 text-red-800' };
    if (hash % 3 === 0) return { text: sentence, color: 'decoration-[#1FA463]/40 bg-green-50 text-green-800' };
    if (hash % 5 === 0) return { text: sentence, color: 'decoration-amber-400 bg-amber-50 text-amber-800' };
    if (aiPct > 35 && hash % 7 === 0) return { text: sentence, color: 'decoration-orange-400 bg-orange-50/70 text-orange-800' };
    return { text: sentence, color: null };
  });
}

const Detector = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('detector');
  const [aiDetection, setAiDetection] = useState(true);
  const [misinformation, setMisinformation] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  const { showToast } = useToast();
  
  // App features state
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [segments, setSegments] = useState([]);
  
  // Account subview states
  const [accountSubTab, setAccountSubTab] = useState('general');
  const [displayName, setDisplayName] = useState('Sabin Shrestha');
  const [emailAddress, setEmailAddress] = useState('sabin2080-0297@iimscollege.edu.np');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const resultsRef = useRef(null);

  const handleSubscribe = (planName) => {
    setSubscriptionPlan(planName);
    showToast(`Successfully upgraded to ${planName} Plan! Premium features unlocked.`, 'success');
    setActiveTab('detector');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Auto-collapse sidebar on screen sizes below 1024px for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const faqs = [
    {
      question: "What is VeritasAI?",
      answer: "VeritasAI is a leading AI content and misinformation detector designed to analyze text and determine if it was authored by humans or generated by artificial intelligence tools like ChatGPT, GPT-4, Claude, or Gemini."
    },
    {
      question: "How does AI detection work?",
      answer: "VeritasAI uses machine learning models trained on millions of pages of human-written and AI-generated text. It analyzes linguistic patterns, perplexity (sentence structure predictability), and burstiness (variation in sentence lengths) to determine authenticity."
    },
    {
      question: "Is VeritasAI's AI detector accurate?",
      answer: "Yes, VeritasAI operates at a 90% accuracy rate, minimizing false positives while reliably flagging AI-generated text."
    },
    {
      question: "Who is VeritasAI for?",
      answer: "It is built for educators verifying student submissions, publishers and editors maintaining content integrity, content creators, and businesses checking copy authenticity."
    },
    {
      question: "Does VeritasAI store my submitted text?",
      answer: "No. Privacy is our core priority. All submitted text is analyzed in real-time, and we never store or share your content."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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
    localStorage.setItem('veritas_text', plainText);
    localStorage.setItem('veritas_aiDetection', aiDetection.toString());
    localStorage.setItem('veritas_misinformation', misinformation.toString());

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">
      
      {/* Left Sidebar */}
      <aside className={`bg-[#FDFBF7] border-r border-stone-200/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out relative ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-[88px] right-0 translate-x-1/2 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 shadow-sm transition z-50 group cursor-pointer"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={13} className="text-stone-500 group-hover:text-stone-800 transition" />
          ) : (
            <ChevronLeft size={13} className="text-stone-500 group-hover:text-stone-800 transition" />
          )}
        </button>

        <div className={`flex flex-col gap-6 py-6 transition-all duration-300 ${isSidebarCollapsed ? 'px-3 items-center' : 'px-6'}`}>
          {/* Logo / Brand */}
          <div 
            onClick={() => router.push('/')}
            className={`flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Go to Homepage"
          >
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-lg shrink-0">
              <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-[22px] tracking-tight text-stone-900 transition-all duration-300 whitespace-nowrap overflow-hidden">
                VeritasAI
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6 mt-4 w-full">
            <button 
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all w-full text-left ${
                activeTab === 'detector'
                  ? 'bg-stone-900 text-white shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
              } ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2.5'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            {/* Account Section */}
            <div className="flex flex-col gap-2 w-full">
              {!isSidebarCollapsed && (
                <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Account</span>
              )}
              <button 
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full ${
                  activeTab === 'account'
                    ? 'bg-stone-900 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                } ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Account"
              >
                <User size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Account</span>}
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full ${
                  activeTab === 'plans'
                    ? 'bg-stone-900 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                } ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Plans & Pricing"
              >
                <CreditCard size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Plans & Pricing</span>}
              </button>
            </div>

            {/* Help Section */}
            <div className="flex flex-col gap-2 w-full">
              {!isSidebarCollapsed && (
                <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Help</span>
              )}
              <button 
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full ${
                  activeTab === 'faq'
                    ? 'bg-stone-900 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                } ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="FAQ"
              >
                <HelpCircle size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">FAQ</span>}
              </button>
              <button 
                onClick={() => showToast('Support desk is currently under maintenance.', 'error')}
                className={`flex items-center gap-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 rounded-xl font-medium text-[15.5px] transition-all text-left w-full ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Support"
              >
                <LifeBuoy size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Support</span>}
              </button>
              <button 
                onClick={() => window.open('https://discord.gg/YwGVj2V5Qk', '_blank')}
                className={`flex items-center gap-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 rounded-xl font-medium text-[15.5px] transition-all text-left w-full ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Discord"
              >
                <MessageSquare size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Discord</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Profile Card / Footer inside Sidebar */}
        <div className={`p-4 border-t border-stone-200/60 flex flex-col gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'items-center px-2' : ''}`}>
          
          {isSidebarCollapsed ? (
            /* Collapsed State: Just the avatar with green status dot */
            <button 
              onClick={() => setActiveTab('account')}
              className="relative cursor-pointer hover:scale-105 transition-all w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-[15px] shadow-sm border-none outline-none shrink-0"
              title={`${displayName} - ${subscriptionPlan} Plan (Click to settings)`}
            >
              {displayName.charAt(0)}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white"></span>
            </button>
          ) : (
            /* Expanded State: Creamy Glass User Card (Warm Beige Sand Contrast) */
            <div className="w-full bg-[#EBE5D8]/80 backdrop-blur-[10px] border border-stone-300/60 shadow-[inset_4px_4px_12px_rgba(255,255,255,0.75),inset_-2px_-2px_6px_rgba(0,0,0,0.015),0_10px_25px_rgba(28,25,23,0.02)] p-4 rounded-2xl flex flex-col gap-3.5 text-stone-800 select-none">
              
              {/* Profile Details */}
              <div 
                onClick={() => setActiveTab('account')}
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {displayName.charAt(0)}
                  </div>
                  {/* Green status dot */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#EDE7DC]"></span>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-[14px] tracking-tight truncate text-stone-900 leading-none mb-0.5">{displayName}</span>
                  <span className="text-stone-500 text-[11px] font-semibold truncate leading-none">@{displayName.toLowerCase().replace(/\s+/g, '_')}</span>
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div className="flex flex-col gap-2">
                {/* Upgrade Button */}
                <button 
                  onClick={() => handleSubscribe('Monthly')}
                  className="w-full py-1.5 pl-1.5 pr-4 bg-stone-950/5 hover:bg-stone-950/10 active:scale-98 border border-stone-900/5 rounded-full flex items-center gap-2.5 transition-all cursor-pointer text-left shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-stone-800 tracking-wide">Upgrade Now</span>
                </button>

                {/* Logout Button inside the Card */}
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-2 bg-red-50/70 hover:bg-red-100/90 active:scale-98 border border-red-100/80 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer text-red-600 text-[11px] font-bold shadow-sm"
                >
                  <LogOut size={13} className="shrink-0" />
                  Logout
                </button>
              </div>

            </div>
          )}

        </div>
      </aside>

      {/* Main Content Pane - Automatically stretches dynamically when sidebar collapses */}
      <main className="flex-1 p-4 sm:p-8 pt-10 sm:pt-16 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
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
                    <span className={`text-[16.5px] font-semibold px-5 py-2.5 rounded-full border ${
                      wordCount > MAX_WORDS
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
                className={`px-16 py-5 text-xl font-bold rounded-xl text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 ${
                  isAnalyzing || wordCount > MAX_WORDS
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
                              <span className={`text-2xl font-black uppercase ${
                                resultsData.misinfoRisk === 'High' 
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
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  resultsData.misinfoRisk === 'High' 
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
          <div className="w-full flex flex-col items-center">
            {/* Header section matching cream style */}
            <div className="max-w-2xl text-center mb-12 mt-4">
              <h1 className="text-[36px] sm:text-[42px] font-bold tracking-tight text-stone-800 mb-5 leading-[1.1]">
                Choose Your Subscription<br />Plan
              </h1>
              <p className="text-stone-500 max-w-xl mx-auto text-[15px] font-medium leading-relaxed">
                Select the best plan to detect AI generated content and misinformation with surgical precision.
              </p>
            </div>

            {/* Plan Cards list - styled cleanly with custom HSL borders, shadows and colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px] items-stretch text-left">
              
              {/* Weekly Plan */}
              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border border-stone-200/60 shadow-[0_15px_40px_rgba(28,25,23,0.015)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(28,25,23,0.03)]">
                <div className="mb-6 text-left">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Weekly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$5</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/week</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe('Weekly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-stone-100 text-stone-800 hover:bg-stone-200/80 active:scale-98"
                >
                  Subscribe Weekly
                </button>

                <ul className="flex-1 space-y-4">
                  {[
                    "50 detections",
                    "Human vs AI",
                    "Basic misinformation",
                    "Standard speed"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} strokeWidth={4.5} className="text-[#1FA463]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Monthly Plan (Highlighted) */}
              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border-2 border-[#1FA463] shadow-[0_25px_60px_rgba(31,164,99,0.08)] pt-11 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(31,164,99,0.12)]">
                
                {/* Most Popular Badge */}
                <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-[6px] bg-[#1FA463] text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider whitespace-nowrap z-10 shadow-sm shadow-[#1FA463]/30">
                  Most Popular
                </span>

                <div className="mb-6 text-left">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Monthly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$20</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/month</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe('Monthly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-[#1FA463] text-white hover:bg-[#178a52] shadow-md shadow-[#1FA463]/20 active:scale-98"
                >
                  Subscribe Monthly
                </button>

                <ul className="flex-1 space-y-4">
                  {[
                    "Unlimited detections",
                    "Humanized AI detection",
                    "Advanced misinformation",
                    "Detailed reports",
                    "Faster processing"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} strokeWidth={4.5} className="text-[#1FA463]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Yearly Plan */}
              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border border-stone-200/60 shadow-[0_15px_40px_rgba(28,25,23,0.015)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(28,25,23,0.03)]">
                <div className="mb-6 text-left">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Yearly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$250</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/year</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSubscribe('Yearly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-stone-100 text-stone-800 hover:bg-stone-200/80 active:scale-98"
                >
                  Subscribe Yearly
                </button>
                <ul className="flex-1 space-y-4">
                  {[
                    "Unlimited detection",
                    "Advanced features",
                    "Downloadable reports",
                    "API access",
                    "Priority support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} strokeWidth={4.5} className="text-[#1FA463]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          /* FAQ Subview matching homepage */
          <div className="w-full flex flex-col items-center">
            {/* Header section matching cream style */}
            <div className="max-w-2xl text-center mb-12 mt-4">
              <h1 className="text-[36px] sm:text-[42px] font-black tracking-tight text-stone-900 mb-5 leading-[1.1]">
                FAQs about VeritasAI
              </h1>
              <p className="text-stone-500 max-w-xl mx-auto text-[15px] font-medium leading-relaxed">
                Everything you need to know about VeritasAI and our detection systems.
              </p>
            </div>

            {/* Accordion container matching homepage cream styling */}
            <div className="flex flex-col gap-4 w-full max-w-[850px]">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndices.includes(index);
                return (
                  <div 
                    key={index} 
                    className={`border bg-white rounded-2xl overflow-hidden transition-all duration-300 w-full ${
                      isOpen 
                        ? 'border-[#1FA463]/35 shadow-[0_10px_30px_rgba(31,164,99,0.025)]' 
                        : 'border-stone-200/80 shadow-[0_4px_20px_rgba(28,25,23,0.015)]'
                    } hover:border-[#1FA463] hover:shadow-[0_12px_40px_rgba(31,164,99,0.05)]`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-6 text-left font-semibold text-base sm:text-lg text-stone-900 hover:text-[#1FA463] transition-colors select-none"
                    >
                      <span>{faq.question}</span>
                      <span className="text-[#1FA463] shrink-0 ml-4 transition-transform duration-200">
                        {isOpen ? <Minus size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
                      </span>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[300px] border-t border-stone-100 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="p-6 text-stone-600 text-sm leading-relaxed font-medium bg-[#FCFAF7]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
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
                    className={`flex items-center gap-2 pb-3.5 px-1 text-sm font-semibold tracking-tight transition-all relative cursor-pointer select-none ${
                      isActive 
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
        {activeTab !== 'account' && <Footer className="!mt-16 md:!mt-24" />}
      </main>

    </div>
  );
};

export default Detector;
