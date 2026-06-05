import React from 'react';
import { Instagram, MessageSquare, Twitter } from 'lucide-react';

const Footer = ({ className = "" }) => {
  return (
    <footer className={`w-full bg-[#FDFBF7] border-t border-stone-200/60 pt-16 pb-10 mt-20 relative overflow-hidden rounded-b-3xl ${className}`}>
      {/* Subtle top divider line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        
        {/* Left Side: Brand Logo */}
        <div className="select-none flex items-center justify-start py-4">
          {/* Giant Wordmark */}
          <div className="font-extrabold text-[45px] sm:text-[60px] md:text-[80px] tracking-tight text-stone-900 leading-none select-none font-black flex items-center">
            VERITAS<span className="text-[#7755FF] drop-shadow-sm">AI</span>
          </div>
        </div>

        {/* Right Side: Links & Disclaimer Columns */}
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            
            {/* Column 1: Products & Privacy */}
            <div className="flex flex-col justify-between min-h-[140px]">
              <div className="flex flex-col gap-3">
                <h4 className="text-stone-900 font-extrabold text-sm tracking-tight">Products</h4>
                <ul className="flex flex-col gap-2.5 text-xs font-semibold text-stone-500">
                  <li><a href="#" className="hover:text-stone-900 transition-colors">AI Detector</a></li>
                  <li><a href="#" className="hover:text-[#1FA463] transition-colors">Misinformation Signals</a></li>
                  <li><a href="#" className="hover:text-stone-900 transition-colors">Plagiarism Check</a></li>
                </ul>
              </div>
              <div className="text-[11px] font-semibold text-stone-400 mt-6 hover:text-stone-700 transition-colors">
                <a href="#">Privacy Policy</a>
              </div>
            </div>

            {/* Column 2: Support & Terms */}
            <div className="flex flex-col justify-between min-h-[140px]">
              <div className="flex flex-col gap-3">
                <h4 className="text-stone-900 font-extrabold text-sm tracking-tight">Help</h4>
                <ul className="flex flex-col gap-2.5 text-xs font-semibold text-stone-500">
                  <li><a href="#" className="hover:text-stone-900 transition-colors">FAQs</a></li>
                  <li><a href="#" className="hover:text-stone-900 transition-colors">Plans & Pricing</a></li>
                  <li><a href="#" className="hover:text-stone-900 transition-colors">Contact Support</a></li>
                </ul>
              </div>
              <div className="text-[11px] font-semibold text-stone-400 mt-6 hover:text-stone-700 transition-colors">
                <a href="#">Terms & Conditions</a>
              </div>
            </div>

            {/* Column 3: Social & Disclaimer & Copyright */}
            <div className="flex flex-col justify-between min-h-[140px] gap-4">
              <div className="flex flex-col gap-3">
                {/* Social Icons */}
                <div className="flex items-center gap-4 text-stone-500">
                  <a href="#" className="hover:text-stone-900 hover:scale-110 transition-all"><Instagram size={17} /></a>
                  <a href="https://discord.gg/YwGVj2V5Qk" target="_blank" rel="noreferrer" className="hover:text-stone-900 hover:scale-110 transition-all"><MessageSquare size={17} /></a>
                  <a href="#" className="hover:text-stone-900 hover:scale-110 transition-all"><Twitter size={17} /></a>
                </div>
                {/* AI Disclaimer */}
                <p className="text-[10px] text-stone-400 leading-normal font-semibold max-w-[220px]">
                  VeritasAI provides probabilistic content evaluation. Detection results are estimates and should not be used as definitive proof of text origin.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-stone-400 mt-2 whitespace-nowrap">
                © 2026 VeritasAI. All Rights Reserved.
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
