"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import emailjs from '@emailjs/browser';

export default function Feedback() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const whyChooseUsChecked = formData.getAll('why_choose_us');

    const templateParams = {
      hear_about_us: formData.get('hear_about_us') || '',
      role: formData.get('role') || '',
      ai_usage: formData.get('ai_usage') || '',
      why_choose_us: whyChooseUsChecked.join(', '),
    };

    // Send feedback data using @emailjs/browser
    emailjs.send(
      'service_98z4snm',
      'template_r8cy4sw',
      templateParams,
      'cPgeihOtrEGV8iPwT'
    )
    .then((result) => {
      console.log("EmailJS Success:", result.text);
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
    });

    setIsSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8 mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
          
          <div className="bg-[#1FA463] px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Tell Us About Yourself</h1>
            <p className="text-white/80 text-sm mt-2">Your feedback helps us improve VeritasAI.</p>
          </div>

          {!isSubmitted ? (
            <form className="p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              
              {/* Question 1 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  1. Where did you hear about us? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    name="hear_about_us"
                    defaultValue=""
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="social_media">Social Media (Twitter, LinkedIn, etc.)</option>
                    <option value="search_engine">Search Engine (Google, Bing)</option>
                    <option value="friend">Friend / Colleague</option>
                    <option value="university">University / School</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  2. Are you a student, teacher, or writer? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="student" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" required />
                    <span className="text-sm font-semibold text-gray-700">Student</span>
                  </label>
                  <label className="flex-1 cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="teacher" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">Teacher</span>
                  </label>
                  <label className="flex-1 cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all p-4 flex items-center gap-3">
                    <input type="radio" name="role" value="writer" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">Writer</span>
                  </label>
                </div>
              </div>

              {/* Question 3 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  3. Have you used AI tools before? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-8 py-3 flex items-center gap-3">
                    <input type="radio" name="ai_usage" value="yes" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" required />
                    <span className="text-sm font-semibold text-gray-700">Yes</span>
                  </label>
                  <label className="cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-8 py-3 flex items-center gap-3">
                    <input type="radio" name="ai_usage" value="no" className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463]" />
                    <span className="text-sm font-semibold text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Question 4 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-800">
                  4. Why did you choose us? <span className="text-gray-500 font-normal ml-1">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Fast results",
                    "Easy to use",
                    "Modern AI technology",
                    "Supports students and writers",
                    "Clean interface"
                  ].map((reason, index) => (
                    <label key={index} className="cursor-pointer border border-gray-200 rounded-xl bg-[#F9FAFB] hover:border-[#1FA463] transition-all px-4 py-3 flex items-center gap-3">
                      <input type="checkbox" name="why_choose_us" value={reason} className="w-4 h-4 text-[#1FA463] focus:ring-[#1FA463] rounded" />
                      <span className="text-sm font-semibold text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-[2px] active:scale-[0.98]"
                >
                  Submit Survey
                </button>
              </div>

            </form>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-[#1FA463]/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
              <p className="text-gray-500 max-w-sm mb-4">
                Your feedback has been submitted successfully. Taking you back to the dashboard...
              </p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
