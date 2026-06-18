"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Facebook, Linkedin, Twitter, ArrowLeft, Menu, X } from 'lucide-react';

export default function PublicLayout({ children }) {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background glow matching landing page design */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[300px] bg-gradient-to-r from-transparent via-[#7B82FF]/5 to-transparent blur-[100px] pointer-events-none z-0"></div>

      {/* Public Header/Navbar */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 sm:py-5 bg-[#FDFBF7]/85 backdrop-blur-md border-b border-stone-200/40 shadow-[0_2px_20px_rgba(28,25,23,0.02)] transition-transform duration-300 ease-in-out ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[20px] tracking-tight text-stone-900">VeritasAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[14px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              Home
            </Link>
            <Link href="/subscription" className="text-[14px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              Pricing
            </Link>
            <Link href="/contact" className="text-[14px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden md:block text-[14px] font-medium text-stone-600 hover:text-stone-900 transition-colors tracking-wide">
            Login
          </Link>
          <Link 
            href="/dashboard" 
            className="hidden md:flex bg-[#7B82FF] hover:bg-[#6870fa] text-white text-[14px] font-semibold py-2 px-5 rounded-full shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
          >
            Dashboard
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`fixed inset-x-0 top-[72px] bg-white border-b border-stone-200/50 shadow-xl transition-all duration-300 ease-in-out z-40 md:hidden overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-6 gap-6">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold text-stone-800">Home</Link>
            <Link href="/subscription" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold text-stone-800">Pricing</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold text-stone-800">Contact</Link>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center text-[15px] font-bold text-stone-700 bg-stone-100 rounded-xl">
              Login
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center text-[15px] font-bold text-white bg-[#7B82FF] rounded-xl">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <main className="flex-1 pt-24 relative z-10">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="w-full flex justify-center relative z-10 mt-16">
        <div className="w-full max-w-[1200px] bg-white border-t border-x border-stone-200/60 rounded-t-[32px] shadow-[0_-15px_40px_rgba(28,25,23,0.03)] relative px-6 sm:px-12 pt-14 pb-10">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B82FF]/20 to-transparent"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 md:gap-12">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 flex flex-col gap-4 md:items-start items-center text-center md:text-left">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[5px] rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <ShieldCheck size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg tracking-tight text-stone-900">VeritasAI</span>
              </Link>
              <p className="text-stone-500 text-[13px] leading-relaxed max-w-[240px]">
                Ensuring AI text authenticity should be simple. We help preserve what is human.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-stone-400">
                <a href="#" className="hover:text-stone-950 transition-colors hover:scale-110 duration-200"><Facebook size={16} /></a>
                <a href="#" className="hover:text-stone-950 transition-colors hover:scale-110 duration-200"><Linkedin size={16} /></a>
                <a href="#" className="hover:text-stone-950 transition-colors hover:scale-110 duration-200"><Twitter size={16} /></a>
              </div>
              <div className="text-[11px] text-stone-400 font-medium mt-1">
                © 2023 - 2026 VeritasAI. All rights reserved.
              </div>
            </div>

            {/* Column 2: Products */}
            <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <h4 className="text-stone-900 font-bold text-sm tracking-wide">Products</h4>
              <ul className="flex flex-col gap-2 text-[13px] font-medium text-stone-500">
                <li><Link href="/" className="hover:text-stone-900 transition-colors">AI Detector</Link></li>
                <li><Link href="/" className="hover:text-stone-900 transition-colors">Misinformation Signals</Link></li>
                <li><Link href="/" className="hover:text-stone-900 transition-colors">Plagiarism Checker</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <h4 className="font-bold text-[13px] tracking-widest uppercase text-stone-900">Resources</h4>
              <nav className="flex flex-col gap-2.5 text-[14px] text-stone-500">
                <Link href="/subscription" className="hover:text-[#7B82FF] transition-colors font-medium">Pricing</Link>
                <Link href="/contact" className="hover:text-[#7B82FF] transition-colors font-medium">Contact</Link>
                <Link href="/faq" className="hover:text-[#7B82FF] transition-colors font-medium">FAQ</Link>
              </nav>
            </div>

            {/* Column 4: Legal */}
            <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <h4 className="text-stone-900 font-bold text-sm tracking-wide">Company</h4>
              <ul className="flex flex-col gap-2 text-[13px] font-medium text-stone-500">
                <li><a href="#" className="hover:text-stone-900 transition-colors">About us</a></li>
                <li><Link href="/#faq" className="hover:text-stone-900 transition-colors">FAQ</Link></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Column 5: Legal & Help */}
            <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <h4 className="text-stone-900 font-bold text-sm tracking-wide">Help & Legal</h4>
              <ul className="flex flex-col gap-2 text-[13px] font-medium text-stone-500">
                <li><Link href="/contact" className="hover:text-stone-900 transition-colors">Contact Support</Link></li>
                <li><Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-stone-900 transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
