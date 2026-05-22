"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Play, Sparkles, ShieldCheck, UserCircle2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <>
      {showGoogleModal && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center font-sans tracking-normal">
          {/* The white card container with light gray bg */}
          <div className="bg-[#F0F4F9] w-full max-w-[1040px] sm:rounded-[28px] overflow-hidden flex flex-col pt-6 pb-16 min-h-screen sm:min-h-0 sm:shadow-sm">
            
            {/* Top left header */}
            <div className="flex items-center gap-2 px-10 mb-10 sm:mt-0 mt-4">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px] pointer-events-none" />
              <span className="text-[#444746] font-medium text-[15px]">Sign in with Google</span>
            </div>

            <div className="flex flex-col md:flex-row px-10 gap-10 md:gap-20 md:pr-24">
               {/* Left Side */}
               <div className="flex-1 max-w-[420px]">
                 <div className="flex flex-col gap-5">
                   <div className="w-12 h-12 flex items-center justify-start">
                     <ShieldCheck className="text-[#1FA463] w-[38px] h-[38px]" strokeWidth={2.5} />
                   </div>
                   <h1 className="text-[36px] font-normal leading-[1.2] text-[#1F1F1F]">Choose an account</h1>
                   <p className="text-[16px] text-[#1F1F1F] mt-[-5px]">to continue to <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">VeritasAI</span></p>
                 </div>
               </div>

               {/* Right Side */}
               <div className="flex-1 flex flex-col items-start min-w-[320px]">
                 <div className="w-full flex flex-col border border-gray-300 sm:border-gray-200 bg-white rounded-3xl overflow-hidden sm:shadow-sm">
                   
                   {/* Valid Account */}
                   <button onClick={() => { setShowGoogleModal(false); router.push('/dashboard'); }} className="w-full flex items-center justify-between px-6 py-[15px] hover:bg-[#F8FAFD] transition-colors border-b border-gray-200 text-left">
                     <div className="flex items-center gap-3.5">
                       <div className="w-[34px] h-[34px] rounded-full bg-[#8E24AA] flex items-center justify-center text-white font-medium text-[15px]">
                         S
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[#1F1F1F] font-medium text-[14px]">Sulav Sharma</span>
                         <span className="text-[#444746] text-[12px] tracking-wide mt-[-2px]">sulavshrm@gmail.com</span>
                       </div>
                     </div>
                   </button>
                   
                   {/* Use another account */}
                   <button onClick={() => alert('Only this demo account is available right now!')} className="w-full flex items-center px-6 py-[15px] hover:bg-[#F8FAFD] transition-colors text-left group">
                     <div className="flex items-center gap-3.5">
                       <div className="w-[34px] h-[34px] flex items-center justify-center text-[#444746]">
                         <UserCircle2 size={20} className="text-[#1F1F1F]" strokeWidth={1.5} />
                       </div>
                       <span className="text-[#1F1F1F] font-medium text-[14px]">Use another account</span>
                     </div>
                   </button>
                 </div>

                 <div className="mt-8 text-[12px] text-[#444746] w-full max-w-md leading-[1.6] tracking-wide">
                   Before using this app, you can review VeritasAI's <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">Terms of Service</span>.
                 </div>
               </div>
            </div>

          </div>
          
          {/* Footer */}
          <div className="w-full max-w-[1040px] flex items-center justify-between mt-3 px-6 text-[12px] text-[#444746] font-medium">
            <select className="bg-transparent outline-none cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
              <option>English (United Kingdom)</option>
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowGoogleModal(false)} className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors text-gray-400">Cancel Mock Auth</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors">Help</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors">Privacy</button>
              <button className="hover:bg-gray-100 px-3 py-1.5 rounded transition-colors">Terms</button>
            </div>
          </div>
        </div>
      )}

    <div className="min-h-screen w-full flex bg-[#F6F8F9]">
      
      {/* Left side - Marketing Hero */}
      <div className="hidden lg:flex flex-1 bg-white relative flex-col items-center justify-center p-12 text-center border-r border-gray-100 overflow-hidden">
        
        {/* Subtle background radial circles from image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border-[50px] border-[#F4FAF7] rounded-full opacity-60 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[40px] border-[#F4FAF7] rounded-full opacity-80 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl flex flex-col items-center">
          {/* Pill */}
          <div className="bg-[#E4F5ED] text-[#1FA463] text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 mb-8 tracking-wider uppercase">
            <Sparkles size={14} strokeWidth={2.5} />
            AI Detection, Done Right
          </div>

          {/* Title */}
          <h1 className="text-[54px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
            AI detector made to<br />Preserve what's <span className="text-[#1FA463]">human.</span>
          </h1>

          {/* Paragraph */}
          <p className="text-[#64748B] text-[17px] mb-10 leading-relaxed font-medium">
            VeritasAI detects AI content from ChatGPT, GPT-4, Claude,<br />
            <span className="font-bold text-[#334155]">Gemini and more</span> — and provides you the most<br />
            authentic and meaningful output.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#F0F4F8] rounded-2xl shadow-md p-10 flex flex-col items-center gap-6 relative z-20">
          {/* Brand */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-3xl font-extrabold text-[#1FA463] tracking-tight">VeritasAI</h1>
            <p className="text-gray-500 text-sm">An AI detector System</p>
          </div>

          {/* Form */}
          <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Username:</label>
              <input
                id="login-username"
                name="username"
                type="text"
                required
                placeholder="Enter username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Password:</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="Enter password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-1">
              <button
                id="login-submit"
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                Login
              </button>
              <button
                id="login-register"
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-2.5 rounded-full bg-[#F36C3D] hover:bg-[#e05a2b] text-white font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                Register
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Logins */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-full transition-all shadow-sm active:scale-95"
              onClick={() => setShowGoogleModal(true)}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 pointer-events-none" />
              Sign in with Google
            </button>
          </div>

          {/* Language Badge */}
          <div className="flex justify-start w-full">
            <span className="bg-[#3B6FB5] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              English
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
