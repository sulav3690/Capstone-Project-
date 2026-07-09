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
  Lock, CheckCircle, Wallet, Landmark, Menu
} from 'lucide-react';
import Footer from '../components/Footer';
import emailjs from '@emailjs/browser';

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
          <ShieldCheck size={20} className="text-[#7755FF]" />
          <span className="font-normal text-gray-500 text-[15px]">Veritas<span className="font-bold">AI</span></span>
        </div>
        <p className="text-[#9ca3af] text-[11px] font-medium">© 2026 VeritasAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [expandedFaq, setExpandedFaq] = useState(null);
  const faqRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    setIsLoggedIn(!!savedName);
  }, []);

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

  const handleLogout = () => {
    safeLocalStorage.removeItem('veritas_onboarding_completed');
    safeLocalStorage.removeItem('veritas_subscription_plan');
    safeLocalStorage.removeItem('veritas_display_name');
    safeLocalStorage.removeItem('veritas_email');
    setIsLoggedIn(false);
    router.push('/login');
  };

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
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => router.push('/subscription')} className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer">
              Pricing
            </button>
            <button onClick={() => faqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer">
              FAQ
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {!isLoggedIn ? (
            <>
              <button onClick={() => router.push('/login')} className="hidden md:flex text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer border-none bg-transparent">
                Login
              </button>
              <button onClick={() => router.push('/login')} className="hidden md:flex bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer border-none">
                Login
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogout} className="hidden md:flex text-[15px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide cursor-pointer border-none bg-transparent">
                Logout
              </button>
              <button onClick={() => router.push('/dashboard')} className="hidden md:flex bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer border-none">
                Dashboard
              </button>
            </>
          )}

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
            <button onClick={() => { router.push('/subscription'); setMobileMenuOpen(false); }} className="text-left text-[16px] font-bold text-stone-800 bg-transparent border-0">Pricing</button>
            <button onClick={() => { faqRef.current?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left text-[16px] font-bold text-stone-800 bg-transparent border-0">FAQ</button>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
            {!isLoggedIn ? (
              <>
                <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="w-full py-3 text-center text-[15px] font-bold text-stone-700 bg-stone-100 rounded-xl border-0">
                  Login
                </button>
                <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="w-full py-3 text-center text-[15px] font-bold text-white bg-[#7B82FF] rounded-xl border-0">
                  Login
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full py-3 text-center text-[15px] font-bold text-stone-700 bg-stone-100 rounded-xl border-0">
                  Logout
                </button>
                <button onClick={() => { router.push('/dashboard'); setMobileMenuOpen(false); }} className="w-full py-3 text-center text-[15px] font-bold text-white bg-[#7B82FF] rounded-xl border-0">
                  Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center pt-32 relative z-10 px-4">
        <div className="text-center max-w-4xl mx-auto flex flex-col gap-6">
          <h1 className="text-[60px] font-extrabold text-stone-900 tracking-tight leading-none">
            About <span className="text-[#7B82FF]">VeritasAI</span>
          </h1>
          <p className="text-stone-600 text-[17px] leading-relaxed max-w-[800px] mx-auto font-medium">
            At VeritasAI, we believe ensuring AI text authenticity should be simple. We're here to help you identify AI-generated content, improve source credibility, and connect with your audience on a deeper level.
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            <button onClick={() => router.push('/login')} className="bg-[#1FA463] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#178a52] transition cursor-pointer">
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
      

      
      {/* Footer / Emerging Bottom Container */}
      <Footer className="!mt-16 md:!mt-24" />
    </div>
  );
}
