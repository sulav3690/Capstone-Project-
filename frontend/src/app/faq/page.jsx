"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import safeLocalStorage from '../../utils/safeLocalStorage';

const faqs = [
  {
    question: "What is VeritasAI?",
    answer: "VeritasAI is an AI content and misinformation detector that helps identify whether submitted text is likely human-written or AI-generated."
  },
  {
    question: "How does AI detection work?",
    answer: "VeritasAI analyzes writing patterns, structure, predictability, and other linguistic signals to estimate whether text was created with AI tools."
  },
  {
    question: "Is VeritasAI's AI detector accurate?",
    answer: "VeritasAI is designed to be reliable, but AI detection is probabilistic. Use results as a strong signal alongside your own review and context."
  },
  {
    question: "Who is VeritasAI for?",
    answer: "VeritasAI is built for students, educators, publishers, researchers, and teams that need a clearer view of text authenticity."
  },
  {
    question: "Does VeritasAI store my submitted text?",
    answer: "Submitted text is handled carefully for analysis. Avoid sending sensitive personal information unless it is required for your review."
  }
];

export default function FAQPage() {
  const [openFaqIndices, setOpenFaqIndices] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [displayName, setDisplayName] = useState('Sulav Sharma');

  const subscriptionPlan = typeof window !== 'undefined'
    ? safeLocalStorage.getItem('veritas_subscription_plan') || 'Free'
    : 'Free';

  useEffect(() => {
    setIsMounted(true);
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndices((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  if (!isMounted) return <div className="min-h-screen overflow-x-hidden bg-[#F8F5EF]" />;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8F5EF] font-sans text-stone-900">
      <Sidebar
        activeTab="faq"
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
      />

      <main className="min-w-0 flex-1 px-5 pb-12 pt-16 sm:px-8 md:pt-14 lg:px-16 xl:px-20">
        <section className="mx-auto flex w-full max-w-[960px] flex-col items-center">
          <div className="mb-10 text-center">
            <h1 className="text-[40px] font-black leading-tight tracking-normal text-stone-950 sm:text-5xl">
              FAQs about VeritasAI
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-stone-600 sm:text-lg">
              Everything you need to know about VeritasAI and our detection systems.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 sm:gap-5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndices.includes(index);

              return (
                <div
                  key={faq.question}
                  className="w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_14px_36px_rgba(28,25,23,0.05)] transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex min-h-[88px] w-full items-center justify-between gap-5 px-6 py-6 text-left transition hover:bg-stone-50/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1FA463]/20 sm:px-8"
                    aria-expanded={isOpen}
                  >
                    <span className="min-w-0 text-lg font-semibold leading-snug text-stone-900">
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1FA463] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      {isOpen ? <Minus size={23} strokeWidth={2.5} /> : <Plus size={23} strokeWidth={2.5} />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-7 text-[15px] font-medium leading-7 text-stone-600 sm:px-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
