"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Target, Users, GraduationCap, Shield } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col font-sans">
      
      {/* Background Glow Effect - Exactly mimicking the image */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[350px] bg-gradient-to-r from-transparent via-[#4B55FF]/40 to-transparent blur-[90px] pointer-events-none z-0"></div>
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[150px] bg-[#6B72FF]/50 blur-[100px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="w-full flex items-center justify-between px-12 py-8 relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-lg">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[22px] tracking-tight">VeritasAI</span>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/subscription')} className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors tracking-wide">
            Pricing
          </button>
          <button onClick={() => router.push('/login')} className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors tracking-wide">
            Login
          </button>
          <button onClick={() => router.push('/register')} className="bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[15px] font-bold py-2.5 px-6 rounded-full transition-all">
            Start for Free
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center pt-28 relative z-10 px-4">
        
        <div className="text-center max-w-4xl mx-auto flex flex-col gap-6">
          <h1 className="text-[60px] font-extrabold text-white tracking-tight">
            About VeritasAI
          </h1>
          
          <p className="text-[#a1a1aa] text-[17px] leading-relaxed max-w-[800px] mx-auto font-medium">
            At VeritasAI, we believe ensuring AI text authenticity should be simple. We're here to help you identify AI-generated content, improve source credibility, and connect with your audience on a deeper level.
          </p>
        </div>

      </main>
      
      {/* Stats Section & Privacy Pill */}
      <div className="relative z-20 w-full flex flex-col items-center px-4 mt-12 mb-16">
        {/* Stats Card */}
        <div className="w-full max-w-[1050px] bg-white rounded-3xl p-6 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 w-full">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center p-8 gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#E8F8F5] flex items-center justify-center mb-1">
                <Target size={24} className="text-[#10B981]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[38px] leading-none font-bold text-[#10B981] tracking-tight">90%</h3>
              <p className="font-bold text-[#1F2937] text-[17px]">Accuracy</p>
              <p className="text-[#6B7280] text-[14px]">Advanced AI detection<br />you can trust.</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center p-8 gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#EEF2FF] flex items-center justify-center mb-1">
                <Users size={24} className="text-[#6366F1]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[38px] leading-none font-bold text-[#6366F1] tracking-tight">10k+</h3>
              <p className="font-bold text-[#1F2937] text-[17px]">Users Worldwide</p>
              <p className="text-[#6B7280] text-[14px]">Writers, students, teachers<br />and professionals.</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center p-8 gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#EFF6FF] flex items-center justify-center mb-1">
                <GraduationCap size={26} className="text-[#3B82F6]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[38px] leading-none font-bold text-[#3B82F6] tracking-tight">1k+</h3>
              <p className="font-bold text-[#1F2937] text-[17px]">Educators</p>
              <p className="text-[#6B7280] text-[14px]">Schools and universities<br />trust VeritasAI.</p>
            </div>

          </div>
        </div>

        {/* Privacy Pill */}
        <div className="mt-8 bg-white rounded-full py-3.5 px-6 flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.05)] border border-gray-100">
          <div className="w-[30px] h-[30px] rounded-full bg-[#E5F5ED] flex items-center justify-center">
            <Shield size={16} className="text-[#10B981]" strokeWidth={3} />
          </div>
          <p className="text-[#4B5563] text-[15px] font-medium tracking-tight">
            Your privacy is our priority. We <span className="text-[#10B981] font-bold">never</span> store your content.
          </p>
        </div>
      </div>
      
      {/* The emerging bottom container shown in the image */}
      <div className="w-full flex justify-center relative z-10 mt-0">
        <div className="w-full max-w-[1200px] h-[200px] bg-[#0c0c0c] border-t border-x border-[#222] rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative pattern-grid-lg">            
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4B55FF]/40 to-transparent"></div>
        </div>
      </div>
      
    </div>
  );
}
