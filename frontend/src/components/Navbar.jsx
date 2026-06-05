"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ToastProvider';

const Navbar = () => {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <nav className="h-[70px] bg-[#5A6F78] flex items-center justify-between px-10 text-white sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1 pr-3 hover:bg-white/10 rounded-full transition-colors flex items-center">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-bold text-xl tracking-tight leading-tight">Welcome Administrator!</h1>
          <p className="text-sm text-white/90 font-light translate-y-[-2px]">Dashboard Info</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/subscription')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
          Subscription
        </button>
        <button onClick={() => showToast('Language selection is currently set to English.', 'success')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
          English
        </button>
        <button onClick={() => router.push('/feedback')} className="bg-white text-gray-800 text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-50 flex items-center h-[34px]">
          Feedback
        </button>
        <button onClick={() => router.push('/login')} className="bg-[#F36C3D] text-white text-sm font-semibold py-1.5 px-6 rounded-md shadow-sm hover:bg-opacity-90 flex items-center h-[34px] ml-1">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
