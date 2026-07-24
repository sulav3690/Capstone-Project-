"use client";

import React, { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '../../components/ToastProvider';
import api from '../../utils/api';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/api/support/', formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      showToast(err.message || 'Could not send your message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#7B82FF]/10 text-[#7B82FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <MessageSquare size={14} />
            Connect With VeritasAI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none mb-4">
            Contact Our Team
          </h1>
          <p className="text-stone-500 font-semibold text-[15px] leading-relaxed">
            Have questions about subscriptions, API keys, or custom enterprise solutions? Drop us a line and we'll reply within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            
            {/* Email Card */}
            <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(28,25,23,0.01)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(28,25,23,0.03)] transition-all duration-300 group">
              <div className="flex gap-5 items-start">
                <div className="bg-[#7B82FF]/10 text-[#7B82FF] p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-[15px] mb-1">Direct Support</h3>
                  <p className="text-stone-500 text-xs font-medium mb-3">Reach our helpdesk directly for fast resolutions.</p>
                  <a href="mailto:support@veritasai.com" className="text-stone-900 font-bold text-sm hover:text-[#7B82FF] transition-colors">
                    support@veritasai.com
                  </a>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(28,25,23,0.01)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(28,25,23,0.03)] transition-all duration-300 group">
              <div className="flex gap-5 items-start">
                <div className="bg-[#1FA463]/10 text-[#1FA463] p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-[15px] mb-1">Support Hours</h3>
                  <p className="text-stone-500 text-xs font-medium mb-1">Our support team operations are active:</p>
                  <p className="text-stone-900 font-bold text-sm">Monday – Friday: 9am – 6pm EST</p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(28,25,23,0.01)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(28,25,23,0.03)] transition-all duration-300 group">
              <div className="flex gap-5 items-start">
                <div className="bg-amber-100/70 text-amber-700 p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-[15px] mb-1">Nepal Office</h3>
                  <p className="text-stone-500 text-xs font-medium mb-1">Veritas AI</p>
                  <p className="text-stone-900 font-bold text-sm leading-relaxed">
                    Nepal, Narephat joshi chowk
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Helper Card */}
            <div className="bg-gradient-to-br from-[#7755FF]/5 to-[#4F33FF]/5 border border-[#7755FF]/15 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
                <HelpCircle size={100} className="text-[#4F33FF]" />
              </div>
              <h3 className="font-bold text-stone-900 text-[15px] mb-1 flex items-center gap-2">
                Need Instant Answers?
              </h3>
              <p className="text-stone-500 text-xs font-medium leading-relaxed mb-4 max-w-[280px]">
                Check out our Frequently Asked Questions section on our home page. We might already have the answer!
              </p>
              <Link href="/faq" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F33FF] hover:translate-x-1 transition-transform duration-200">
                View Frequently Asked Questions &rarr;
              </Link>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3 w-full bg-white border border-stone-200/50 rounded-3xl p-8 md:p-10 shadow-[0_10px_30px_rgba(28,25,23,0.015)] relative overflow-hidden">
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-stone-900 mb-1">Send a Message</h2>
                  <p className="text-stone-500 text-xs font-medium">Please fill in details below to start the support ticket.</p>
                </div>

                {/* Name & Email inputs in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-stone-700" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#FDFBF7]/40 text-stone-800 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B82FF]/30 focus:border-[#7B82FF] hover:border-stone-300 transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-stone-700" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#FDFBF7]/40 text-stone-800 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B82FF]/30 focus:border-[#7B82FF] hover:border-stone-300 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-stone-700" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    required
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subscription inquiry, API access, etc."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#FDFBF7]/40 text-stone-800 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B82FF]/30 focus:border-[#7B82FF] hover:border-stone-300 transition-all shadow-sm"
                  />
                </div>

                {/* Message Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-stone-700" htmlFor="message">
                    Your Message
                  </label>
                  <textarea
                    required
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Please type your message in detail here..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#FDFBF7]/40 text-stone-800 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B82FF]/30 focus:border-[#7B82FF] hover:border-stone-300 transition-all shadow-sm resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 select-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center gap-5">
                <div className="w-16 h-16 bg-[#1FA463]/10 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <CheckCircle size={32} className="text-[#1FA463]" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">Message Sent!</h2>
                <p className="text-stone-500 text-[14px] leading-relaxed max-w-sm">
                  Thank you for reaching out. We have logged your support ticket and our team will get back to you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Send another message
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
