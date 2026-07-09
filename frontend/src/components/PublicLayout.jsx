"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Facebook, Linkedin, Twitter, ArrowLeft, Menu, X } from 'lucide-react';

export default function PublicLayout({ children }) {
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[300px] bg-gradient-to-r from-transparent via-[#7B82FF]/5 to-transparent blur-[100px] pointer-events-none z-0" />

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

      <main className="flex-1 pt-24 relative z-10">
        {children}
      </main>
    </div>
  );
}
