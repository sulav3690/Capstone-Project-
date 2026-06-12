"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  User, 
  CreditCard, 
  HelpCircle, 
  LifeBuoy, 
  MessageSquare, 
  LogOut, 
  Wallet, 
  Landmark, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const planName = searchParams.get('planName') || 'Monthly Plan';
  const planPriceStr = searchParams.get('planPrice') || '$20';
  const planPriceNum = parseInt(planPriceStr.replace('$', '')) || 20;
  const tax = 2;
  const totalAmount = planPriceNum + tax;

  const [activeTab, setActiveTab] = useState('esewa');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Form states
  const [esewaId, setEsewaId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  // Sidebar profile information matching dashboard defaults
  const displayName = 'Sulav Sharma';
  const emailAddress = 'sulav2080-0306@iimscollege.edu.np';
  const subscriptionPlan = 'Free';

  // Sync sidebar collapsibility
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePaymentSubmit = () => {
    if (activeTab === 'esewa') {
      if (!esewaId || !accountName) {
        showToast('Please fill in your eSewa details.', 'error');
        return;
      }
    } else {
      if (!bankName || !bankAccount || !accountName) {
        showToast('Please fill in your banking details.', 'error');
        return;
      }
    }
    showToast(`Payment of $${totalAmount}.00 Successful! Upgraded to ${planName}.`, 'success');
    
    // Update local onboarding key with premium plan info if completed
    const completed = safeLocalStorage.getItem('veritas_onboarding_completed');
    if (completed && completed !== 'skipped') {
      try {
        const parsed = JSON.parse(completed);
        parsed.planChosen = planName.includes('Monthly') ? 'Premium' : planName;
        safeLocalStorage.setItem('veritas_onboarding_completed', JSON.stringify(parsed));
      } catch (e) { /* ignore */ }
    }

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const safeLocalStorage = {
    getItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) { /* SSR */ }
      return null;
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) { /* SSR */ }
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">
      
      {/* Left Sidebar (Identical to Dashboard layout & styles) */}
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
          {/* Logo / Brand (Kept original blue-violet color theme) */}
          <div
            onClick={() => router.push('/')}
            className={`flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Go to Homepage"
          >
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-lg shrink-0">
              <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-normal text-[22px] tracking-tight text-stone-900 transition-all duration-300 whitespace-nowrap overflow-hidden">
                Veritas<span className="font-bold">AI</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6 mt-4 w-full">
            <button
              onClick={() => router.push('/dashboard?tab=dashboard')}
              className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all w-full text-left text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2.5'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            <button
              onClick={() => router.push('/dashboard?tab=detector')}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all w-full text-left text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium ${
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
                <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Account</span>
              )}
              <button
                onClick={() => router.push('/dashboard?tab=account')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium ${
                  isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
                }`}
                title="Account"
              >
                <User size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Account</span>}
              </button>
              <button
                onClick={() => router.push('/dashboard?tab=plans')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full bg-stone-900 text-white shadow-sm font-semibold ${
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
                onClick={() => router.push('/dashboard?tab=faq')}
                className={`flex items-center gap-3 rounded-xl text-[15.5px] transition-all text-left w-full text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium ${
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
        <div className={`p-4 border-t border-stone-200/60 flex flex-col gap-3 transition-all duration-300 ${
          isSidebarCollapsed ? 'items-center px-2' : ''
        }`}>
          {isSidebarCollapsed ? (
            <button
              onClick={() => router.push('/dashboard?tab=account')}
              className="relative cursor-pointer hover:scale-105 transition-all w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-[15px] shadow-sm shrink-0 border-none"
              title={`${displayName} - ${subscriptionPlan} Plan`}
            >
              {displayName.charAt(0)}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white"></span>
            </button>
          ) : (
            <div className="w-full bg-[#EBE5D8]/80 backdrop-blur-[10px] border border-stone-300/60 shadow-[inset_4px_4px_12px_rgba(255,255,255,0.75),0_10px_25px_rgba(28,25,23,0.02)] p-4 rounded-2xl flex flex-col gap-3.5 text-stone-800 select-none">
              <div
                onClick={() => router.push('/dashboard?tab=account')}
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {displayName.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#EDE7DC]"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-[14px] tracking-tight truncate text-stone-900 leading-none mb-0.5">{displayName}</span>
                  <span className="text-stone-500 text-[11px] font-semibold truncate leading-none">@{displayName.toLowerCase().replace(/\s+/g, '_')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard?tab=plans')}
                  className="w-full py-1.5 pl-1.5 pr-4 bg-stone-950/5 hover:bg-stone-950/10 border border-stone-900/5 rounded-full flex items-center gap-2.5 transition-all cursor-pointer text-left shadow-sm font-semibold text-[11px] text-stone-800"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  Upgrade Now
                </button>
                <button
                  onClick={() => {
                    safeLocalStorage.removeItem('veritas_onboarding_completed');
                    router.push('/login');
                  }}
                  className="w-full py-2 bg-red-50/70 hover:bg-red-100/90 border border-red-100/80 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer text-red-600 text-[11px] font-bold shadow-sm"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Checkout content */}
      <main className="flex-1 p-4 sm:p-8 pt-10 sm:pt-16 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
        
        {/* Title */}
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-10 text-left">Secure Checkout</h1>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 w-full text-left">
          
          {/* Summary Card */}
          <div className="flex-1 min-w-[280px]">
            <div className="bg-white border border-stone-200/60 rounded-[32px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(28,25,23,0.015)] relative">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">{planName}</h3>
                  <p className="text-stone-500 font-semibold text-[13.5px] mt-1">{planPriceStr} / month</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard?tab=plans')}
                  className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200/40 rounded-lg px-3 py-1.5 cursor-pointer transition"
                >
                  Change
                </button>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {['AI Image Detection', 'Deepfake Video Analysis', 'Full API Access', 'Priority 24/7 Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-stone-600 font-semibold">
                    <div className="w-1.5 h-1.5 bg-[#1FA463] rounded-full shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Financial Calculation */}
              <div className="border-t border-stone-100 pt-6 space-y-4">
                <div className="flex justify-between text-[13px] font-semibold">
                  <span className="text-stone-400">Subtotal</span>
                  <span className="text-stone-800">${planPriceNum}.00</span>
                </div>
                <div className="flex justify-between text-[13px] font-semibold">
                  <span className="text-stone-400">Tax</span>
                  <span className="text-stone-800">$2.00</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-stone-100 pt-4 text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-[#1FA463]">${totalAmount}.00</span>
                </div>
              </div>

            </div>
          </div>

          {/* Checkout Payment Form */}
          <div className="flex-[1.4] flex flex-col gap-6">
            
            {/* Wallet / Banking tab selection buttons */}
            <div className="flex bg-stone-200/50 p-1.5 rounded-2xl border border-stone-200/20 max-w-md">
              <button
                onClick={() => setActiveTab('esewa')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer ${
                  activeTab === 'esewa' 
                    ? 'bg-white shadow-sm text-stone-900' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Wallet size={16} />
                eSewa Wallet
              </button>
              <button
                onClick={() => setActiveTab('banking')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer ${
                  activeTab === 'banking' 
                    ? 'bg-white shadow-sm text-stone-900' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Landmark size={16} />
                Mobile / Internet Banking
              </button>
            </div>

            {/* Input Form Card */}
            <div className="bg-white border border-stone-200/60 rounded-[32px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(28,25,23,0.015)]">
              {activeTab === 'esewa' ? (
                <div className="grid grid-cols-1 gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      eSewa ID (Mobile Number)
                    </label>
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={esewaId}
                      onChange={(e) => setEsewaId(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nabil Bank, Global IME Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                    />
                  </div>
                </div>
              )}

              {/* Complete Payment green button matching VeritasAI styling */}
              <button
                onClick={handlePaymentSubmit}
                className="w-full py-4 bg-[#1FA463] hover:bg-[#178a52] text-white text-[15px] font-bold rounded-2xl shadow-md transition cursor-pointer text-center mt-8 shadow-[#1FA463]/10 hover:shadow-lg active:scale-98"
              >
                Complete Payment - ${totalAmount}.00
              </button>

              <div className="flex items-center justify-center gap-2 mt-6 text-stone-400 text-[11.5px] font-semibold">
                <ShieldCheck size={14} className="text-[#1FA463]" />
                <span>Secure encrypted payment via 256-bit SSL.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default function Payment() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-stone-500 font-semibold">Loading checkout details...</div>}>
      <PaymentPageContent />
    </React.Suspense>
  );
}
