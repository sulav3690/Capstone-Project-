import React from 'react';

const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`w-full px-4 py-2 rounded-lg border border-border-grey focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
