"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  User,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import safeLocalStorage from '../utils/safeLocalStorage';
import api from '../utils/api';

/**
 * Shared Sidebar component used by Dashboard, Payment, and Support pages.
 * Features:
 * - Collapsible desktop sidebar
 * - Mobile overlay drawer with hamburger toggle
 * - Active tab highlighting
 * - Profile card with plan badge
 *
 * @param {string} activeTab - Currently active tab ID
 * @param {function} onTabChange - Callback when tab changes (for in-page tabs)
 * @param {string} displayName - User's display name
 * @param {string} subscriptionPlan - User's subscription plan
 */
export default function Sidebar({ activeTab = 'dashboard', onTabChange, displayName = '', subscriptionPlan = 'Free', adminMode = false }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Auto-collapse sidebar on screens below 1024px
  useEffect(() => {
    const tabletQuery = window.matchMedia('(max-width: 1023px)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = () => {
      if (mobileQuery.matches) {
        setIsMobileOpen(false);
      }
      setIsSidebarCollapsed(tabletQuery.matches);
    };
    handleViewportChange();
    tabletQuery.addEventListener('change', handleViewportChange);
    mobileQuery.addEventListener('change', handleViewportChange);
    return () => {
      tabletQuery.removeEventListener('change', handleViewportChange);
      mobileQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    setIsAdmin(safeLocalStorage.getItem('veritas_is_admin') === 'true');
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleNavClick = (tabId, route) => {
    if (onTabChange && route?.startsWith('/dashboard')) {
      // In-page tab switching for dashboard
      onTabChange(tabId);
    } else if (route) {
      router.push(route);
    }
    setIsMobileOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch { /* ignore */ }
    safeLocalStorage.removeItem('veritas_subscription_plan');
    safeLocalStorage.removeItem('veritas_display_name');
    safeLocalStorage.removeItem('veritas_email');
    safeLocalStorage.removeItem('veritas_is_admin');
    router.push('/login');
    setIsMobileOpen(false);
    setShowLogoutConfirm(false);
  };

  const handleSubscribe = () => {
    if (adminMode) return;
    router.push('/payment?plan=monthly');
    setIsMobileOpen(false);
  };

  // Determine active state based on tab or current pathname
  const isActive = (tabId, route) => {
    if (activeTab === tabId) return true;
    if (route && pathname === route && !onTabChange) return true;
    return false;
  };

  const navButtonClass = (tabId, route) =>
    `flex items-center gap-3 rounded-full text-[15.5px] transition-all w-full text-left ${
      isActive(tabId, route)
        ? 'bg-stone-900 text-white shadow-sm font-semibold'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
    } ${isSidebarCollapsed && !isMobileOpen ? 'p-2.5 justify-center' : 'px-4 py-2.5'}`;

  const isCollapsed = isSidebarCollapsed && !isMobileOpen;

  const sidebarContent = (
    <>
      <div className={`flex flex-col gap-6 py-6 transition-all duration-300 ${isCollapsed ? 'px-3 items-center' : 'px-6'}`}>
        {/* Logo / Brand */}
        <div
          onClick={() => { router.push('/'); setIsMobileOpen(false); }}
          className={`flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title="Go to Homepage"
        >
          <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-lg shrink-0">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <span className="font-normal text-[22px] tracking-tight text-stone-900 transition-all duration-300 whitespace-nowrap overflow-hidden">
              Veritas<span className="font-bold">AI</span>
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-6 mt-4 w-full">
          {!adminMode && (
            <>
              <button
                onClick={() => handleNavClick('dashboard', '/dashboard')}
                className={navButtonClass('dashboard', '/dashboard')}
                title="Dashboard"
              >
                <LayoutDashboard size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">Dashboard</span>}
              </button>

              <button
                onClick={() => handleNavClick('detector', '/dashboard?tab=detector')}
                className={navButtonClass('detector', null)}
                title="AI Content Detector"
              >
                <ShieldCheck size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">AI Detector</span>}
              </button>

              {/* Account Section */}
              <div className="flex flex-col gap-2 w-full">
                {!isCollapsed && (
                  <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Account</span>
                )}
                <button
                  onClick={() => handleNavClick('account', '/dashboard?tab=account')}
                  className={`flex items-center gap-3 rounded-full text-[15.5px] transition-all text-left w-full ${
                    isActive('account', null)
                      ? 'bg-stone-900 text-white shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                  } ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
                  title="Account"
                >
                  <User size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">Account</span>}
                </button>
                <button
                  onClick={() => handleNavClick('plans', '/dashboard?tab=plans')}
                  className={`flex items-center gap-3 rounded-full text-[15.5px] transition-all text-left w-full ${
                    isActive('plans', null)
                      ? 'bg-stone-900 text-white shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                  } ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
                  title="Plans & Pricing"
                >
                  <CreditCard size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">Plans & Pricing</span>}
                </button>
              </div>
            </>
          )}

          {/* Admin Panel (only visible to admins) */}
          {isAdmin && (
            <div className="flex flex-col gap-2 w-full">
              {!isCollapsed && (
                <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Admin</span>
              )}
              <button
                onClick={() => { router.push('/admin'); setIsMobileOpen(false); }}
                className={`flex items-center gap-3 rounded-full text-[15.5px] transition-all text-left w-full ${
                  pathname === '/admin'
                    ? 'bg-stone-900 text-white shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
                } ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
                title="Admin Panel"
              >
                <ShieldCheck size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">Admin Panel</span>}
              </button>
            </div>
          )}

          {/* Help Section */}
          {!adminMode && <div className="flex flex-col gap-2 w-full">
            {!isCollapsed && (
              <span className="text-xs font-bold text-stone-400/80 tracking-wider uppercase px-4 whitespace-nowrap">Help</span>
            )}
            <button
              onClick={() => { router.push('/faq'); setIsMobileOpen(false); }}
              className={`flex items-center gap-3 rounded-full text-[15.5px] transition-all text-left w-full ${
                pathname === '/faq'
                  ? 'bg-stone-900 text-white shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 font-medium'
              } ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
              title="FAQ"
            >
              <HelpCircle size={18} className="shrink-0" />
              {!isCollapsed && <span className="truncate">FAQ</span>}
            </button>
            <button
              onClick={() => { router.push('/support'); setIsMobileOpen(false); }}
              className={`flex items-center gap-3 rounded-full font-medium text-[15.5px] transition-all text-left w-full ${
                pathname === '/support'
                  ? 'bg-stone-900 text-white shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
              } ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'}`}
              title="Support"
            >
              <LifeBuoy size={18} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Support</span>}
            </button>
            <button
              onClick={() => { window.open('https://discord.gg/YwGVj2V5Qk', '_blank', 'noopener,noreferrer'); setIsMobileOpen(false); }}
              className={`flex items-center gap-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 rounded-full font-medium text-[15.5px] transition-all text-left w-full ${
                isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-2'
              }`}
            title="Discord"
            >
              <MessageSquare size={18} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Discord</span>}
            </button>
          </div>}
        </nav>
      </div>

      {/* Profile Card / Footer inside Sidebar */}
      <div className={`p-4 border-t border-stone-200/60 flex flex-col gap-3 transition-all duration-300 ${isCollapsed ? 'items-center px-2' : ''}`}>
        {isCollapsed ? (
          <button
            onClick={() => handleNavClick('account', '/dashboard?tab=account')}
            className="relative cursor-pointer hover:scale-105 transition-all w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-[15px] shadow-sm border-none outline-none shrink-0"
            title={adminMode ? `${displayName} - Admin` : `${displayName} - ${subscriptionPlan} Plan`}
          >
            {(displayName || 'User').charAt(0)}
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white"></span>
          </button>
        ) : (
          <div className="w-full bg-[#EBE5D8]/80 backdrop-blur-[10px] border border-stone-300/60 shadow-[inset_4px_4px_12px_rgba(255,255,255,0.75),inset_-2px_-2px_6px_rgba(0,0,0,0.015),0_10px_25px_rgba(28,25,23,0.02)] p-4 rounded-2xl flex flex-col gap-3.5 text-stone-800 select-none">
            {/* Profile Details */}
            <div
              onClick={() => handleNavClick('account', '/dashboard?tab=account')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition text-left"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7755FF] to-[#4F33FF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {(displayName || 'User').charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#EDE7DC]"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[14px] tracking-tight truncate text-stone-900 leading-none">{displayName}</span>
                  {!adminMode && subscriptionPlan !== 'Free' && (
                    <span className="px-1.5 py-0.5 bg-[#1FA463]/10 text-[#1FA463] text-[8px] font-extrabold rounded-full uppercase tracking-wider border border-[#1FA463]/20 shrink-0">
                      {subscriptionPlan}
                    </span>
                  )}
                  {adminMode && (
                    <span className="px-1.5 py-0.5 bg-stone-900/10 text-stone-700 text-[8px] font-extrabold rounded-full uppercase tracking-wider border border-stone-900/10 shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-stone-500 text-[11px] font-semibold truncate leading-none mt-0.5">@{(displayName || 'user').toLowerCase().replace(/\s+/g, '_')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {!adminMode && subscriptionPlan === 'Free' ? (
                <button
                  onClick={handleSubscribe}
                  className="w-full py-1.5 pl-1.5 pr-4 bg-stone-950/5 hover:bg-stone-950/10 active:scale-98 border border-stone-900/5 rounded-full flex items-center gap-2.5 transition-all cursor-pointer text-left shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-stone-800 tracking-wide">Upgrade Now</span>
                </button>
              ) : !adminMode ? (
                <button
                  onClick={() => handleNavClick('plans', '/dashboard?tab=plans')}
                  className="w-full py-1.5 pl-1.5 pr-4 bg-[#1FA463]/5 hover:bg-[#1FA463]/10 border border-[#1FA463]/10 rounded-full flex items-center gap-2.5 transition-all cursor-pointer text-left shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1FA463] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#1FA463] tracking-wide">Manage Plan</span>
                </button>
              ) : null}

              <button
                onClick={handleLogoutClick}
                className="w-full py-2 bg-red-50/70 hover:bg-red-100/90 active:scale-98 border border-red-100/80 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer text-red-600 text-[11px] font-bold shadow-sm"
              >
                <LogOut size={13} className="shrink-0" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center shadow-md hover:bg-stone-50 transition-all cursor-pointer"
        title="Open Menu"
        aria-label="Open sidebar menu"
      >
        <Menu size={20} className="text-stone-700" />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (sticky) + Mobile (overlay) */}
      <aside
        className={`
          bg-[#FDFBF7] border-r border-stone-200/60 flex flex-col justify-between shrink-0 z-40 transition-all duration-300 ease-in-out relative
          ${/* Mobile overlay */''} 
          ${isMobileOpen
            ? 'fixed inset-y-0 left-0 w-72 shadow-2xl animate-slide-in-sidebar'
            : 'hidden md:flex'
          }
          ${/* Desktop sticky */''} 
          ${!isMobileOpen ? `h-screen sticky top-0 ${isSidebarCollapsed ? 'w-16' : 'w-72'}` : ''}
        `}
      >
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center transition z-50 cursor-pointer"
          title="Close Menu"
          aria-label="Close sidebar menu"
          >
            <X size={16} className="text-stone-600" />
          </button>
        )}

        {/* Desktop Toggle Collapse Button */}
        {!isMobileOpen && (
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex absolute top-[88px] right-0 translate-x-1/2 w-6 h-6 bg-white border border-stone-200 rounded-full items-center justify-center hover:bg-stone-50 hover:border-stone-300 shadow-sm transition z-50 group cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={13} className="text-stone-500 group-hover:text-stone-800 transition" />
            ) : (
              <ChevronLeft size={13} className="text-stone-500 group-hover:text-stone-800 transition" />
            )}
          </button>
        )}

        {sidebarContent}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-slide-up p-6 md:p-8 text-center relative">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Sign out?</h3>
            <p className="text-[14px] font-medium text-stone-500 mb-6">Are you sure you want to sign out of VeritasAI?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[14px] text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer border-0"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer border-0"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
