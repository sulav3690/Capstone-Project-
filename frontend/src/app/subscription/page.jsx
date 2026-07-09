"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

const plans = [
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
    paymentName: 'Monthly Plan',
    paymentPrice: 'Rs. 250'
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
    paymentName: 'Yearly Plan',
    paymentPrice: 'Rs. 2500'
  }
];

const Subscription = () => {
  const router = useRouter();

  const handleSubscribe = (plan) => {
    if (plan.disabled) return;
    router.push(`/payment?planName=${encodeURIComponent(plan.paymentName)}&planPrice=${encodeURIComponent(plan.paymentPrice)}`);
  };

  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-[1280px] overflow-x-hidden px-5 pb-10 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-[36px] font-black leading-tight tracking-normal text-stone-950 sm:text-[44px]">
            Pricing Plans
          </h1>
          <p className="mt-3 text-base font-medium leading-7 text-stone-500 sm:text-[17px]">
            Choose the plan that fits your AI detection and misinformation review needs.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex min-h-[560px] flex-col rounded-2xl bg-white px-8 py-8 ${
                plan.popular
                  ? 'border-2 border-[#1FA463]'
                  : 'border border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-stone-950">{plan.name}</h2>
                {plan.badge && (
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${plan.badgeClassName}`}>
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black leading-none tracking-normal text-stone-950">{plan.price}</span>
                {plan.period && (
                  <span className="pb-1 text-sm font-bold text-stone-400">{plan.period}</span>
                )}
              </div>

              <ul className="mt-8 flex flex-1 flex-col gap-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-base font-medium leading-6 text-stone-600">
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
                onClick={() => handleSubscribe(plan)}
                className={`mt-8 h-12 rounded-xl px-6 text-base font-bold ${
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
      </section>
    </PublicLayout>
  );
};

export default Subscription;
