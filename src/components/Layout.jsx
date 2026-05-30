import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 p-6 sm:p-10 max-w-[1400px] mx-auto w-full flex flex-col justify-start">
        {children}
      </main>
      
      <Footer className="!mt-16 md:!mt-24" />
    </div>
  );
};

export default Layout;
