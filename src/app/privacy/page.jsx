"use client";

import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Shield, Lock, Eye, CloudLightning, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'information-we-collect', label: '1. Information We Collect' },
    { id: 'how-we-use-information', label: '2. How We Use Information' },
    { id: 'ai-processing-privacy', label: '3. AI Processing & Document Privacy' },
    { id: 'data-security', label: '4. Data Security & Storage' },
    { id: 'your-rights', label: '5. Your Privacy Rights' },
    { id: 'contact-us', label: '6. Contact Privacy Team' },
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
        
        {/* Page Title & Intro */}
        <div className="mb-14 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#1FA463]/10 text-[#1FA463] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <Shield size={14} />
            Privacy Protection Guarantee
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none mb-4">
            Privacy Policy
          </h1>
          <p className="text-stone-500 font-semibold text-[15px] max-w-xl">
            Last Updated: June 2, 2026. Learn how we handle and protect your content and personal data with VeritasAI.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Side: Table of Contents Sidebar */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-28 shrink-0 bg-white/60 backdrop-blur border border-stone-200/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              Table of Contents
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

          {/* Right Side: Copy Content */}
          <div className="flex-1 bg-white border border-stone-200/50 rounded-3xl p-8 md:p-12 shadow-[0_10px_30px_rgba(28,25,23,0.015)] text-[15px] leading-relaxed text-stone-600 font-medium flex flex-col gap-10">
            
            <section id="introduction" className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Introduction</h2>
              <p>
                At <strong>VeritasAI</strong>, we are committed to safeguarding your privacy. We believe that ensuring text authenticity should not come at the expense of your proprietary or personal information. 
              </p>
              <p>
                This Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your information when you use our website, AI detection tools, and related APIs.
              </p>
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/40 text-amber-900 flex items-start gap-4 mt-2">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-bold text-[15px]">Core Principle: We do not store your documents.</h4>
                  <p className="text-sm mt-1 font-medium text-amber-800/90 leading-relaxed">
                    Any text you copy and paste into our detector is evaluated instantly in volatile memory and immediately discarded. We never use your texts to train our machine learning models.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="information-we-collect" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">1. Information We Collect</h2>
              <p>
                We only collect data necessary to provide you with secure dashboard login credentials, process subscriptions, and maintain site functionality:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2.5 text-stone-500">
                <li>
                  <span className="text-stone-800 font-bold">Account Information:</span> Email addresses, passwords, and name inputs provided during registration.
                </li>
                <li>
                  <span className="text-stone-800 font-bold">Billing Information:</span> Transaction records when you purchase a subscription plan. We use secure third-party processors (e.g. Stripe) and never store card numbers.
                </li>
                <li>
                  <span className="text-stone-800 font-bold">Usage Metadata:</span> Standard analytical data (IP addresses, browser type, referral URLs) to improve platform load speed and prevent system abuses.
                </li>
              </ul>
            </section>

            <hr className="border-stone-100" />

            <section id="how-we-use-information" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">2. How We Use Information</h2>
              <p>
                We process your personal information under the following legal bases and for these specified purposes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-stone-500">
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 flex gap-3">
                  <CheckCircle size={18} className="text-[#1FA463] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800 text-[14px]">Service Execution</h4>
                    <p className="text-xs mt-1 leading-relaxed">To manage accounts, process subscription upgrades, and verify access privileges.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 flex gap-3">
                  <CheckCircle size={18} className="text-[#1FA463] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800 text-[14px]">Security Auditing</h4>
                    <p className="text-xs mt-1 leading-relaxed">To monitor API usage, detect automated bot scrapers, and guarantee system stability.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 flex gap-3">
                  <CheckCircle size={18} className="text-[#1FA463] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800 text-[14px]">User Communications</h4>
                    <p className="text-xs mt-1 leading-relaxed">To reply to help tickets, send transactional receipt notifications, and gather surveys.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 flex gap-3">
                  <CheckCircle size={18} className="text-[#1FA463] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800 text-[14px]">Product Improvements</h4>
                    <p className="text-xs mt-1 leading-relaxed">Using aggregate analytics to diagnose loading bottlenecks and refine UI elements.</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="ai-processing-privacy" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">3. AI Processing & Document Privacy</h2>
              <div className="p-6 rounded-2xl bg-[#7B82FF]/5 border border-[#7B82FF]/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Lock className="text-[#7B82FF]" size={22} />
                  <h4 className="font-bold text-stone-900 text-lg">Zero-Retention Document Analysis</h4>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed font-semibold">
                  When you submit text for AI detection or plagiarism analysis:
                </p>
                <ol className="list-decimal pl-5 flex flex-col gap-2 text-stone-500 text-sm">
                  <li>The document is read and analyzed locally inside secure web sockets/APIs.</li>
                  <li>Metrics are computed dynamically (burstiness, entropy, perplexity).</li>
                  <li>No database entry is ever written containing the actual text of your submitted content.</li>
                  <li>We do not share your text inputs with external models or companies (e.g. OpenAI, Anthropic, Google).</li>
                </ol>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="data-security" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">4. Data Security & Storage</h2>
              <p>
                We employ industry-leading protocols to protect your registered account credentials and payment histories:
              </p>
              <div className="flex flex-col gap-3.5 text-stone-500">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-stone-700 text-xs">A</span>
                  </div>
                  <p className="text-[14px]">
                    <strong>Encryption:</strong> All database collections and connection paths utilize AES-256 and SSL/TLS encryption protocols.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-stone-700 text-xs">B</span>
                  </div>
                  <p className="text-[14px]">
                    <strong>Access Controls:</strong> System infrastructure access is strictly restricted to certified security administrators using multi-factor authorization.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-stone-700 text-xs">C</span>
                  </div>
                  <p className="text-[14px]">
                    <strong>Third-party Vendors:</strong> We only contract with vendors hosting SOC 2 compliant server environments (such as AWS and Vercel).
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-stone-100" />

            <section id="your-rights" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">5. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have specific rights under laws like the GDPR, CCPA, or other regional regulations:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-500">
                <li>The right to access or inspect the profile information we hold about you.</li>
                <li>The right to modify, correct, or update inaccurate information in your profile settings.</li>
                <li>The right to request immediate deletion of your VeritasAI user account and billing meta.</li>
                <li>The right to opt-out of marketing circulars or research email loops.</li>
              </ul>
            </section>

            <hr className="border-stone-100" />

            <section id="contact-us" className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">6. Contact Privacy Team</h2>
              <p>
                For any privacy questions, data requests, or compliance inquiries, please feel free to reach out to our dedicated privacy representatives:
              </p>
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-extrabold text-stone-800">VeritasAI Privacy Operations</p>
                  <p className="text-sm text-stone-500 mt-0.5">Narephat, Joshi Chowk, Kathmandu, Nepal</p>
                </div>
                <a 
                  href="mailto:privacy@veritasai.com"
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-colors"
                >
                  privacy@veritasai.com
                </a>
              </div>
            </section>

          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
