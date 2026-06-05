"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F9] py-10 px-4">
      {/* Outer card */}
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-50 flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

        {/* Teal Header */}
        <div className="bg-[#5A6F78] px-8 py-5">
          <h1 className="text-white text-xl font-bold">Welcome Administrator!</h1>
        </div>

        <form className="p-8 flex flex-col gap-6" onSubmit={handleCreateAccount}>

          {/* Basic Information Card */}
          <div className="bg-[#D6E8F5] rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-gray-800 text-center">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-fullname"
                name="fullName"
                type="text"
                required
                placeholder="Enter your complete name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/50 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+977-XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] hover:border-gray-300 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Account Type Card */}
          <div className="bg-[#FEFAE0] border border-[#E9D96E] rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1FA463] text-center">Account Type</h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="reg-role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F5F5] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 focus:border-[#1FA463] transition-all duration-300 shadow-sm hover:bg-[#EEEEEE]"
                >
                  <option value="" disabled>Choose your account type</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  ▼
                </div>
              </div>
              <p className="text-xs text-gray-500 italic text-center">
                Choose &apos;Student&apos; or &apos;Teacher&apos;
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              id="reg-submit"
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#1FA463] hover:bg-[#178a52] text-white font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-0"
            >
              Create Account
            </button>
            <button
              id="reg-back"
              type="button"
              onClick={() => router.push('/login')}
              className="px-8 py-2.5 rounded-full bg-[#5A6F78] hover:bg-[#4a5c64] text-white font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-0"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
