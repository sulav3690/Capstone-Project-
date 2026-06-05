import React from 'react';
import { Check } from 'lucide-react';

const PlanCard = ({ title, price, period, features, buttonText, highlighted = false, onSubscribe }) => {
  return (
    <div className={`relative flex flex-col h-full flex-1 bg-white rounded-2xl p-8 transition-transform hover:scale-[1.02] ${highlighted ? 'border-[#1FA463] border-2 shadow-lg pt-10' : 'border border-gray-100 shadow-sm'}`}>
      
      {highlighted && (
        <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-[5px] bg-[#1FA463] text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider whitespace-nowrap z-10">
          Most Popular
        </span>
      )}

      <div className="mb-6 text-left">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-gray-900 leading-none tracking-tight">{price}</span>
          <span className="text-gray-400 font-medium text-[13px] ml-1">/{period}</span>
        </div>
      </div>

      <button
        onClick={onSubscribe}
        className={`w-full py-2.5 rounded-lg font-bold text-[13px] mb-8 transition-colors ${highlighted ? 'bg-[#1FA463] text-white hover:bg-[#178a52]' : 'bg-[#F3F4F6] text-gray-800 hover:bg-gray-200'}`}
      >
        {buttonText}
      </button>

      <ul className="flex-1 space-y-3.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
            <div className="border-[1.5px] border-[#1FA463] rounded-full p-[1px] flex-shrink-0">
              <Check size={11} strokeWidth={4} className="text-[#1FA463]" />
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard;
