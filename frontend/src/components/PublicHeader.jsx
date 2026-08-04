"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import api from '../utils/api';
import safeLocalStorage from '../utils/safeLocalStorage';

const navigationItems = [
  { label: 'FAQ', href: '/#faq', matches: (pathname, hash) => pathname === '/' && hash === '#faq' },
  { label: 'Contact', href: '/contact', matches: (pathname) => pathname === '/contact' },
];

export default function PublicHeader({
  hideWhenAuthenticated = false,
  onVisibilityChange,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('checking');
  const [currentHash, setCurrentHash] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let active = true;

    api.get('/api/auth/me/', { suppressErrorLog: true, timeoutMs: 3000 })
      .then((response) => {
        if (!active) return;
        setAuthStatus(response.status === 'success' && response.user ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (active) setAuthStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollYRef.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  const headerIsVisible = !(hideWhenAuthenticated && authStatus === 'authenticated');

  useEffect(() => {
    onVisibilityChange?.(headerIsVisible);
  }, [headerIsVisible, onVisibilityChange]);

  const handleFaqClick = (event) => {
    setMobileMenuOpen(false);
    if (pathname !== '/') return;

    event.preventDefault();
    const faqSection = document.getElementById('faq');
    if (!faqSection) return;

    window.history.replaceState(null, '', '/#faq');
    setCurrentHash('#faq');
    faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch {
      // Clear local display data even if the backend is temporarily unavailable.
    }

    safeLocalStorage.removeItem('veritas_subscription_plan');
    safeLocalStorage.removeItem('veritas_display_name');
    safeLocalStorage.removeItem('veritas_email');
    setAuthStatus('anonymous');
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const renderNavLink = (item, mobile = false) => {
    const isActive = item.matches(pathname, currentHash);
    const baseClass = mobile
      ? 'rounded-xl px-3 py-3 text-left text-[16px] font-bold transition-colors'
      : 'relative flex min-h-11 items-center rounded-full px-3 text-[15px] font-medium tracking-wide transition-colors';
    const stateClass = isActive
      ? 'bg-[#7B82FF]/10 text-[#5E66E8]'
      : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-900';

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={item.label === 'FAQ' ? handleFaqClick : () => setMobileMenuOpen(false)}
        className={`${baseClass} ${stateClass}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.label}
        {!mobile && isActive && (
          <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[#7B82FF]" aria-hidden="true" />
        )}
      </Link>
    );
  };

  if (!headerIsVisible) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-stone-200/40 bg-[#FDFBF7]/85 px-4 py-4 shadow-[0_2px_20px_rgba(28,25,23,0.02)] backdrop-blur-md transition-transform duration-300 ease-in-out sm:px-6 sm:py-5 md:px-12 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-8 lg:gap-12">
          <Link
            href="/"
            className="flex min-h-11 items-center transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7B82FF]/20"
            title="Go to homepage"
            aria-label="VeritasAI homepage"
          >
            <Image
              src="/Vertias_io/android-chrome-192x192.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="ml-2 text-[18px] font-black tracking-tight text-stone-950">
              VeritasAI
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Public navigation">
            {navigationItems.map((item) => renderNavLink(item))}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {authStatus !== 'authenticated' && (
            <>
              <Link
                href="/login"
                className="hidden min-h-11 items-center rounded-full px-3 text-[15px] font-medium tracking-wide text-stone-600 transition-colors hover:bg-stone-100/70 hover:text-stone-900 md:flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden min-h-11 items-center rounded-full bg-[#7B82FF] px-6 py-2.5 text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#6870fa] hover:shadow-md md:flex"
              >
                Get Started
              </Link>
            </>
          )}

          {authStatus === 'authenticated' && !hideWhenAuthenticated && (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden min-h-11 items-center rounded-full border-0 bg-transparent px-3 text-[15px] font-medium tracking-wide text-stone-600 transition-colors hover:bg-stone-100/70 hover:text-stone-900 md:flex"
              >
                Logout
              </button>
              <Link
                href="/dashboard"
                className="hidden min-h-11 items-center rounded-full bg-[#7B82FF] px-6 py-2.5 text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#6870fa] hover:shadow-md md:flex"
              >
                Dashboard
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div
        id="public-mobile-navigation"
        className={`fixed inset-x-0 top-[72px] z-40 overflow-hidden border-b border-stone-200/50 bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-6 p-6">
          <nav className="flex flex-col gap-2" aria-label="Mobile public navigation">
            {navigationItems.map((item) => renderNavLink(item, true))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-stone-100 pt-4">
              {authStatus !== 'authenticated' ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-xl bg-stone-100 py-3 text-center text-[15px] font-bold text-stone-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-xl bg-[#7B82FF] py-3 text-center text-[15px] font-bold text-white"
                  >
                    Get Started
                  </Link>
                </>
              ) : !hideWhenAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl border-0 bg-stone-100 py-3 text-center text-[15px] font-bold text-stone-700"
                  >
                    Logout
                  </button>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-xl bg-[#7B82FF] py-3 text-center text-[15px] font-bold text-white"
                  >
                    Dashboard
                  </Link>
                </>
              ) : null}
            </div>
        </div>
      </div>
    </>
  );
}
