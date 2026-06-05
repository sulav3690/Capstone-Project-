import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-[#1FA463] text-white hover:bg-[#178a52]',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-[#F36C3D] text-white hover:bg-[#e05a2b]',
    outline: 'bg-[#F6F8F9] hover:bg-[#e8ecef] text-gray-800 font-bold',
  };

  return (
    <button
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
