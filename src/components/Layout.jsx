import React from 'react';
import Navbar from './Navbar';

import { ShieldCheck } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 p-10 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
      
      {/* Footer matching exactly from the design text image */}
      <footer className="mt-10 py-12 flex flex-col items-center justify-center text-center">
        <div className="flex gap-6 text-[13px] text-gray-400 font-semibold mb-8">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
          <a href="#" className="hover:text-gray-600">Contact Support</a>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-[#1FA463]" />
          <span className="font-bold text-gray-500 text-[15px]">VeritasAI</span>
        </div>
        <p className="text-[#9ca3af] text-[11px] font-medium">© 2024 VeritasAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
