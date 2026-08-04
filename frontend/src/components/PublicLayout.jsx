"use client";

import React, { useState } from 'react';
import PublicHeader from './PublicHeader';

export default function PublicLayout({ children, hideHeaderWhenAuthenticated = true }) {
  const [headerVisible, setHeaderVisible] = useState(true);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] flex flex-col font-sans relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[300px] bg-gradient-to-r from-transparent via-[#7B82FF]/5 to-transparent blur-[100px] pointer-events-none z-0" />

      <PublicHeader
        hideWhenAuthenticated={hideHeaderWhenAuthenticated}
        onVisibilityChange={setHeaderVisible}
      />

      <main className={`flex-1 relative z-10 ${headerVisible ? 'pt-24' : 'pt-0'}`}>
        {children}
      </main>
    </div>
  );
}
