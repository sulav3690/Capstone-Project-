"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Clock3,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import api from '../../utils/api';
import safeLocalStorage from '../../utils/safeLocalStorage';

const PLAN_DETAILS = {
  monthly: {
    code: 'tier-1-monthly',
    name: 'Monthly Plan',
    period: 'month',
    amount: 250,
    features: [
      'Access to AI detector',
      'AI deep scan',
      '50,000 words per input',
      '500 AI detections',
      'Advanced misinformation detection',
    ],
  },
  yearly: {
    code: 'tier-1-yearly',
    name: 'Yearly Plan',
    period: 'year',
    amount: 2500,
    features: [
      'Access to AI detector',
      'AI deep scan',
      '500,000 words per input',
      'Unlimited AI detections',
      'Detailed misinformation reports',
    ],
  },
};

function submitHostedForm(paymentUrl, formData) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.style.display = 'none';

  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const requestedPlan = (searchParams.get('plan') || '').toLowerCase();
  const legacyPlanName = (searchParams.get('planName') || '').toLowerCase();
  const planKey =
    requestedPlan === 'yearly' || (!requestedPlan && legacyPlanName.includes('yearly'))
      ? 'yearly'
      : 'monthly';
  const plan = PLAN_DETAILS[planKey];
  const tax = plan.amount * 0.02;
  const totalAmount = plan.amount + tax;

  const [isMounted, setIsMounted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('esewa');
  const [redirectingProvider, setRedirectingProvider] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');

  useEffect(() => {
    setIsMounted(true);
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    if (!savedName) {
      router.replace('/login');
      return;
    }
    setDisplayName(savedName);
    setSubscriptionPlan(safeLocalStorage.getItem('veritas_subscription_plan') || 'Free');
  }, [router]);

  const handleEsewaCheckout = async () => {
    if (redirectingProvider) return;
    setRedirectingProvider('esewa');
    try {
      const response = await api.post('/api/payments/esewa/initiate/', {
        plan_code: plan.code,
      });
      showToast('Redirecting to the secure eSewa sandbox...', 'info');
      submitHostedForm(response.payment_url, response.form_data);
    } catch (error) {
      setRedirectingProvider('');
      showToast(error.message || 'Could not start eSewa checkout.', 'error');
    }
  };

  const handleKhaltiCheckout = async () => {
    if (redirectingProvider) return;
    setRedirectingProvider('khalti');
    try {
      const response = await api.post('/api/payments/khalti/initiate/', {
        plan_code: plan.code,
      }, { timeoutMs: 25000 });
      showToast('Redirecting to the secure Khalti sandbox...', 'info');
      window.location.assign(response.payment_url);
    } catch (error) {
      setRedirectingProvider('');
      showToast(error.message || 'Could not start Khalti checkout.', 'error');
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">
      <Sidebar
        activeTab="plans"
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto p-4 pt-16 sm:p-8 md:pt-10 transition-all duration-300">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1FA463]">
            Secure sandbox checkout
          </p>
          <h1 className="mt-2 text-3xl font-black text-stone-900 tracking-tight">
            Complete your subscription
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-stone-500">
            Choose a provider below. Test credentials are entered only on the
            provider&apos;s hosted checkout page.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-7 items-start">
          <section className="bg-white border border-stone-200/70 rounded-[28px] p-6 sm:p-8 shadow-[0_16px_42px_rgba(28,25,23,0.035)]">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h2 className="text-xl font-black text-stone-900">{plan.name}</h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  Rs. {plan.amount.toFixed(2)} / {plan.period}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/subscription')}
                className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg px-3 py-2 transition cursor-pointer"
              >
                Change plan
              </button>
            </div>

            <ul className="mt-7 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-stone-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#1FA463]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-stone-100 pt-6 space-y-4 text-sm font-semibold">
              <div className="flex justify-between gap-4">
                <span className="text-stone-400">Subtotal</span>
                <span>Rs. {plan.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-400">Tax (2%)</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-stone-100 pt-4 text-lg font-black text-stone-900">
                <span>Total amount</span>
                <span className="text-[#1FA463]">Rs. {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={selectedProvider === 'esewa'}
                onClick={() => setSelectedProvider('esewa')}
                className={`flex items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-black transition cursor-pointer ${
                  selectedProvider === 'esewa'
                    ? 'border-[#1FA463]/40 bg-white text-stone-900 shadow-sm ring-2 ring-[#1FA463]/10'
                    : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-white'
                }`}
              >
                <Wallet
                  size={18}
                  className={selectedProvider === 'esewa' ? 'text-[#1FA463]' : ''}
                />
                eSewa Wallet
              </button>
              <button
                type="button"
                aria-pressed={selectedProvider === 'khalti'}
                onClick={() => setSelectedProvider('khalti')}
                className={`flex items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-black transition cursor-pointer ${
                  selectedProvider === 'khalti'
                    ? 'border-[#5C2D91]/40 bg-white text-stone-900 shadow-sm ring-2 ring-[#5C2D91]/10'
                    : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-white'
                }`}
              >
                <Wallet
                  size={18}
                  className={selectedProvider === 'khalti' ? 'text-[#5C2D91]' : ''}
                />
                Khalti Wallet
              </button>
            </div>

            <div className="bg-white border border-stone-200/70 rounded-[28px] p-6 sm:p-8 shadow-[0_16px_42px_rgba(28,25,23,0.035)]">
              <div className="flex items-start gap-4">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                    selectedProvider === 'esewa'
                      ? 'bg-emerald-50 text-[#1FA463]'
                      : 'bg-purple-50 text-[#5C2D91]'
                  }`}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900">
                    Pay securely with {selectedProvider === 'esewa' ? 'eSewa' : 'Khalti'}
                  </h2>
                  <p className="mt-1 text-sm font-medium leading-6 text-stone-500">
                    This is the official {selectedProvider === 'esewa' ? 'eSewa' : 'Khalti'}{' '}
                    sandbox. No real money is charged while testing.
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Clock3
                    size={18}
                    className={`mt-0.5 shrink-0 ${
                      selectedProvider === 'esewa' ? 'text-[#1FA463]' : 'text-[#5C2D91]'
                    }`}
                  />
                  <p className="text-xs font-semibold leading-5 text-stone-600">
                    Your {plan.period} starts only after{' '}
                    {selectedProvider === 'esewa' ? 'eSewa' : 'Khalti'} confirms the
                    payment. The transaction and expiry date are then saved to your account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  selectedProvider === 'esewa'
                    ? handleEsewaCheckout
                    : handleKhaltiCheckout
                }
                disabled={Boolean(redirectingProvider)}
                className={`mt-7 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-black text-white shadow-lg transition disabled:cursor-wait disabled:opacity-65 cursor-pointer ${
                  selectedProvider === 'esewa'
                    ? 'bg-[#1FA463] shadow-emerald-600/10 hover:bg-[#178a52]'
                    : 'bg-[#5C2D91] shadow-purple-700/10 hover:bg-[#472170]'
                }`}
              >
                {redirectingProvider
                  ? `Opening ${
                      redirectingProvider === 'esewa' ? 'eSewa' : 'Khalti'
                    } sandbox...`
                  : `Pay Rs. ${totalAmount.toFixed(2)} with ${
                      selectedProvider === 'esewa' ? 'eSewa' : 'Khalti'
                    }`}
                {!redirectingProvider && <ArrowRight size={19} />}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-stone-400">
                <ShieldCheck
                  size={14}
                  className={
                    selectedProvider === 'esewa' ? 'text-[#1FA463]' : 'text-[#5C2D91]'
                  }
                />
                VeritasAI never receives or stores your{' '}
                {selectedProvider === 'esewa' ? 'eSewa' : 'Khalti'} credentials.
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function Payment() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <PaymentPageContent />
    </React.Suspense>
  );
}
