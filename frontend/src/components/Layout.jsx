import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col justify-start p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
