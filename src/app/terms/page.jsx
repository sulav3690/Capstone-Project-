"use client";

import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { FileText, Award, Scale, HelpCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'acceptance', label: '1. Acceptance of Terms' },
    { id: 'services-api', label: '2. Service & API Usage Rules' },
    { id: 'billing-refunds', label: '3. Subscriptions & Refund Policy' },
    { id: 'intellectual-property', label: '4. Intellectual Property' },
    { id: 'academic-integrity', label: '5. Academic Honesty Policy' },
    { id: 'liability-limits', label: '6. Limitation of Liability' },
    { id: 'contact-legal', label: '7. Contact Legal Counsel' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        
        {/* Title Block */}
        <div className="mb-14 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#7B82FF]/10 text-[#7B82FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <Scale size={14} />
            Service Terms & Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none mb-4">
            Terms of Service
          </h1>
          <p className="text-stone-500 font-semibold text-[15px] max-w-xl">
            Last Updated: June 2, 2026. Please read these terms carefully before accessing or using the VeritasAI services.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Sticky TOC Sidebar */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-28 shrink-0 bg-white/60 backdrop-blur border border-stone-200/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              Sections
            </h3>
            <nav className="flex flex-col gap-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left text-sm py-2 px-3.5 rounded-xl font-semibold transition-all select-none ${
                    activeSection === section.id
                      ? 'bg-[#7B82FF]/10 text-[#7B82FF] translate-x-1'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Legal Content */}
          <div className="flex-1 bg-white border border-stone-200/50 rounded-3xl p-8 md:p-12 shadow-[0_10px_30px_rgba(28,25,23,0.015)] text-[15px] leading-relaxed text-stone-600 font-medium flex flex-col gap-10">
            
            <section id="introduction" className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Introduction</h2>
              <p>
                Welcome to VeritasAI. These Terms of Service ("Terms") govern your access to and use of the VeritasAI website, user dashboards, API endpoints, and browser extensions (collectively, the "Services").
              </p>
              <p>
                By using VeritasAI, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you are entering into this agreement on behalf of a school, publisher, or corporate entity, you warrant that you have authority to bind that organization.
              </p>
            </section>

            <hr className="border-stone-100" />

            <section id="acceptance" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By registering an account, purchasing a paid subscription, or pasting text into our open AI detector, you signify your agreement to these Terms and our Privacy Policy.
              </p>
              <p>
                We reserve the right to revise or adjust these Terms at any time. When modifications occur, we will update the "Last Updated" date at the top of this page. Your continued use of the platform constitutes full acceptance of the updated terms.
              </p>
            </section>

            <hr className="border-stone-100" />

            <section id="services-api" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">2. Service & API Usage Rules</h2>
              <p>
                VeritasAI grants you a limited, non-exclusive, non-transferable license to access our linguistic analysis tools subject to the following rules:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2.5 text-stone-500">
                <li>You may not use automated scripts or bots to extract bulk scores without buying an API license.</li>
                <li>You may not attempt to reverse engineer our classification neural networks or download the model weights.</li>
                <li>API calls must adhere to rate limits corresponding to your plan tiers (e.g. 60 requests/min for basic keys).</li>
              </ul>
            </section>

            <hr className="border-stone-100" />

            <section id="billing-refunds" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">3. Subscriptions & Refund Policy</h2>
              <p>
                Certain functions are paid services. By signing up for our Weekly, Monthly, or Yearly plans, you agree to our standard billing protocols:
              </p>
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/50 flex flex-col gap-3 mt-1">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-[15px]">
                  <CheckCircle size={18} className="text-[#1FA463]" />
                  Auto-Renewal & Cancellations
                </div>
                <p className="text-sm text-stone-500">
                  All subscription plans auto-renew at the end of each billing period (weekly, monthly, or yearly) unless cancelled. You can easily cancel the auto-renewal at any time inside your dashboard settings.
                </p>
                <div className="flex items-center gap-2 text-stone-900 font-bold text-[15px] mt-2">
                  <CheckCircle size={18} className="text-[#1FA463]" />
                  Refund Eligibility
                </div>
                <p className="text-sm text-stone-500">
                  Due to server computing costs associated with real-time ML processing, we generally do not offer refunds once detection credits have been utilized. However, you can write to support within 48 hours if you believe billing errors occurred.
                </p>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="intellectual-property" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">4. Intellectual Property</h2>
              <p>
                All elements of the VeritasAI platform, including the underlying code, UI, graphic layouts, brand logos, and model evaluations, are the exclusive intellectual property of VeritasAI and are protected under global copyright and trademark laws.
              </p>
              <p>
                Importantly, <span className="text-[#1FA463] font-bold">VeritasAI asserts NO intellectual ownership over the text inputs you paste for detection</span>. You retain full copyright ownership of any content you submit.
              </p>
            </section>

            <hr className="border-stone-100" />

            <section id="academic-integrity" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">5. Academic Honesty Policy</h2>
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/40 flex gap-4">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="font-bold text-stone-900 text-[15px]">For Educational Institutions & Students</h4>
                  <p className="text-stone-600 text-sm mt-1 leading-relaxed">
                    VeritasAI is designed as an educational assistant and reference tool. It is not an absolute grading authority. While our models operate at high precision, we recommend educators use our scores as secondary signals rather than automated grounds for penalization, due to the inherent possibility of false positives.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="liability-limits" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">6. Limitation of Liability</h2>
              <p className="text-stone-500 uppercase text-xs tracking-wider font-bold">
                PLEASE READ CAREFULLY. THIS SECTION LIMITS OUR LIABILITY TO THE FULLEST EXTENT PERMISSIBLE BY LAW.
              </p>
              <p>
                The Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind. VeritasAI does not warrant that AI detection scores will be 100% correct, free from false positives, or uninterrupted.
              </p>
              <p>
                In no event shall VeritasAI, its directors, or its affiliates be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our classification reports.
              </p>
            </section>

            <hr className="border-stone-100" />

            <section id="contact-legal" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">7. Contact Legal Counsel</h2>
              <p>
                If you have questions about these Terms of Service, or require licensing permissions for commercial redistribution of our scores, please contact us at:
              </p>
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-extrabold text-stone-800">Veritas AI</p>
                  <p className="text-sm text-stone-500 mt-0.5">Nepal, Narephat joshi chowk</p>
                </div>
                <a 
                  href="mailto:legal@veritasai.com"
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-colors"
                >
                  legal@veritasai.com
                </a>
              </div>
            </section>

          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
