import React from 'react';

const Toggle = ({ label, enabled, onChange }) => {
  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        className={`${
          enabled ? 'bg-[#1FA463]' : 'bg-gray-200'
        } relative inline-flex h-[31px] w-[57px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? 'translate-x-[28px]' : 'translate-x-0'
          } pointer-events-none inline-block h-[25px] w-[25px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      <span className="text-[19px] font-bold text-gray-750 select-none">{label}</span>
    </div>
  );
};

export default Toggle;
