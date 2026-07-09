"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Wallet, 
  Landmark, 
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import Sidebar from '../../components/Sidebar';
import safeLocalStorage from '../../utils/safeLocalStorage';
import useFormValidation from '../../hooks/useFormValidation';

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
  const [isMounted, setIsMounted] = useState(false);

  // Form Validation Hooks
  const esewaForm = useFormValidation(
    { esewaId: '', accountName: '', countryCode: '+977' },
    (values) => {
      const errors = {};
      if (!values.esewaId || !/^[0-9]{10}$/.test(values.esewaId)) {
        errors.esewaId = "Mobile number must be exactly 10 digits";
      }
      if (!values.accountName || !/^[a-zA-Z\s]+$/.test(values.accountName)) {
        errors.accountName = "Account Name must contain only letters";
      }
      return errors;
    }
  );

  const bankingForm = useFormValidation(
    { bankName: '', bankAccount: '', accountName: '' },
    (values) => {
      const errors = {};
      if (!values.bankName) errors.bankName = "Bank Name is required";
      if (!values.bankAccount || values.bankAccount.length < 8) errors.bankAccount = "Valid Account Number is required";
      if (!values.accountName) errors.accountName = "Account Name is required";
      return errors;
    }
  );

  // Sidebar profile information
  const [displayName, setDisplayName] = useState('');
  const subscriptionPlan = safeLocalStorage.getItem('veritas_subscription_plan') || 'Free';

  useEffect(() => {
    setIsMounted(true);
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    if (!savedName) {
      router.push('/login');
      return;
    }
    setDisplayName(savedName);
  }, [router]);

  const handlePaymentSubmit = (values) => {
    // We arrive here only if validation passed because we use handleSubmit from the hook
    showToast(`Payment of $${totalAmount}.00 Successful! Upgraded to ${planName}.`, 'success');
    
    // Persist subscription plan to localStorage (Phase 2: Premium System)
    const planType = planName.replace(' Plan', '');
    safeLocalStorage.setItem('veritas_subscription_plan', planType);

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

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">
      
      {/* Shared Sidebar Component */}
      <Sidebar
        activeTab="plans"
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
      />

      {/* Main Checkout content */}
      <main className="flex-1 p-4 sm:p-8 pt-14 md:pt-10 sm:pt-16 max-w-[1240px] mx-auto w-full flex flex-col justify-start transition-all duration-300">
        
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
                <form className="grid grid-cols-1 gap-6 text-left" onSubmit={esewaForm.handleSubmit(handlePaymentSubmit)} noValidate id="esewa-form">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      eSewa ID (Mobile Number)
                    </label>
                    <div className="flex">
                      <select
                        {...esewaForm.getInputProps('countryCode')}
                        className={`bg-stone-50/50 border border-r-0 border-stone-200 text-stone-900 rounded-l-xl px-3 py-2.5 text-[14px] font-semibold focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] z-10 ${esewaForm.errors.esewaId ? 'border-red-500 ring-red-500/20' : ''}`}
                      >
                        <option value="+977">+977 (NP)</option>
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="98XXXXXXXX"
                        {...esewaForm.getInputProps('esewaId')}
                        className={`w-full bg-stone-50/50 border text-stone-900 rounded-r-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] ${esewaForm.errors.esewaId || esewaForm.getInputProps('esewaId').className.includes('animate-input-shake') ? esewaForm.getInputProps('esewaId').className : 'border-stone-200'}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...esewaForm.getInputProps('accountName')}
                      className={`w-full bg-stone-50/50 border text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] ${esewaForm.errors.accountName || esewaForm.getInputProps('accountName').className.includes('animate-input-shake') ? esewaForm.getInputProps('accountName').className : 'border-stone-200'}`}
                    />
                  </div>
                </form>
              ) : (
                <form className="grid grid-cols-1 gap-6 text-left" onSubmit={bankingForm.handleSubmit(handlePaymentSubmit)} noValidate id="banking-form">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nabil Bank, Global IME Bank"
                      {...bankingForm.getInputProps('bankName')}
                      className={`w-full bg-stone-50/50 border text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] ${bankingForm.errors.bankName || bankingForm.getInputProps('bankName').className.includes('animate-input-shake') ? bankingForm.getInputProps('bankName').className : 'border-stone-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      {...bankingForm.getInputProps('bankAccount')}
                      className={`w-full bg-stone-50/50 border text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] ${bankingForm.errors.bankAccount || bankingForm.getInputProps('bankAccount').className.includes('animate-input-shake') ? bankingForm.getInputProps('bankAccount').className : 'border-stone-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-stone-500 uppercase tracking-widest">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...bankingForm.getInputProps('accountName')}
                      className={`w-full bg-stone-50/50 border text-stone-900 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463] ${bankingForm.errors.accountName || bankingForm.getInputProps('accountName').className.includes('animate-input-shake') ? bankingForm.getInputProps('accountName').className : 'border-stone-200'}`}
                    />
                  </div>
                </form>
              )}

              {/* Complete Payment green button matching VeritasAI styling */}
              <button
                type="submit"
                form={activeTab === 'esewa' ? 'esewa-form' : 'banking-form'}
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
