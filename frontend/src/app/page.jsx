"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Target, Users, GraduationCap, Shield, Plus, Minus, 
  Facebook, Linkedin, Twitter, ArrowRight, ArrowLeft, Check, Sparkles, X,
  FileText, Play, UserCircle2, Upload, AlertCircle, LayoutDashboard, User, 
  CreditCard, HelpCircle, LifeBuoy, MessageSquare, LogOut, Clipboard, Undo, 
  Redo, Type, Bold, Italic, Underline, MoreVertical, ChevronLeft, ChevronRight, 
  Lock, CheckCircle, Wallet, Landmark
} from 'lucide-react';
import Footer from '../components/Footer';

const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) { /* SSR or restricted environment */ }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) { /* SSR or restricted environment */ }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) { /* SSR or restricted environment */ }
  }
};

const CardIcon = CreditCard;

import Card from '../components/ui/Card';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import PlanCard from '../components/ui/PlanCard';
import Input from '../components/ui/Input';

// ─── Simulated Analysis Engine ────────────────────────────────────────────────
function analyzeText(text) {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/\W/g, '')));
  const lexicalDiversity = uniqueWords.size / Math.max(wordCount, 1);

  const freq = {};
  words.forEach((w) => {
    const wl = w.toLowerCase().replace(/\W/g, '');
    freq[wl] = (freq[wl] || 0) + 1;
  });
  const repeatedWords = Object.values(freq).filter((c) => c > 3).length;
  const repetitionRatio = repeatedWords / Math.max(uniqueWords.size, 1);

  let aiSignal = 0;
  if (avgWordsPerSentence > 16 && avgWordsPerSentence < 24) aiSignal += 0.25;
  if (lexicalDiversity < 0.55) aiSignal += 0.30;
  if (repetitionRatio > 0.05) aiSignal += 0.20;
  if (wordCount < 30) aiSignal += 0.10;

  aiSignal = Math.min(aiSignal + Math.random() * 0.08, 0.80);

  const aiPct = Math.round(aiSignal * 100);
  const humanPct = Math.round((1 - aiSignal) * 0.88 * 100);
  const humanizedPct = 100 - aiPct - humanPct;
  const authenticity = humanPct;

  const misinfoKeywords = ['fake', 'false', 'hoax', 'conspiracy', 'rumor', 'unverified', 'claim'];
  const misinfoHits = misinfoKeywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const misinfoRisk = misinfoHits > 1 ? 'High' : misinfoHits === 1 ? 'Medium' : 'Low';

  return { aiPct, humanPct, humanizedPct, authenticity, misinfoRisk };
}

function buildHighlightedSegments(text, aiPct) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, i) => {
    const hash = sentence.length + i;
    if (aiPct > 50 && hash % 4 === 0) return { text: sentence, color: 'decoration-red-400' };
    if (hash % 3 === 0) return { text: sentence, color: 'decoration-green-400' };
    if (hash % 5 === 0) return { text: sentence, color: 'decoration-yellow-400' };
    if (aiPct > 35 && hash % 7 === 0) return { text: sentence, color: 'decoration-orange-400' };
    return { text: sentence, color: null };
  });
}

const LegendItem = ({ colorClass, label }) => (
  <div className="flex items-center gap-2">
    <div className={`h-1 w-6 rounded-full ${colorClass}`} />
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

// ─── Shared Layout Wrap ───────────────────────────────────────────────────────
const AppLayout = ({ children, currentView, setCurrentView }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <nav className="h-[70px] bg-[#5A6F78] flex items-center justify-between px-10 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('landing')} className="p-1 pr-3 hover:bg-white/10 rounded-full transition-colors flex items-center">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl tracking-tight leading-tight">Welcome Administrator!</h1>
            <p className="text-sm text-white/90 font-light translate-y-[-2px]">Dashboard Info</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('subscription')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
            Subscription
          </button>
          <button onClick={() => alert('Language selection is currently set to English.')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
            English
          </button>
          <button onClick={() => setCurrentView('feedback')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
            Feedback
          </button>
          <button onClick={() => setCurrentView('landing')} className="bg-[#F36C3D] text-white text-sm font-semibold py-1.5 px-6 rounded-md shadow-sm hover:bg-opacity-90 flex items-center h-[34px] ml-1">
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 p-10 max-w-[1400px] mx-auto w-full">
        {children}
      </main>

      <footer className="mt-10 py-12 flex flex-col items-center justify-center text-center">
        <div className="flex gap-6 text-[13px] text-gray-400 font-semibold mb-8">
          <button onClick={() => setCurrentView('privacy')} className="hover:text-gray-600">Privacy Policy</button>
          <button onClick={() => setCurrentView('terms')} className="hover:text-gray-600">Terms of Service</button>
          <button onClick={() => setCurrentView('contact')} className="hover:text-gray-600">Contact Support</button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-[#1FA463]" />
          <span className="font-bold text-gray-500 text-[15px]">VeritasAI</span>
        </div>
        <p className="text-[#9ca3af] text-[11px] font-medium">© 2026 VeritasAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────
const LandingView = ({ setCurrentView, scrollIntoView }) => {
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const teamRef = useRef(null);
  const faqRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleFaq = (index) => {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] relative overflow-hidden flex flex-col font-sans">
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[350px] bg-gradient-to-r from-transparent via-[#7B82FF]/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[150px] bg-[#7B82FF]/10 blur-[100px] pointer-events-none z-0"></div>

      <header className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 sm:py-5 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/40 shadow-[0_2px_20px_rgba(28,25,23,0.02)] transition-transform duration-300 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-12">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center cursor-pointer hover:opacity-80 transition-all"
            title="Go to Homepage"
          >
            <img 
              src="/Headerfinal.webp" 
              alt="VeritasAI" 
              className="h-10 w-auto object-contain" 
            />
          </div>
          
          <div className="flex items-center gap-8">
            <button onClick={() => setCurrentView('subscription')} className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer">
              Pricing
            </button>
            <button onClick={() => faqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer">
              FAQ
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => setCurrentView('login')} className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer">
            Login
          </button>
          <button onClick={() => setCurrentView('dashboard')} className="bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer">
            Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-32 relative z-10 px-4">
        <div className="text-center max-w-4xl mx-auto flex flex-col gap-6">
          <h1 className="text-[60px] font-extrabold text-stone-900 tracking-tight leading-none">
            About <span className="text-[#7B82FF]">VeritasAI</span>
          </h1>
          <p className="text-stone-600 text-[17px] leading-relaxed max-w-[800px] mx-auto font-medium">
            At VeritasAI, we believe ensuring AI text authenticity should be simple. We're here to help you identify AI-generated content, improve source credibility, and connect with your audience on a deeper level.
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            <button onClick={() => setCurrentView('login')} className="bg-[#1FA463] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#178a52] transition cursor-pointer">
              Get Started Now
            </button>
          </div>
        </div>

        <div className="relative z-20 w-full flex flex-col items-center px-4 mt-16 mb-16">
          <div className="w-full max-w-[1050px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(28,25,23,0.03)] border border-stone-200/40">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-100 w-full">
              <div className="flex flex-col items-center md:items-start text-center md:text-left p-8 md:p-10 gap-4 flex-1">
                <div className="w-[56px] h-[56px] rounded-2xl bg-[#E8F8F5] flex items-center justify-center shadow-sm">
                  <Target size={28} className="text-[#10B981]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[54px] font-black text-[#10B981] tracking-tight leading-none">90%</h3>
                  <p className="font-extrabold text-stone-900 text-xl mt-2">Detection Accuracy</p>
                </div>
                <p className="text-stone-500 text-[15px] leading-relaxed max-w-[280px]">
                  Industry-leading precision tuned specifically to minimize false positives.
                </p>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-10 gap-6 flex-[1.5] border-t md:border-t-0 border-stone-100">
                <h4 className="text-[20px] font-bold text-stone-900 tracking-tight">How we achieve high accuracy</h4>
                <p className="text-stone-600 text-[15px] leading-relaxed font-medium">
                  VeritasAI is built on advanced linguistic analysis and machine learning models. By analyzing structural patterns, vocabulary consistency, and writing entropy, our detector accurately distinguishes between human creativity and AI-generated outputs.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Multi-LLM recognition (GPT, Claude, Gemini)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Sentence burstiness evaluation
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Minimizes false positives for human text
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Linguistic perplexity scoring
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-full py-3.5 px-6 flex items-center gap-3 shadow-[0_10px_30px_rgba(28,25,23,0.03)] border border-stone-200/40">
            <div className="w-[30px] h-[30px] rounded-full bg-[#E5F5ED] flex items-center justify-center">
              <Shield size={16} className="text-[#10B981]" strokeWidth={3} />
            </div>
            <p className="text-[#4B5563] text-[15px] font-medium tracking-tight">
              Your privacy is our priority. We <span className="text-[#10B981] font-bold">never</span> store your content.
            </p>
          </div>
        </div>

        <section id="faq" ref={faqRef} className="relative z-20 w-full max-w-[900px] mx-auto px-4 mt-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-[40px] font-bold text-stone-900 tracking-tight">FAQs about VeritasAI</h2>
            <p className="text-stone-600 text-[16px] mt-3 font-medium">
              Everything you need to know about VeritasAI and our detection systems.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndices.includes(index);
              return (
                <div 
                  key={index} 
                  className={`border bg-white rounded-2xl overflow-hidden transition-all duration-300 w-full ${
                    isOpen 
                      ? 'border-[#1FA463]/35 shadow-[0_10px_30px_rgba(31,164,99,0.025)]' 
                      : 'border-stone-200/80 shadow-[0_4px_20px_rgba(28,25,23,0.02)]'
                  } hover:border-[#1FA463] hover:shadow-[0_12px_40px_rgba(31,164,99,0.05)]`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-base sm:text-lg text-stone-900 hover:text-[#1FA463] transition-colors select-none cursor-pointer"
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
        </section>
      </main>
      
      {/* Stats Section & Privacy Pill */}
      <div className="relative z-20 w-full flex flex-col items-center px-4 mt-12 mb-16">
        {/* Stats Card */}
        <div className="w-full max-w-[1050px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(28,25,23,0.03)] border border-stone-200/40">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-100 w-full">
            
            {/* Left Side: 90% Accuracy Metric */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left p-8 md:p-10 gap-4 flex-1">
              <div className="w-[56px] h-[56px] rounded-2xl bg-[#E8F8F5] flex items-center justify-center shadow-sm">
                <Target size={28} className="text-[#10B981]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[54px] font-black text-[#10B981] tracking-tight leading-none">90%</h3>
                <p className="font-extrabold text-stone-900 text-xl mt-2">Detection Accuracy</p>
              </div>
              <p className="text-stone-500 text-[15px] leading-relaxed max-w-[280px]">
                Industry-leading precision tuned specifically to minimize false positives.
              </p>
            </div>

            {/* Right Side: Detailed explanation */}
            <div className="flex flex-col justify-center p-8 md:p-10 gap-6 flex-[1.5] border-t md:border-t-0 md:border-l border-stone-100">
              <h4 className="text-[20px] font-bold text-stone-900 tracking-tight">How we achieve high accuracy</h4>
              <p className="text-stone-600 text-[15px] leading-relaxed font-medium">
                VeritasAI is built on advanced linguistic analysis and machine learning models. By analyzing structural patterns, vocabulary consistency, and writing entropy, our detector accurately distinguishes between human creativity and AI-generated outputs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-stone-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Multi-LLM recognition (GPT, Claude, Gemini)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Sentence burstiness evaluation
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Minimizes false positives for human text
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Linguistic perplexity scoring
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Privacy Pill */}
        <div className="mt-8 bg-white rounded-full py-3.5 px-6 flex items-center gap-3 shadow-[0_10px_30px_rgba(28,25,23,0.03)] border border-stone-200/40">
          <div className="w-[30px] h-[30px] rounded-full bg-[#E5F5ED] flex items-center justify-center">
            <Shield size={16} className="text-[#10B981]" strokeWidth={3} />
          </div>
          <p className="text-[#4B5563] text-[15px] font-medium tracking-tight">
            Your privacy is our priority. We <span className="text-[#10B981] font-bold">never</span> store your content.
          </p>
        </div>
      </div>



      {/* FAQ Section */}
      <section id="faq" ref={faqRef} className="relative z-20 w-full max-w-[900px] mx-auto px-4 mt-20 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-[40px] font-bold text-stone-900 tracking-tight">FAQs about VeritasAI</h2>
          <p className="text-stone-600 text-[16px] mt-3 font-medium">
            Everything you need to know about VeritasAI and our detection systems.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div 
                key={index} 
                className={`border bg-white rounded-2xl overflow-hidden transition-all duration-300 w-full ${
                  isOpen 
                    ? 'border-[#1FA463]/35 shadow-[0_10px_30px_rgba(31,164,99,0.025)]' 
                    : 'border-stone-200/80 shadow-[0_4px_20px_rgba(28,25,23,0.02)]'
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
      </section>
      
      {/* Footer / Emerging Bottom Container */}
      <Footer className="!mt-16 md:!mt-24" />
    </div>
  );
};

// ─── Login View ───────────────────────────────────────────────────────────────
const LoginView = ({ setCurrentView, setDisplayName, setEmailAddress }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    safeLocalStorage.removeItem('veritas_onboarding_completed');
    if (credentials.username) {
      setDisplayName(credentials.username);
      setEmailAddress(`${credentials.username.toLowerCase()}@capstone.edu`);
    }
    setCurrentView('dashboard');
  };

  return (
    <>
      {showGoogleModal && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center font-sans tracking-normal text-left">
          <div className="bg-[#F0F4F9] w-full max-w-[1040px] sm:rounded-[28px] overflow-hidden flex flex-col pt-6 pb-16 min-h-screen sm:min-h-0 sm:shadow-sm">
            <div className="flex items-center gap-2 px-10 mb-10 sm:mt-0 mt-4">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px] pointer-events-none" />
              <span className="text-[#444746] font-medium text-[15px]">Sign in with Google</span>
            </div>

            <div className="flex flex-col md:flex-row px-10 gap-10 md:gap-20 md:pr-24">
               <div className="flex-1 max-w-[420px]">
                 <div className="flex flex-col gap-5">
                   <div className="w-12 h-12 flex items-center justify-start">
                     <ShieldCheck className="text-[#1FA463] w-[38px] h-[38px]" strokeWidth={2.5} />
                   </div>
                   <h1 className="text-[36px] font-normal leading-[1.2] text-[#1F1F1F]">Choose an account</h1>
                   <p className="text-[16px] text-[#1F1F1F] mt-[-5px]">to continue to <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">VeritasAI</span></p>
                 </div>
               </div>

               <div className="flex-1 flex flex-col items-start min-w-[320px]">
                 <div className="w-full flex flex-col border border-gray-300 sm:border-gray-200 bg-white rounded-3xl overflow-hidden sm:shadow-sm">
                    <button onClick={() => { 
                      safeLocalStorage.removeItem('veritas_onboarding_completed');
                      setDisplayName("Sulav Sharma");
                      setEmailAddress("sulav2080-0306@iimscollege.edu.np");
                      setShowGoogleModal(false); 
                      setCurrentView('dashboard'); 
                    }} className="w-full flex items-center justify-between px-6 py-[15px] hover:bg-[#F8FAFD] transition-colors border-b border-gray-200 text-left cursor-pointer">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[34px] h-[34px] rounded-full bg-[#8E24AA] flex items-center justify-center text-white font-medium text-[15px]">
                          S
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[#1F1F1F] font-medium text-[14px]">Sulav Sharma</span>
                          <span className="text-[#444746] text-[12px] tracking-wide mt-[-2px]">sulav2080-0306@iimscollege.edu.np</span>
                        </div>
                      </div>
                    </button>
                    
                    <button onClick={() => alert('Only this demo account is available right now!')} className="w-full flex items-center px-6 py-[15px] hover:bg-[#F8FAFD] transition-colors text-left group cursor-pointer">
                      <div className="flex items-center gap-3.5">
                        <div className="w-[34px] h-[34px] flex items-center justify-center text-[#444746]">
                          <UserCircle2 size={20} className="text-[#1F1F1F]" strokeWidth={1.5} />
                        </div>
                        <span className="text-[#1F1F1F] font-medium text-[14px]">Use another account</span>
                      </div>
                    </button>
                 </div>

                 <div className="mt-8 text-[12px] text-[#444746] w-full max-w-md leading-[1.6] tracking-wide text-left">
                   Before using this app, you can review VeritasAI's <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">Terms of Service</span>.
                 </div>
               </div>
            </div>
          </div>
          
          <div className="w-full max-w-[1040px] flex items-center justify-between mt-3 px-6 text-[12px] text-[#444746] font-medium">
            <select className="bg-transparent outline-none cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
              <option>English (United Kingdom)</option>
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowGoogleModal(false)} className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors text-gray-400 cursor-pointer">Cancel Mock Auth</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors cursor-pointer">Help</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors cursor-pointer">Privacy</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors cursor-pointer">Terms</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex bg-[#F6F8F9] text-left">
        <div className="hidden lg:flex flex-1 bg-white relative flex-col items-center justify-center p-12 text-center border-r border-gray-100 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border-[50px] border-[#F4FAF7] rounded-full opacity-60 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[40px] border-[#F4FAF7] rounded-full opacity-80 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl flex flex-col items-center">
            <div className="bg-[#E4F5ED] text-[#1FA463] text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 mb-8 tracking-wider uppercase">
              <Sparkles size={14} strokeWidth={2.5} />
              AI Detection, Done Right
            </div>

            <h1 className="text-[54px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
              AI detector made to<br />Preserve what's <span className="text-[#1FA463]">human.</span>
            </h1>

            <p className="text-[#64748B] text-[17px] mb-10 leading-relaxed font-medium">
              VeritasAI detects AI content from ChatGPT, GPT-4, Claude,<br />
              <span className="font-bold text-[#334155]">Gemini and more</span> — and provides you the most<br />
              authentic and meaningful output.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#F0F4F8] rounded-2xl shadow-md p-10 flex flex-col items-center gap-6 relative z-20">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-3xl font-extrabold text-[#1FA463] tracking-tight">VeritasAI</h1>
              <p className="text-gray-500 text-sm">An AI detector System</p>
            </div>

            <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Username:</label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Password:</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  id="login-submit"
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="login-register"
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="flex-1 py-2.5 rounded-full bg-[#F36C3D] hover:bg-[#e05a2b] text-white font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>

            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
                onClick={() => setShowGoogleModal(true)}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 pointer-events-none" />
                Sign in with Google
              </button>
            </div>

            <div className="flex justify-between items-center w-full">
              <span className="bg-[#3B6FB5] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                English
              </span>
              <button 
                type="button"
                onClick={() => setCurrentView('landing')}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Register View ────────────────────────────────────────────────────────────
const RegisterView = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    alert('Administrator account created successfully!');
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F9] py-10 px-4 text-left">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-50 flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="bg-[#5A6F78] px-8 py-5">
          <h1 className="text-white text-xl font-bold">Welcome Administrator!</h1>
        </div>

        <form className="p-8 flex flex-col gap-6" onSubmit={handleCreateAccount}>
          <div className="bg-[#D6E8F5] rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-gray-800 text-center">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-fullname"
                name="fullName"
                type="text"
                required
                placeholder="Enter your complete name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+977-XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FEFAE0] border border-[#E9D96E] rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1FA463] text-center">Account Type</h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="reg-role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F5F5] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition-all duration-300 shadow-sm hover:bg-[#EEEEEE]"
                >
                  <option value="" disabled>Choose your account type</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  ▼
                </div>
              </div>
              <p className="text-xs text-gray-500 italic text-center">
                Choose &apos;Student&apos;, &apos;Teacher&apos;, or &apos;Other&apos;
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              id="reg-submit"
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-0 cursor-pointer"
            >
              Create Account
            </button>
            <button
              id="reg-back"
              type="button"
              onClick={() => setCurrentView('login')}
              className="px-8 py-2.5 rounded-full bg-[#5A6F78] hover:bg-[#4a5c64] text-white font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-0 cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Dashboard View ───────────────────────────────────────────────────────────
const DashboardView = ({ 
  setCurrentView, 
  displayName, 
  setDisplayName, 
  emailAddress, 
  setEmailAddress, 
  setScanText, 
  setScanResults 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiDetection, setAiDetection] = useState(true);
  const [misinformation, setMisinformation] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  
  const [accountSubTab, setAccountSubTab] = useState('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
  const [surveyData, setSurveyData] = useState(null);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const completed = safeLocalStorage.getItem('veritas_onboarding_completed');
    if (!completed) {
      setShowSurveyModal(true);
    } else if (completed !== 'skipped') {
      try {
        setSurveyData(JSON.parse(completed));
      } catch (e) {}
    }
  }, []);

  const handleOnboardingSelect = (field, value) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkipOnboarding = () => {
    safeLocalStorage.setItem('veritas_onboarding_completed', 'skipped');
    setShowSurveyModal(false);
  };

  const handleSubmitOnboarding = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      safeLocalStorage.setItem('veritas_onboarding_completed', JSON.stringify(onboardingData));
      setSurveyData(onboardingData);
      setTimeout(() => {
        setShowSurveyModal(false);
        setIsSuccess(false);
        setOnboardingStep(1);
      }, 1500);
    }, 1000);
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
      if (url) document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, value);
    }
    const textVal = editorRef.current.innerText || '';
    setIsEmpty(textVal.trim() === '');
    setWordCount(textVal.trim() === '' ? 0 : textVal.trim().split(/\s+/).length);
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
        setWordCount(textVal.trim() === '' ? 0 : textVal.trim().split(/\s+/).length);
      }
    } catch (err) {
      alert("Please use Ctrl+V to paste.");
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

    const results = analyzeText(plainText);
    setScanText(plainText);
    setScanResults(results);

    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentView('result');
    }, 900);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (editorRef.current) {
        editorRef.current.innerText = ev.target.result;
        setIsEmpty(false);
        setWordCount(ev.target.result.trim() === '' ? 0 : ev.target.result.trim().split(/\s+/).length);
        setError('');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800 text-left">
      <aside className={`bg-[#FDFBF7] border-r border-stone-200/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out relative ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-[88px] right-0 translate-x-1/2 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 shadow-sm transition z-50 group cursor-pointer"
        >
          {isSidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div className={`flex flex-col gap-6 py-6 transition-all duration-300 ${isSidebarCollapsed ? 'px-3 items-center' : 'px-6'}`}>
          <div className="flex items-center gap-3 w-full cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-lg shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-[22px] tracking-tight text-stone-900 transition-all duration-300 whitespace-nowrap overflow-hidden">
                VeritasAI
              </span>
            )}
          </div>

          <nav className="flex flex-col gap-6 mt-4 w-full">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all w-full text-left cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100/50'
              } ${isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2.5'}`}
            >
              <LayoutDashboard size={18} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button 
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all w-full text-left cursor-pointer ${
                activeTab === 'detector' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100/50'
              } ${isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2.5'}`}
            >
              <ShieldCheck size={18} />
              {!isSidebarCollapsed && <span>AI Detector</span>}
            </button>

            <div className="flex flex-col gap-2 w-full">
              {!isSidebarCollapsed && <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase px-4">Account</span>}
              <button 
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full cursor-pointer ${
                  activeTab === 'account' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100/50'
                } ${isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
              >
                <User size={18} />
                {!isSidebarCollapsed && <span>Account</span>}
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full cursor-pointer ${
                  activeTab === 'plans' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100/50'
                } ${isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
              >
                <CreditCard size={18} />
                {!isSidebarCollapsed && <span>Plans & Pricing</span>}
              </button>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {!isSidebarCollapsed && <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase px-4">Help</span>}
              <button 
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-3 rounded-xl text-sm transition-all text-left w-full cursor-pointer ${
                  activeTab === 'faq' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100/50'
                } ${isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
              >
                <HelpCircle size={18} />
                {!isSidebarCollapsed && <span>FAQ</span>}
              </button>
            </div>
          </nav>
        </div>

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
                <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">Free Plan</span>
              </div>
            )}
          </button>
          <button 
            onClick={() => {
              safeLocalStorage.removeItem('veritas_onboarding_completed');
              setCurrentView('login');
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50/30 text-sm font-semibold transition-all cursor-pointer ${
              isSidebarCollapsed ? 'p-2.5' : 'w-full py-2.5'
            }`}
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 sm:p-10 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto text-left">
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
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
                  className="px-6 py-3 bg-white text-stone-900 font-bold rounded-2xl hover:bg-stone-50 hover:scale-[1.02] active:scale-98 transition shadow-md flex items-center gap-2 cursor-pointer text-sm"
                >
                  Start New Scan
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

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
                    className="text-xs font-bold text-[#7755FF] hover:underline cursor-pointer"
                  >
                    Upgrade
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-stone-400 mt-1">
                  5,000 words limit per scan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">No Profile Data</span>
                    <button onClick={() => setShowSurveyModal(true)} className="text-[#7B82FF] text-xs font-bold hover:underline cursor-pointer">Start Survey</button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-stone-200/50 rounded-[32px] p-6 md:p-8 shadow-[0_15px_40px_rgba(28,25,23,0.015)] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Recent Activity</h3>
                    <p className="text-stone-400 text-xs font-medium">Your most recent scans.</p>
                  </div>
                  <button onClick={() => setActiveTab('detector')} className="text-xs font-bold text-[#7755FF] hover:underline cursor-pointer">View All</button>
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
              <Card className="flex flex-col min-h-[520px] bg-white border border-stone-200/40 shadow-[0_20px_50px_rgba(28,25,23,0.02)] p-8 sm:p-9 rounded-3xl transition-all duration-300">
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
                    className="flex-1 w-full p-6 text-stone-700 bg-stone-50/30 rounded-2xl border border-stone-200/40 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 overflow-y-auto text-base leading-relaxed transition min-h-[380px] sm:min-h-[420px] focus:border-[#1FA463] outline-none text-left"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  />
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-sm font-semibold transition cursor-pointer"
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

                  <div className="flex items-center gap-1 border border-stone-200/60 bg-stone-50/50 rounded-xl px-2 py-1 shadow-sm self-center sm:self-auto">
                    <button 
                      type="button" 
                      onClick={handlePasteClick}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer" 
                      title="Paste"
                    >
                      <Clipboard size={16} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('undo')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Undo"
                    >
                      <Undo size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('redo')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Redo"
                    >
                      <Redo size={16} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('bold')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-bold cursor-pointer" 
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('italic')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors italic cursor-pointer" 
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFormat('underline')}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors underline cursor-pointer" 
                      title="Underline"
                    >
                      <Underline size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      wordCount > 5000 ? 'bg-red-50 text-red-500 border-red-200' : 'bg-stone-100 text-stone-500 border-stone-200/60'
                    }`}>
                      {wordCount} / 5000 words
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}
              </Card>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || wordCount > 5000}
                className={`px-12 py-3.5 text-md font-bold rounded-xl text-white shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 cursor-pointer ${
                  isAnalyzing || wordCount > 5000
                    ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                    : 'bg-[#1FA463] hover:bg-[#178a52] hover:-translate-y-0.5 shadow-[#1FA463]/25'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'plans' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="max-w-2xl text-center mb-12 mt-4">
              <h1 className="text-[36px] sm:text-[42px] font-black tracking-tight text-stone-900 mb-5 leading-[1.1]">
                Choose Your Subscription<br />Plan
              </h1>
              <p className="text-stone-500 max-w-xl mx-auto text-[15px] font-medium leading-relaxed">
                Select the best plan to detect AI generated content and misinformation with surgical precision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px] items-stretch">
              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border border-stone-200/60 shadow-[0_15px_40px_rgba(28,25,23,0.015)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(28,25,23,0.03)] text-left">
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Weekly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$5</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/week</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('checkout-weekly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-stone-100 text-stone-800 hover:bg-stone-200/80 active:scale-98 cursor-pointer"
                >
                  Subscribe Weekly
                </button>

                <ul className="flex-1 space-y-4">
                  {["50 detections", "Human vs AI", "Basic misinformation", "Standard speed"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} className="text-[#1FA463]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border-2 border-[#1FA463] shadow-[0_25px_60px_rgba(31,164,99,0.08)] pt-11 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_30px_70px_rgba(31,164,99,0.12)] text-left">
                <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-[6px] bg-[#1FA463] text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider whitespace-nowrap z-10 shadow-sm shadow-[#1FA463]/30">
                  Most Popular
                </span>

                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Monthly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$20</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/month</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('checkout-monthly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-[#1FA463] text-white hover:bg-[#178a52] shadow-md shadow-[#1FA463]/20 active:scale-98 cursor-pointer"
                >
                  Subscribe Monthly
                </button>

                <ul className="flex-1 space-y-4">
                  {["Unlimited detections", "Humanized AI detection", "Advanced misinformation", "Detailed reports", "Faster processing"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} className="text-[#1FA463]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex flex-col h-full bg-white rounded-3xl p-8 border border-stone-200/60 shadow-[0_15px_40px_rgba(28,25,23,0.015)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(28,25,23,0.03)] text-left">
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-stone-900 mb-1">Yearly Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 leading-none tracking-tight">$250</span>
                    <span className="text-stone-400 font-medium text-[13px] ml-1">/year</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('checkout-yearly')}
                  className="w-full py-3 rounded-xl font-bold text-[13px] mb-8 transition-all duration-200 bg-stone-100 text-stone-800 hover:bg-stone-200/80 active:scale-98 cursor-pointer"
                >
                  Subscribe Yearly
                </button>

                <ul className="flex-1 space-y-4">
                  {["Unlimited detection", "Advanced features", "Downloadable reports", "API access", "Priority support"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[13px] text-stone-500 font-medium">
                      <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0 bg-[#1FA463]/5">
                        <Check size={10} className="text-[#1FA463]" />
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
          <div className="w-full flex flex-col items-center">
            <div className="max-w-2xl text-center mb-12 mt-4">
              <h1 className="text-[36px] sm:text-[42px] font-black tracking-tight text-stone-900 mb-5 leading-[1.1]">
                FAQs about VeritasAI
              </h1>
              <p className="text-stone-500 max-w-xl mx-auto text-[15px] font-medium leading-relaxed">
                Everything you need to know about VeritasAI and our detection systems.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[850px]">
              {[
                { question: "What is VeritasAI?", answer: "VeritasAI is a leading AI content and misinformation detector designed to analyze text and determine if it was authored by humans or generated by artificial intelligence tools." },
                { question: "How does AI detection work?", answer: "VeritasAI uses machine learning models trained on millions of pages of human-written and AI-generated text. It analyzes linguistic patterns to determine authenticity." },
                { question: "Is VeritasAI accurate?", answer: "Yes, VeritasAI operates at a 90% accuracy rate, minimizing false positives while reliably flagging AI-generated text." },
              ].map((faq, index) => {
                const isOpen = openFaqIndices.includes(index);
                return (
                  <div key={index} className="border bg-white rounded-2xl overflow-hidden transition-all duration-300 w-full hover:border-[#1FA463]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndices(isOpen ? openFaqIndices.filter(i => i !== index) : [...openFaqIndices, index])}
                      className="w-full flex items-center justify-between p-6 text-left font-semibold text-base text-stone-900 hover:text-[#1FA463] cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <span className="text-[#1FA463]">{isOpen ? '-' : '+'}</span>
                    </button>
                    {isOpen && (
                      <p className="p-6 text-stone-600 text-sm leading-relaxed font-medium bg-[#FCFAF7] border-t border-stone-100">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="w-full flex flex-col items-start max-w-[850px] mx-auto text-left">
            <div className="flex items-center gap-5 mb-8 text-left w-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                {displayName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-none">{displayName}</h2>
                  <span className="px-2.5 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-stone-200/60">
                    Free
                  </span>
                </div>
                <span className="text-stone-400 text-sm font-medium mt-1 truncate">{emailAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-stone-200/60 pb-px mb-8 w-full">
              {['general', 'security', 'billing'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAccountSubTab(tab)}
                  className={`pb-3.5 px-1 text-sm font-semibold tracking-tight transition-all relative cursor-pointer select-none uppercase ${
                    accountSubTab === tab ? 'text-stone-900 border-b-2 border-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full flex flex-col gap-6">
              {accountSubTab === 'general' && (
                <div className="w-full bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                  <h3 className="text-lg font-bold text-stone-900 mb-1">General Information</h3>
                  <p className="text-stone-400 text-[13px] font-medium mb-6">Update your display name and personal details</p>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert('Saved Display Name!'); }} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Display Name</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-stone-50/50 border border-stone-200/80 focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] focus:outline-none text-stone-800 rounded-xl px-4 py-2.5 text-[14px] font-medium transition"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={emailAddress}
                        disabled
                        className="w-full bg-stone-100/60 border border-stone-200/60 text-stone-400 cursor-not-allowed rounded-xl px-4 py-2.5 text-[14px] font-medium"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition cursor-pointer">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {accountSubTab === 'security' && (
                <div className="w-full flex flex-col gap-6">
                  <div className="bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Change Password</h3>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Updated password!'); }} className="space-y-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl px-4 py-2.5" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">New Password</label>
                        <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl px-4 py-2.5" />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm cursor-pointer">
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {accountSubTab === 'billing' && (
                <div className="w-full bg-white border border-stone-200/50 shadow-[0_15px_45px_rgba(28,25,23,0.02)] rounded-3xl p-8 sm:p-9 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase mb-1">Current Plan</span>
                      <h3 className="text-2xl font-black text-stone-900 tracking-tight">Free Plan</h3>
                    </div>
                    <button onClick={() => setActiveTab('plans')} className="px-6 py-2.5 bg-[#1FA463] text-white hover:bg-[#178a52] rounded-xl font-bold text-sm cursor-pointer">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showSurveyModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-stone-200/50 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden text-left">
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
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <span>Onboarding Survey</span>
                    <span>Step {onboardingStep} of 4</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7755FF] to-[#1FA463] transition-all duration-300" style={{ width: `${(onboardingStep / 4) * 100}%` }} />
                  </div>
                </div>

                <div className="min-h-[300px] flex flex-col justify-start gap-6 py-2">
                  {onboardingStep === 1 && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900">What best describes you?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {["Student", "Teacher", "Researcher", "Other"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('role', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                onboardingData.role === opt ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF]' : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              <span>{opt}</span>
                              {onboardingData.role === opt && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900">What is your experience level with AI tools?</label>
                        <div className="flex gap-3">
                          {["Beginner", "Intermediate", "Advanced"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('experience', opt)}
                              className={`flex-1 py-3 rounded-2xl border text-center text-sm font-semibold transition-all cursor-pointer ${
                                onboardingData.experience === opt ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF]' : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900">Have you used an AI detector before?</label>
                        <div className="flex flex-col gap-2.5">
                          {["Yes, frequently", "Yes, a few times", "No, this is my first time"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('detectorUsed', opt)}
                              className={`px-5 py-3.5 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                                onboardingData.detectorUsed === opt ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF]' : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 3 && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-lg font-bold text-stone-900">What do you plan to use this website for?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {["Checking assignments", "Detecting AI content", "Academic research", "Other"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('purpose', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                                onboardingData.purpose === opt ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF]' : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 4 && (
                    <div className="flex flex-col gap-5 justify-center items-center py-4 text-center">
                      <h4 className="text-2xl font-black text-stone-900 leading-tight">Join the VeritasAI Community!</h4>
                      <p className="text-stone-500 font-medium text-sm">We send tips and product updates occasionally.</p>
                      
                      <div className="flex flex-col gap-2 w-full max-w-sm mt-4 text-left">
                        <label className="text-sm font-bold text-stone-700">Receive updates?</label>
                        <div className="flex gap-3">
                          {["Yes", "No"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('updates', opt)}
                              className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                onboardingData.updates === opt ? 'bg-[#1FA463] text-white' : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                  {onboardingStep > 1 ? (
                    <button type="button" onClick={() => setOnboardingStep(onboardingStep - 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-bold cursor-pointer">
                      Back
                    </button>
                  ) : (
                    <button type="button" onClick={handleSkipOnboarding} className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer px-2 py-2">
                      Skip Onboarding
                    </button>
                  )}

                  {onboardingStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(onboardingStep + 1)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-sm font-bold bg-[#7B82FF] hover:bg-[#6870fa] cursor-pointer"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitOnboarding}
                      disabled={isSubmitting || !onboardingData.updates}
                      className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl text-white text-sm font-bold cursor-pointer ${
                        isSubmitting || !onboardingData.updates ? 'bg-stone-300' : 'bg-[#1FA463] hover:bg-[#178a52]'
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

// ─── Result View ──────────────────────────────────────────────────────────────
const ResultView = ({ setCurrentView, scanText, scanResults }) => {
  const isAnalyzed = scanResults !== null;

  return (
    <AppLayout currentView="result" setCurrentView={setCurrentView}>
      <div className="flex flex-col lg:flex-row gap-8 text-left">
        <div className="flex-[2] flex flex-col gap-6">
          <Card className="flex-1 min-h-[500px] p-0 overflow-hidden relative bg-white border border-stone-200">
            {!isAnalyzed ? (
              <div className="w-full h-full min-h-[500px] p-6 flex items-center justify-center text-gray-400">
                <p>No text to display. Go back and enter some text.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed text-base space-y-4">
                  {buildHighlightedSegments(scanText, scanResults.aiPct).map((seg, i) => (
                    <span
                      key={i}
                      className={seg.color ? `underline ${seg.color} decoration-2 underline-offset-4` : undefined}
                    >
                      {seg.text}{' '}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-6 items-center bg-white p-4 rounded-xl shadow border border-gray-100">
            <LegendItem colorClass="bg-red-400" label="AI Probability" />
            <LegendItem colorClass="bg-green-400" label="Human Probability" />
            <LegendItem colorClass="bg-yellow-400" label="Humanized AI" />
            <LegendItem colorClass="bg-orange-400" label="Misinformation Risk" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-[#1FA463] rounded-2xl p-6 flex flex-col items-center text-white shadow-lg">
            <h3 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Overall Authenticity</h3>
            <div className="text-6xl font-extrabold mb-4">
              {isAnalyzed ? `${scanResults.authenticity}%` : '0%'}
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full mb-6">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000"
                style={{ width: isAnalyzed ? `${scanResults.authenticity}%` : '0%' }}
              />
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">AI Generated</span>
                <span className="text-sm font-bold">{isAnalyzed ? `${scanResults.aiPct}%` : '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Human Written</span>
                <span className="text-sm font-bold">{isAnalyzed ? `${scanResults.humanPct}%` : '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Misinformation Risk</span>
                <span className="text-sm font-bold uppercase text-xs">
                  {isAnalyzed ? scanResults.misinfoRisk : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1FA463] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 text-base">Detection Tip</h3>
            <p className="text-sm text-white/85 leading-relaxed">
              {isAnalyzed && scanResults.aiPct > 50
                ? 'This text shows patterns common in AI writing — uniform sentence length and low lexical diversity. Consider reviewing critical sections.'
                : 'Sentences with varying lengths and structures are more likely to be human-written.'}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('report')}
            disabled={!isAnalyzed}
            className="w-full py-4 text-lg font-bold bg-[#7B82FF] hover:bg-[#6870fa] text-white rounded-xl shadow transition cursor-pointer"
          >
            View Detailed Report
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── Report View ──────────────────────────────────────────────────────────────
const ReportView = ({ setCurrentView, scanResults }) => {
  const isAnalyzed = scanResults !== null;

  return (
    <AppLayout currentView="report" setCurrentView={setCurrentView}>
      <div className="flex flex-col gap-10 text-left">
        <h1 className="text-3xl font-bold text-gray-800">Detection Analysis Report</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Human Written" value={isAnalyzed ? `${scanResults.humanPct}%` : "78%"} color="bg-[#1FA463]" />
          <StatCard label="AI Generated" value={isAnalyzed ? `${scanResults.aiPct}%` : "12%"} color="bg-[#F36C3D]" />
          <StatCard label="Misinformation Risk" value={isAnalyzed ? scanResults.misinfoRisk : "Low"} color="bg-yellow-400" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <Card className="flex-[2] flex flex-col p-6 bg-white border border-stone-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Text Analysis Summary</h3>
            <div className="flex-1 text-gray-600 leading-relaxed text-[15px] space-y-5">
              <p>
                The provided text shows a high degree of <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">structural diversity</span> typical of human-authored content. The sentence lengths vary significantly, and the word choice reflects a nuanced understanding of the subject matter.
              </p>
              <p>
                However, certain paragraphs exhibit <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-semibold">repetitive phrasings</span> often associated with Large Language Models. These patterns are particularly evident in the technical descriptions.
              </p>
              <p>
                The misinformation detection engine flagged early portions of the text as having a <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-semibold">low risk</span>, mainly due to the alignment with established data points in our knowledge base.
              </p>
            </div>
          </Card>

          <div className="flex-1 flex flex-col gap-6">
            <Card className="p-6 bg-white border border-stone-200">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Detection Breakdown</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Model Used</p>
                  <p className="text-lg font-bold text-gray-800">VeritasAI BERT v2.0</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Analysis Confidence</p>
                  <p className="text-lg font-bold text-gray-800">98.2%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Risk Classification</p>
                  <p className="text-lg font-bold text-[#1FA463] uppercase">Low Risk</p>
                </div>
              </div>
            </Card>

            <div className="bg-[#1e3a5f] rounded-xl shadow-lg border border-[#2a4d72] flex flex-col items-center text-center py-10 px-6">
              <h3 className="text-xl font-bold mb-2 text-white">Upgrade to Pro</h3>
              <p className="text-blue-200/80 text-sm mb-8 max-w-[220px]">Get access to advanced deepfake detection and API access.</p>
              <button onClick={() => setCurrentView('subscription')} className="w-full bg-white hover:bg-gray-50 text-[#1FA463] py-3.5 rounded-xl font-bold transition cursor-pointer shadow-md">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── Subscription / Pricing View ──────────────────────────────────────────────
const SubscriptionView = ({ setCurrentView }) => {
  return (
    <AppLayout currentView="subscription" setCurrentView={setCurrentView}>
      <div className="max-w-6xl mx-auto text-center mb-16 pt-6">
        <h1 className="text-[42px] font-black tracking-tight text-[#0f172a] mb-6 leading-[1.1] max-w-[440px] mx-auto text-center">
          Choose Your Subscription<br />Plan
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-[15px] font-medium text-center">
          Select the best plan to detect AI generated content and misinformation with surgical precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
        <PlanCard
          title="Weekly Plan"
          price="$5"
          period="week"
          features={["50 detections", "Human vs AI", "Basic misinformation", "Standard speed"]}
          buttonText="Subscribe Weekly"
          onSubscribe={() => setCurrentView('checkout-weekly')}
        />

        <PlanCard
          title="Monthly Plan"
          price="$20"
          period="month"
          features={["Unlimited detections", "Humanized AI detection", "Advanced misinformation", "Detailed reports", "Faster processing"]}
          buttonText="Subscribe Monthly"
          highlighted={true}
          onSubscribe={() => setCurrentView('checkout-monthly')}
        />

        <PlanCard
          title="Yearly Plan"
          price="$250"
          period="year"
          features={["Unlimited detection", "Advanced features", "Downloadable reports", "API access", "Priority support"]}
          buttonText="Subscribe Yearly"
          onSubscribe={() => setCurrentView('checkout-yearly')}
        />
      </div>
    </AppLayout>
  );
};

// ─── Payment View ─────────────────────────────────────────────────────────────
const PaymentView = ({ setCurrentView, planName, planPrice }) => {
  const [activeTab, setActiveTab] = useState('esewa');

  const tabs = [
    { id: 'esewa', name: 'eSewa Wallet', icon: Wallet },
    { id: 'banking', name: 'Mobile / Internet Banking', icon: Landmark },
  ];

  return (
    <AppLayout currentView="payment" setCurrentView={setCurrentView}>
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-left">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10 text-left">
        <div className="flex-1 space-y-8">
          <Card className="p-6 bg-white border border-stone-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{planName}</h3>
                <p className="text-gray-500 font-medium">{planPrice}</p>
              </div>
              <button onClick={() => setCurrentView('subscription')} className="text-xs py-1 px-3 border border-stone-300 rounded font-semibold hover:bg-stone-50 cursor-pointer">Change</button>
            </div>

            <ul className="space-y-4 mb-8">
              {['AI Image Detection', 'Deepfake Video Analysis', 'Full API Access', 'Priority 24/7 Support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#1FA463] rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800 font-bold">{planPrice}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-800 font-bold">$2.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-4">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-[#1FA463]">${parseInt(planPrice.replace('$', '')) + 2}.00</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-[1.5] flex flex-col gap-6">
          <div className="flex bg-gray-200/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab.id ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <Card className="flex-1 p-6 bg-white border border-stone-200">
            {activeTab === 'esewa' ? (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Input label="eSewa ID (Mobile Number)" placeholder="98XXXXXXXX" type="tel" />
                </div>
                <div>
                  <Input label="Account Holder Name" placeholder="John Doe" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input label="Bank Name" placeholder="e.g. Nabil Bank, Global IME Bank" />
                </div>
                <div className="md:col-span-2">
                  <Input label="Account Number" placeholder="123456789012" />
                </div>
                <div className="md:col-span-2">
                  <Input label="Account Holder Name" placeholder="John Doe" />
                </div>
              </div>
            )}

            <button className="w-full py-4 text-lg font-bold mt-10 bg-[#1FA463] hover:bg-[#178a52] text-white rounded-xl shadow cursor-pointer" onClick={() => alert('Payment Successful!')}>
              Complete Payment
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-xs">
              <ShieldCheck size={14} className="text-[#1FA463]" />
              <span>Secure encrypted payment via 256-bit SSL.</span>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── Feedback View ────────────────────────────────────────────────────────────
const FeedbackView = ({ setCurrentView }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const whyChooseUsChecked = formData.getAll('why_choose_us');

    const templateParams = {
      hear_about_us: formData.get('hear_about_us') || '',
      role: formData.get('role') || '',
      ai_usage: formData.get('ai_usage') || '',
      why_choose_us: whyChooseUsChecked.join(', '),
    };

    emailjs.send(
      'service_98z4snm',
      'template_r8cy4sw',
      templateParams,
      'cPgeihOtrEGV8iPwT'
    )
    .then((result) => {
      console.log("EmailJS Success:", result.text);
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setCurrentView('dashboard');
    }, 2000);
  };

  return (
    <AppLayout currentView="feedback" setCurrentView={setCurrentView}>
      <div className="max-w-2xl mx-auto pt-8 mb-16 text-left">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          
          <div className="bg-[#1FA463] px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Tell Us About Yourself</h1>
            <p className="text-white/80 text-sm mt-2">Your feedback helps us improve VeritasAI.</p>
          </div>

          {!isSubmitted ? (
            <form className="p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              
              {/* Question 1 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  1. Where did you hear about us? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    name="hear_about_us"
                    defaultValue=""
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#F9FAFB] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="social_media">Social Media (Twitter, LinkedIn, etc.)</option>
                    <option value="search_engine">Search Engine (Google, Bing)</option>
                    <option value="friend">Friend / Colleague</option>
                    <option value="university">University / School</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  2. Are you a student, teacher, or writer? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="student" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" required />
                    <span className="text-sm font-semibold text-gray-700">Student</span>
                  </label>
                  <label className="flex-1 cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="teacher" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">Teacher</span>
                  </label>
                  <label className="flex-1 cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="writer" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">Writer</span>
                  </label>
                </div>
              </div>

              {/* Question 3 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  3. Have you used AI tools before? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-8 py-3 flex items-center gap-3">
                    <input type="radio" name="ai_usage" value="yes" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" required />
                    <span className="text-sm font-semibold text-gray-700">Yes</span>
                  </label>
                  <label className="cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-8 py-3 flex items-center gap-3">
                    <input type="radio" name="ai_usage" value="no" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Question 4 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  4. Why did you choose us? <span className="text-gray-500 font-normal ml-1">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Fast results",
                    "Easy to use",
                    "Modern AI technology",
                    "Supports students and writers",
                    "Clean interface"
                  ].map((reason, index) => (
                    <label key={index} className="cursor-pointer border border-stone-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-4 py-3 flex items-center gap-3">
                      <input type="checkbox" name="why_choose_us" value={reason} className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463] rounded" />
                      <span className="text-sm font-semibold text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-[2px] active:scale-[0.98] cursor-pointer"
                >
                  Submit Survey
                </button>
              </div>

            </form>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-[#1FA463]/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
              <p className="text-gray-500 max-w-sm mb-4">
                Your feedback has been submitted successfully. Taking you back to the dashboard...
              </p>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
};

// ─── Simple Fallback Static Pages ─────────────────────────────────────────────
const SimpleStaticView = ({ title, content, setCurrentView }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-10 font-sans text-stone-800 text-left">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <button onClick={() => setCurrentView('landing')} className="flex items-center gap-2 text-[#7B82FF] font-bold cursor-pointer">
          <ArrowLeft size={16} /> Back to Home
        </button>
        <h1 className="text-4xl font-extrabold text-stone-900">{title}</h1>
        <div className="text-stone-600 leading-relaxed space-y-4 whitespace-pre-line text-[15px]">
          {content}
        </div>
      </div>
    </div>
  );
};

// ─── Root Application Routing Switch ──────────────────────────────────────────
export default function Home() {
  const [currentView, setCurrentView] = useState('landing');
  const [displayName, setDisplayName] = useState('Sulav Sharma');
  const [emailAddress, setEmailAddress] = useState('sulav2080-0306@iimscollege.edu.np');

  const [scanText, setScanText] = useState('');
  const [scanResults, setScanResults] = useState(null);

  // Switch Render
  switch (currentView) {
    case 'landing':
      return <LandingView setCurrentView={setCurrentView} />;
    case 'login':
      return <LoginView setCurrentView={setCurrentView} setDisplayName={setDisplayName} setEmailAddress={setEmailAddress} />;
    case 'register':
      return <RegisterView setCurrentView={setCurrentView} />;
    case 'dashboard':
      return (
        <DashboardView 
          setCurrentView={setCurrentView} 
          displayName={displayName} 
          setDisplayName={setDisplayName}
          emailAddress={emailAddress}
          setEmailAddress={setEmailAddress}
          setScanText={setScanText}
          setScanResults={setScanResults}
        />
      );
    case 'result':
      return <ResultView setCurrentView={setCurrentView} scanText={scanText} scanResults={scanResults} />;
    case 'report':
      return <ReportView setCurrentView={setCurrentView} scanResults={scanResults} />;
    case 'subscription':
      return <SubscriptionView setCurrentView={setCurrentView} />;
    case 'feedback':
      return <FeedbackView setCurrentView={setCurrentView} />;
    
    // Checkout Views
    case 'checkout-weekly':
      return <PaymentView setCurrentView={setCurrentView} planName="Weekly Plan" planPrice="$5" />;
    case 'checkout-monthly':
      return <PaymentView setCurrentView={setCurrentView} planName="Monthly Plan" planPrice="$20" />;
    case 'checkout-yearly':
      return <PaymentView setCurrentView={setCurrentView} planName="Yearly Plan" planPrice="$250" />;

    // Static views
    case 'privacy':
      return (
        <SimpleStaticView 
          title="Privacy Policy" 
          setCurrentView={setCurrentView}
          content={`At VeritasAI, accessible from our application, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by VeritasAI and how we use it.

          1. Information We Collect
          We do not store the text you scan inside the AI content detector. All analysis is completed dynamically in-memory.
          
          2. Log Files
          VeritasAI follows a standard procedure of using log files to log visitors when they use the app.
          
          3. Consent
          By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          
          4. Contact Us
          If you have any questions about this Privacy Policy, you can contact us at:
          Veritas AI
          Nepal, Narephat joshi chowk
          Email: privacy@veritasai.com`} 
        />
      );
    case 'terms':
      return (
        <SimpleStaticView 
          title="Terms of Service" 
          setCurrentView={setCurrentView}
          content={`Welcome to VeritasAI!
          
          These terms and conditions outline the rules and regulations for the use of VeritasAI's Platform.
          
          1. License
          Unless otherwise stated, VeritasAI and/or its licensors own the intellectual property rights for all material on VeritasAI.
          
          2. User Restrictions
          You must not republish, sell, rent, sub-license, reproduce, duplicate, or copy material from VeritasAI.
          
          3. Disclaimer
          To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website.
          
          4. Contact Us
          If you have any questions about these Terms, please contact us at:
          Veritas AI
          Nepal, Narephat joshi chowk
          Email: terms@veritasai.com`} 
        />
      );
    case 'contact':
      return (
        <SimpleStaticView 
          title="Contact Support" 
          setCurrentView={setCurrentView}
          content={`If you have any questions or require support, please contact us at:
          
          Email: support@veritasai.com
          Phone: +977-1-4444444
          Address: Veritas AI, Nepal, Narephat joshi chowk
          
          Our customer service desk is open Monday to Friday, 9:00 AM to 5:00 PM.`} 
        />
      );
    default:
      return <LandingView setCurrentView={setCurrentView} />;
  }
}
