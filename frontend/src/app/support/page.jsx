"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useToast } from '../../components/ToastProvider';
import safeLocalStorage from '../../utils/safeLocalStorage';

export default function SupportPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sidebar info
  const [displayName, setDisplayName] = useState('');
  const subscriptionPlan = typeof window !== 'undefined' 
    ? safeLocalStorage.getItem('veritas_subscription_plan') || 'Free'
    : 'Free';

  useEffect(() => {
    setIsMounted(true);
    const savedName = safeLocalStorage.getItem('veritas_display_name');
    if (!savedName) {
      router.push('/login');
      return;
    }
    setDisplayName(savedName);
  }, [router]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      showToast('Your message has been sent to our support team!', 'success');
    }, 1500);
  };

  if (!isMounted) return <div className="min-h-screen bg-[#F8F5EF]" />;

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col font-sans text-stone-800">
      <div className="flex flex-1 w-full">
        <Sidebar 
          activeTab="support"
          displayName={displayName}
          subscriptionPlan={subscriptionPlan}
        />

        <main className="flex-1 w-full px-5 py-14 sm:px-8 lg:px-12">
          <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1080px] items-center">
            <div className="grid w-full grid-cols-1 gap-10 p-7 animate-fade-in lg:grid-cols-[1fr_0.92fr] lg:p-12">
              <div className="flex min-h-[520px] flex-col justify-between">
                <div>
                  <div className="mb-16 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-[#F8F5EF] text-[#1FA463]">
                      <ShieldCheck size={22} strokeWidth={2.4} />
                    </div>
                    <div className="h-7 w-px bg-stone-200" />
                    <span className="text-sm font-extrabold text-stone-900">
                      Veritas<span className="text-[#1FA463]">AI</span> Support
                    </span>
                  </div>

                  <h1 className="max-w-[430px] text-5xl font-black leading-[1.05] tracking-normal text-stone-950 sm:text-6xl">
                    Talk to our support team
                  </h1>
                  <p className="mt-6 max-w-[430px] text-[15px] font-medium leading-7 text-stone-500">
                    Reach out for help with AI detection results, billing, account access, or anything else about your VeritasAI workspace.
                  </p>
                </div>

                <div className="mt-12 flex flex-col gap-5">
                  <a href="mailto:support@veritasai.com" className="flex items-center gap-4 text-sm font-bold text-stone-800 transition hover:text-[#1FA463]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8F5EF] text-stone-600">
                      <Mail size={17} />
                    </span>
                    support@veritasai.com
                  </a>
                  <div className="flex items-center gap-4 text-sm font-bold text-stone-800">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8F5EF] text-stone-600">
                      <MessageSquare size={17} />
                    </span>
                    Help with detector results, plans, and account setup
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-stone-800">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8F5EF] text-stone-600">
                      <Phone size={17} />
                    </span>
                    Typical response within 24 hours
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] bg-[#F3F1EC] p-6 sm:p-7">
                <form onSubmit={handleContactSubmit} className="flex h-full flex-col justify-center gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 placeholder:font-medium focus:border-[#1FA463] focus:ring-4 focus:ring-[#1FA463]/10"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 placeholder:font-medium focus:border-[#1FA463] focus:ring-4 focus:ring-[#1FA463]/10"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-700">Subject</label>
                    <input
                      type="text"
                      placeholder="Billing inquiry, false positive report..."
                      className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 placeholder:font-medium focus:border-[#1FA463] focus:ring-4 focus:ring-[#1FA463]/10"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-700">Message</label>
                    <textarea 
                      placeholder="Write your message here"
                      rows={6}
                      className="w-full resize-none rounded-xl border border-transparent bg-white p-4 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 placeholder:font-medium focus:border-[#1FA463] focus:ring-4 focus:ring-[#1FA463]/10"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#1FA463] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98] sm:w-fit"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}