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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';

const Detector = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiDetection, setAiDetection] = useState(true);
  const [misinformation, setMisinformation] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  
  // Account subview states
  const [accountSubTab, setAccountSubTab] = useState('general');
  const [displayName, setDisplayName] = useState('Sulav Sharma');
  const [emailAddress, setEmailAddress] = useState('sulav2080-0306@iimscollege.edu.np');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Onboarding survey states
  const [surveyData, setSurveyData] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    experience: '',
    detectorUsed: '',
    heardAboutUs: '',
    purpose: '',
    frequency: '',
    updates: '',
    helpText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const completed = localStorage.getItem('veritas_onboarding_completed');
    if (!completed) {
      setShowSurveyModal(true);
    } else if (completed !== 'skipped') {
      try {
        setSurveyData(JSON.parse(completed));
      } catch (e) {
        // ignore errors
      }
    }
  }, [router]);

  const handleOnboardingSelect = (field, value) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setOnboardingStep(prev => prev - 1);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('veritas_onboarding_completed', 'skipped');
    setShowSurveyModal(false);
    setOnboardingStep(1);
  };

  const handleSubmitOnboarding = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      localStorage.setItem('veritas_onboarding_completed', JSON.stringify(onboardingData));
      setSurveyData(onboardingData);
      setTimeout(() => {
        setShowSurveyModal(false);
        setIsSuccess(false);
        setOnboardingStep(1);
      }, 1500);
    }, 1000);
  };

  const onboardingQuestions = {
    role: {
      question: "What best describes you?",
      options: ["Student", "Teacher", "Researcher", "Content Creator", "Business Professional", "Other"]
    },
    heardAboutUs: {
      question: "How did you hear about us?",
      options: ["Google Search", "Social Media", "Friend/Colleague", "YouTube", "School/University", "Other"]
    },
    detectorUsed: {
      question: "Have you used an AI detector before?",
      options: ["Yes, frequently", "Yes, a few times", "No, this is my first time"]
    },
    purpose: {
      question: "What do you plan to use this website for?",
      options: ["Checking assignments", "Detecting AI-generated content", "Academic research", "Content writing", "Business use", "Other"]
    },
    frequency: {
      question: "How often do you expect to use this platform?",
      options: ["Daily", "Weekly", "Monthly", "Occasionally"]
    },
    updates: {
      question: "Would you like product updates and tips?",
      options: ["Yes", "No"]
    },
    experience: {
      question: "What is your experience level with AI tools?",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    helpText: {
      question: "Is there anything specific you'd like us to help you with?"
    }
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    alert('General profile changes saved successfully!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    alert('Password updated successfully!');
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

  const handleInput = (e) => {
    setError('');
    const textVal = e.target.innerText || '';
    setIsEmpty(textVal.trim() === '');
    const words = textVal.trim() === '' ? 0 : textVal.trim().split(/\s+/).length;
    setWordCount(words);
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
    setIsEmpty(textVal.trim() === '');
    const words = textVal.trim() === '' ? 0 : textVal.trim().split(/\s+/).length;
    setWordCount(words);
  };

  const handlePasteClick = async () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        document.execCommand('insertText', false, clipboardText);
        const textVal = editorRef.current.innerText || '';
        setIsEmpty(textVal.trim() === '');
        const words = textVal.trim() === '' ? 0 : textVal.trim().split(/\s+/).length;
        setWordCount(words);
      }
    } catch (err) {
      alert("Please use Ctrl+V to paste or grant clipboard permission to the browser.");
    }
  };

  const handleAnalyze = () => {
    const plainText = editorRef.current ? editorRef.current.innerText || '' : '';
    if (plainText.trim().length < 20) {
      setError('Please enter at least 20 characters to analyze.');
      return;
    }
    setError('');
    setIsAnalyzing(true);

    // Save states to localStorage for results page
    localStorage.setItem('veritas_text', plainText);
    localStorage.setItem('veritas_aiDetection', aiDetection.toString());
    localStorage.setItem('veritas_misinformation', misinformation.toString());

    setTimeout(() => {
      router.push('/result');
    }, 900);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (editorRef.current) {
        editorRef.current.innerText = ev.target.result;
        setIsEmpty(ev.target.result.trim() === '');
        const words = ev.target.result.trim() === '' ? 0 : ev.target.result.trim().split(/\s+/).length;
        setWordCount(words);
        setError('');
      }
    };
    reader.readAsText(file);
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

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
          <div className={`flex items-center gap-3 w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}>
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
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all w-full text-left ${
                activeTab === 'dashboard'
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

            <button 
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all w-full text-left ${
                activeTab === 'detector'
                  ? 'bg-stone-900 text-white shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
              } ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2.5'
              }`}
              title="AI Content Detector"
            >
              <ShieldCheck size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">AI Detector</span>}
            </button>

            {/* Account Section */}
            <div className="flex flex-col gap-2 w-full">
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase px-4 whitespace-nowrap">Account</span>
              )}
              <button 
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full ${
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
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full ${
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
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase px-4 whitespace-nowrap">Help</span>
              )}
              <button 
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full ${
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
                onClick={() => alert('Support desk placeholder')}
                className={`flex items-center gap-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 rounded-xl font-medium text-sm transition-all text-left w-full ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Support"
              >
                <LifeBuoy size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Support</span>}
              </button>
              <button 
                onClick={() => window.open('https://discord.gg', '_blank')}
                className={`flex items-center gap-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 rounded-xl font-medium text-sm transition-all text-left w-full ${
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
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 w-full rounded-xl transition text-left cursor-pointer hover:bg-stone-100/50 ${isSidebarCollapsed ? 'justify-center' : 'px-2 py-1.5'}`}
          >
            <div className="w-9 h-9 rounded-full bg-[#7B82FF] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {displayName.charAt(0)}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-stone-900 font-bold text-sm truncate">{displayName}</span>
                <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">Free Plan</span>
              </div>
            )}
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('veritas_onboarding_completed');
              router.push('/login');
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 text-sm font-semibold transition-all ${
              isSidebarCollapsed ? 'p-2.5' : 'w-full py-2.5'
            }`}
            title="Logout"
          >
            <LogOut size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Pane - Automatically stretches dynamically when sidebar collapses */}
      <main className="flex-1 p-8 sm:p-10 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
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
                  <span className="text-lg font-black text-stone-800 tracking-tight">Free Tier</span>
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
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                          scan.score > 50 
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-8 text-center tracking-tight">
              AI Content &amp; Misinformation Detector
            </h1>

            <div className="flex flex-col gap-6 w-full">
              {/* Main Card container */}
              <Card className="flex flex-col min-h-[520px] bg-white border border-stone-200/40 shadow-[0_20px_50px_rgba(28,25,23,0.02)] p-8 sm:p-9 rounded-3xl transition-all duration-300">
                {/* Toggles */}
                <div className="flex items-center gap-6 mb-6 flex-wrap">
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

                {/* Rich-Text Input area with contentEditable */}
                <div className="relative flex-1 flex flex-col">
                  {isEmpty && (
                    <div className="absolute top-6 left-6 text-stone-400 pointer-events-none select-none text-base">
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
                    className="flex-1 w-full p-6 text-stone-700 bg-stone-50/30 rounded-2xl border border-stone-200/40 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 overflow-y-auto text-base leading-relaxed transition min-h-[380px] sm:min-h-[420px] focus:border-[#1FA463] outline-none"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  />
                </div>

                {/* Toolbar + Upload + Word Count */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* File Upload Trigger */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-sm font-semibold transition"
                    >
                      <Upload size={16} />
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
                  <div className="flex items-center gap-1 border border-stone-200/60 bg-stone-50/50 rounded-xl px-2 py-1 shadow-sm self-center sm:self-auto">
                    <button 
                      type="button" 
                      onClick={handlePasteClick}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" 
                      title="Paste from clipboard"
                    >
                      <Clipboard size={16} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('undo')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Undo"
                    >
                      <Undo size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('redo')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Redo"
                    >
                      <Redo size={16} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => alert('Text formatting options')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" 
                      title="Text Size"
                    >
                      <Type size={16} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('bold')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-bold" 
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('italic')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors italic" 
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('underline')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors underline" 
                      title="Underline"
                    >
                      <Underline size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('createLink')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" 
                      title="Insert Link"
                    >
                      <Link size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => alert('More editing options')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" 
                      title="More options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Word Count Pill */}
                  <div className="flex items-center justify-end">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
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
            <div className="mt-8 flex justify-center">
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || wordCount > MAX_WORDS}
                className={`px-12 py-3.5 text-md font-bold rounded-xl text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 ${
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
          </>
        )}

        {activeTab === 'plans' && (
          /* Plans & Pricing Subview */
          <div className="w-full flex flex-col items-center">
            {/* Header section matching cream style */}
            <div className="max-w-2xl text-center mb-12 mt-4">
              <h1 className="text-[36px] sm:text-[42px] font-black tracking-tight text-stone-900 mb-5 leading-[1.1]">
                Choose Your Subscription<br />Plan
              </h1>
              <p className="text-stone-500 max-w-xl mx-auto text-[15px] font-medium leading-relaxed">
                Select the best plan to detect AI generated content and misinformation with surgical precision.
              </p>
            </div>

            {/* Plan Cards list - styled cleanly with custom HSL borders, shadows and colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px] items-stretch">
              
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
                  onClick={() => router.push('/payment?planName=Weekly%20Plan&planPrice=%245')}
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
                  onClick={() => router.push('/payment?planName=Monthly%20Plan&planPrice=%2420')}
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
                  onClick={() => router.push('/payment?planName=Yearly%20Plan&planPrice=%24250')}
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
                    Free
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
                      onClick={() => alert('Successfully signed out of all other sessions.')}
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
                          alert('Account deletion request received.');
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
                      <h3 className="text-2xl font-black text-stone-900 tracking-tight">Free Plan</h3>
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

      {/* Onboarding Survey Popup Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-stone-200/50 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Background elements inside modal */}
            <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] bg-gradient-to-br from-[#7755FF]/5 to-[#4F33FF]/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {isSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-5">
                <div className="w-16 h-16 bg-[#1FA463]/10 text-[#1FA463] rounded-full flex items-center justify-center animate-bounce">
                  <Check size={32} strokeWidth={3} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-black text-stone-900 tracking-tight">Survey Completed!</h3>
                  <p className="text-stone-500 font-semibold text-sm max-w-sm">
                    Thank you for your valuable feedback. Preparing your dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Header & Progress Bar */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <span>Onboarding Survey</span>
                    <span>Step {onboardingStep} of 4</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="h-1.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7755FF] to-[#1FA463] rounded-full transition-all duration-300"
                      style={{ width: `${(onboardingStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step contents */}
                <div className="min-h-[300px] flex flex-col justify-start gap-6 py-2">
                  
                  {/* Step 1: Role & Experience */}
                  {onboardingStep === 1 && (
                    <div className="flex flex-col gap-6 text-left">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.role.question}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {onboardingQuestions.role.options.map((opt) => {
                            const isSelected = onboardingData.role === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('role', opt)}
                                className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm shadow-[#7B82FF]/10' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check size={16} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.experience.question}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {onboardingQuestions.experience.options.map((opt) => {
                            const isSelected = onboardingData.experience === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('experience', opt)}
                                className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl border text-center text-sm font-semibold transition-all ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm shadow-[#7B82FF]/10' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Detector Usage & Source */}
                  {onboardingStep === 2 && (
                    <div className="flex flex-col gap-6 text-left">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.detectorUsed.question}
                        </label>
                        <div className="flex flex-col gap-2.5">
                          {onboardingQuestions.detectorUsed.options.map((opt) => {
                            const isSelected = onboardingData.detectorUsed === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('detectorUsed', opt)}
                                className={`px-5 py-3.5 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check size={16} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.heardAboutUs.question}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {onboardingQuestions.heardAboutUs.options.map((opt) => {
                            const isSelected = onboardingData.heardAboutUs === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('heardAboutUs', opt)}
                                className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check size={16} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Purpose & Frequency */}
                  {onboardingStep === 3 && (
                    <div className="flex flex-col gap-6 text-left">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.purpose.question}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {onboardingQuestions.purpose.options.map((opt) => {
                            const isSelected = onboardingData.purpose === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('purpose', opt)}
                                className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check size={16} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900 font-sans">
                          {onboardingQuestions.frequency.question}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {onboardingQuestions.frequency.options.map((opt) => {
                            const isSelected = onboardingData.frequency === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('frequency', opt)}
                                className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check size={16} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Updates & Submission */}
                  {onboardingStep === 4 && (
                    <div className="flex flex-col gap-5 justify-center items-center py-4 text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#7755FF]/20 to-[#7755FF]/5 rounded-2xl flex items-center justify-center mb-1">
                        <Sparkles size={28} className="text-[#7755FF]" />
                      </div>
                      <div className="text-center max-w-md flex flex-col gap-1.5">
                        <h4 className="text-2xl font-black text-stone-900 leading-tight">Join the VeritasAI Community!</h4>
                        <p className="text-stone-500 font-medium text-sm leading-relaxed">
                          We post regular product tips, AI detection research insights, and new feature updates.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 w-full max-w-sm mt-1 text-left">
                        <label className="text-sm font-bold text-stone-700">
                          {onboardingQuestions.updates.question}
                        </label>
                        <div className="flex gap-3">
                          {onboardingQuestions.updates.options.map((opt) => {
                            const isSelected = onboardingData.updates === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleOnboardingSelect('updates', opt)}
                                className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-[#1FA463]/5 border-[#1FA463] text-[#1FA463] shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full max-w-sm text-left">
                        <label className="text-sm font-bold text-stone-700">
                          {onboardingQuestions.helpText.question}
                        </label>
                        <textarea
                          value={onboardingData.helpText}
                          onChange={(e) => handleOnboardingSelect('helpText', e.target.value)}
                          placeholder="Type your response here..."
                          rows={2.5}
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#7B82FF] focus:ring-1 focus:ring-[#7B82FF] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                  
                  {/* Back button */}
                  {onboardingStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 text-sm font-bold transition"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSkipOnboarding}
                      className="text-stone-400 hover:text-stone-600 text-sm font-bold transition px-2 py-2 cursor-pointer"
                    >
                      Skip Onboarding
                    </button>
                  )}

                  {/* Next / Submit button */}
                  {onboardingStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        (onboardingStep === 1 && (!onboardingData.role || !onboardingData.experience)) ||
                        (onboardingStep === 2 && (!onboardingData.detectorUsed || !onboardingData.heardAboutUs)) ||
                        (onboardingStep === 3 && (!onboardingData.purpose || !onboardingData.frequency))
                      }
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-sm font-bold transition shadow-md hover:shadow-lg ${
                        ((onboardingStep === 1 && (!onboardingData.role || !onboardingData.experience)) ||
                         (onboardingStep === 2 && (!onboardingData.detectorUsed || !onboardingData.heardAboutUs)) ||
                         (onboardingStep === 3 && (!onboardingData.purpose || !onboardingData.frequency)))
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                          : 'bg-[#7B82FF] hover:bg-[#6870fa]'
                      }`}
                    >
                      Next
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitOnboarding}
                      disabled={isSubmitting || !onboardingData.updates}
                      className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl text-white text-sm font-bold transition shadow-md hover:shadow-lg ${
                        isSubmitting || !onboardingData.updates
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                          : 'bg-[#1FA463] hover:bg-[#178a52] shadow-[#1FA463]/15'
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                    </button>
                  )}

                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Detector;
