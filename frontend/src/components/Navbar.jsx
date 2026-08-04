"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, X } from 'lucide-react';
import safeLocalStorage from '../utils/safeLocalStorage';
import api from '../utils/api';

const Navbar = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY || 0;

    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      const lastY = lastScrollYRef.current;

      if (currentY <= 12) {
        setNavVisible(true);
      } else if (currentY > lastY + 6) {
        setMobileMenuOpen(false);
        setNavVisible(false);
      } else if (currentY < lastY - 6) {
        setNavVisible(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch {
      // Clear the local session even if the server is temporarily unavailable.
    }
    [
      'veritas_subscription_plan',
      'veritas_display_name',
      'veritas_email',
      'veritas_is_admin',
    ].forEach((key) => safeLocalStorage.removeItem(key));
    router.push('/login');
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push('/');
  };

  return (
    <header className={`sticky top-0 z-50 border-b border-stone-200/60 bg-[#FDFBF7]/95 text-stone-900 shadow-sm backdrop-blur-md transition-all duration-300 ${
      mobileMenuOpen || navVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/Vertias_io/android-chrome-192x192.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold leading-tight">VeritasAI</span>
              <span className="hidden text-[11px] font-medium text-stone-400 sm:block">Workspace</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Workspace navigation">
          <Link href="/dashboard" className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
            Dashboard
          </Link>
          <Link href="/payment?plan=monthly" className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
            Plans
          </Link>
          <Link href="/feedback" className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
            Feedback
          </Link>
          <button onClick={handleLogout} className="ml-1 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-700">
            Sign out
          </button>
        </nav>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 transition hover:bg-stone-100 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="workspace-mobile-navigation"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="workspace-mobile-navigation"
        className={`overflow-hidden border-stone-200 bg-white transition-all duration-200 md:hidden ${
          mobileMenuOpen ? 'max-h-80 border-t opacity-100' : 'max-h-0 border-t-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-2 p-4" aria-label="Mobile workspace navigation">
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50">Dashboard</Link>
          <Link href="/payment?plan=monthly" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50">Plans</Link>
          <Link href="/feedback" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50">Feedback</Link>
          <button onClick={handleLogout} className="rounded-xl bg-stone-900 px-4 py-3 text-left text-sm font-bold text-white">Sign out</button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
