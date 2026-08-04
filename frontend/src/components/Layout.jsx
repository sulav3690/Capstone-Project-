import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between font-sans text-stone-800">
      <Navbar />
      <main className="flex-1 w-full max-w-[1240px] mx-auto flex flex-col justify-start p-4 pt-8 sm:p-8 md:pt-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
