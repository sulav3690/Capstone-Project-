"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Sparkles, 
  GraduationCap, 
  Presentation, 
  Briefcase, 
  Building, 
  Mail 
} from 'lucide-react';

const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) { /* SSR or restricted environment */ }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) { /* SSR or restricted environment */ }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) { /* SSR or restricted environment */ }
  }
};

export default function SurveyPage() {
  const router = useRouter();
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    email: '',
    heardAboutUs: '',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const completed = safeLocalStorage.getItem('veritas_onboarding_completed');
    if (completed && completed !== 'skipped') {
      try {
        const data = JSON.parse(completed);
        setOnboardingData(data);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleRoleSelect = (role) => {
    setOnboardingData(prev => ({ ...prev, role }));
    if (role !== 'Professional') {
      // Auto advance for non-professional roles after 300ms
      setTimeout(() => {
        setOnboardingStep(2);
      }, 300);
    }
  };

  const handleOptionSelect = (field, value) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setOnboardingStep(prev => prev + 1);
    }, 300);
  };

  const handleSubmitSurvey = (planChoice) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const finalData = {
      ...onboardingData,
      planChosen: planChoice,
      completedAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      safeLocalStorage.setItem('veritas_onboarding_completed', JSON.stringify(finalData));
      
      setTimeout(() => {
        if (planChoice === 'Premium') {
          router.push('/payment?planName=Monthly%20Plan&planPrice=Rs.%20250');
        } else if (planChoice === 'Yearly') {
          router.push('/payment?planName=Yearly%20Plan&planPrice=Rs.%202500');
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    }, 800);
  };

  // Define Why/Purpose options dynamically based on selected role
  const getWhyOptions = () => {
    switch (onboardingData.role) {
      case 'Student':
        return [
          "Checking my essays & research papers",
          "Studying and verifying educational materials",
          "Polishing grammar & language structure",
          "Other academic purposes"
        ];
      case 'Educator':
        return [
          "Checking student submissions for AI content",
          "Creating classroom exercises & lessons",
          "Performing academic/pedagogical research",
          "Other educational purposes"
        ];
      case 'Professional':
        return [
          "Checking business emails, pitches & reports",
          "Validating copy, blogs & marketing content",
          "Polishing professional documentation",
          "Other business communication purposes"
        ];
      case 'Business':
        return [
          "Integrating AI detection via API",
          "Auditing large-scale company content",
          "Automating internal review workflows",
          "Other corporate infrastructure purposes"
        ];
      default:
        return [
          "Detecting AI-generated content",
          "Academic research",
          "Content writing help",
          "Other"
        ];
    }
  };

  // Step information with normal contrast/medium text
  const steps = [
    {
      title: "Which describes your role?",
      subtitle: "Select one option to personalize your VeritasAI experience.",
      dots: [true, false, false, false]
    },
    {
      title: "How did you first hear about VeritasAI?",
      subtitle: "Select one option to help us reach more people.",
      dots: [true, true, false, false]
    },
    {
      title: "Why are you using VeritasAI?",
      subtitle: "Select your primary usage scenario.",
      dots: [true, true, true, false]
    },
    {
      title: "Start your VeritasAI experience",
      subtitle: "Select the plan that fits you best. You can change it anytime.",
      dots: [true, true, true, true]
    }
  ];

  const currentStepInfo = steps[onboardingStep - 1] || { title: "", subtitle: "", dots: [] };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FDFBF7] text-[#1C1917] font-sans relative overflow-hidden">
      
      {/* Background soft color glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#1FA463]/5 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-[#7755FF]/5 to-transparent blur-[100px] pointer-events-none z-0" />

      {/* VeritasAI Brand Header Logo (Keep original blue-violet theme logo) */}
      <div 
        className="absolute top-6 left-6 md:top-8 md:left-12 flex items-center gap-3 cursor-pointer z-50 select-none animate-fadeIn"
        onClick={() => router.push('/')}
      >
        <div className="bg-gradient-to-br from-[#7755FF] to-[#4F33FF] p-[6px] rounded-lg shadow-md hover:scale-105 transition-transform duration-200">
          <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-normal text-[20px] tracking-tight text-stone-900">Veritas<span className="font-bold">AI</span></span>
      </div>

      {isSuccess ? (
        /* SUCCESS REDIRECTION STATE */
        <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-6 z-10 animate-fadeIn">
          <div className="w-20 h-20 bg-[#1FA463]/10 text-[#1FA463] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Check size={40} strokeWidth={3} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Survey Completed!</h2>
          <p className="text-stone-500 font-medium text-[15px] max-w-sm">
            Thank you for your valuable feedback. Taking you to your dashboard...
          </p>
        </div>
      ) : (
        /* SURVEY STEPS PANEL */
        <div className="flex flex-col md:flex-row w-full min-h-screen relative z-10">
          
          {/* LEFT PANEL: Progress & Content Header */}
          <div className="w-full md:w-[42%] flex flex-col justify-between px-8 md:pl-16 md:pr-10 pt-24 pb-8 md:py-16 bg-[#FBF9F5]/40 md:bg-transparent border-b md:border-b-0 md:border-r border-stone-200/40 shrink-0">
            <div className="flex flex-col gap-5 my-auto max-w-md">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-black text-stone-900 tracking-tight leading-[1.1] transition-all duration-300">
                {currentStepInfo.title}
              </h1>
              
              {/* Normal contrast helper text matching dashboard style */}
              <p className="text-stone-500 font-medium text-sm md:text-[15px] leading-relaxed transition-all duration-300">
                {currentStepInfo.subtitle}
              </p>
            </div>

            {/* Bottom Progress Tracker */}
            <div className="flex items-center justify-start mt-8 md:mt-0 pt-6 border-t border-stone-200/40 md:border-none">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-stone-400 mr-2">This won't take long.</span>
                <div className="flex items-center gap-1.5">
                  {currentStepInfo.dots.map((active, i) => (
                    <div 
                      key={i} 
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        active 
                          ? 'w-6 bg-[#1FA463]' 
                          : 'w-2.5 bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Interactive Options */}
          <div className="w-full md:w-[58%] flex flex-col justify-center items-center px-6 md:px-16 py-12 md:py-16 overflow-y-auto bg-white/40 backdrop-blur-sm">
            
            <div key={onboardingStep} className={`w-full flex flex-col justify-center items-center ${onboardingStep === 4 ? 'max-w-5xl' : 'max-w-xl'}`}>
              
              {/* STEP 1: ROLE SELECTION */}
              {onboardingStep === 1 && (
                <div className="w-full flex flex-col items-center gap-4 animate-slideUp">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    
                    {/* Student Card */}
                    <button
                      onClick={() => handleRoleSelect('Student')}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-200 group text-center min-h-[160px] cursor-pointer ${
                        onboardingData.role === 'Student'
                          ? 'bg-[#1FA463]/5 border-[#1FA463] shadow-md shadow-[#1FA463]/10 scale-[1.02]'
                          : 'bg-white border-stone-200/80 hover:border-stone-400 hover:shadow-md'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-200 ${
                        onboardingData.role === 'Student' ? 'bg-[#1FA463]/15 text-[#1FA463]' : 'bg-stone-50 text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'
                      }`}>
                        <GraduationCap size={28} />
                      </div>
                      <span className="font-semibold text-[15.5px] text-stone-800 tracking-tight">Student</span>
                    </button>

                    {/* Educator Card */}
                    <button
                      onClick={() => handleRoleSelect('Educator')}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-200 group text-center min-h-[160px] cursor-pointer ${
                        onboardingData.role === 'Educator'
                          ? 'bg-[#1FA463]/5 border-[#1FA463] shadow-md shadow-[#1FA463]/10 scale-[1.02]'
                          : 'bg-white border-stone-200/80 hover:border-stone-400 hover:shadow-md'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-200 ${
                        onboardingData.role === 'Educator' ? 'bg-[#1FA463]/15 text-[#1FA463]' : 'bg-stone-50 text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'
                      }`}>
                        <Presentation size={28} />
                      </div>
                      <span className="font-semibold text-[15.5px] text-stone-800 tracking-tight">Educator</span>
                    </button>

                    {/* Professional Card */}
                    <button
                      onClick={() => handleRoleSelect('Professional')}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-200 group text-center min-h-[160px] cursor-pointer ${
                        onboardingData.role === 'Professional'
                          ? 'bg-[#1FA463]/5 border-[#1FA463] shadow-md shadow-[#1FA463]/10 scale-[1.02]'
                          : 'bg-white border-stone-200/80 hover:border-stone-400 hover:shadow-md'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-200 ${
                        onboardingData.role === 'Professional' ? 'bg-[#1FA463]/15 text-[#1FA463]' : 'bg-stone-50 text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'
                      }`}>
                        <Briefcase size={28} />
                      </div>
                      <span className="font-semibold text-[15.5px] text-stone-800 tracking-tight">Professional</span>
                    </button>

                    {/* Business Card */}
                    <button
                      onClick={() => handleRoleSelect('Business')}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-200 group text-center min-h-[160px] cursor-pointer ${
                        onboardingData.role === 'Business'
                          ? 'bg-[#1FA463]/5 border-[#1FA463] shadow-md shadow-[#1FA463]/10 scale-[1.02]'
                          : 'bg-white border-stone-200/80 hover:border-stone-400 hover:shadow-md'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-200 ${
                        onboardingData.role === 'Business' ? 'bg-[#1FA463]/15 text-[#1FA463]' : 'bg-stone-50 text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'
                      }`}>
                        <Building size={28} />
                      </div>
                      <span className="font-semibold text-[15.5px] text-stone-800 tracking-tight">Business</span>
                    </button>

                  </div>

                  {/* Professional Optional Email Input */}
                  {onboardingData.role === 'Professional' && (
                    <div className="w-full mt-6 p-6 bg-[#FDFBF7] border border-stone-200/80 rounded-2xl shadow-sm animate-fadeIn text-left">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-2">
                        Work Email (Optional)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="email"
                            placeholder="name@company.com"
                            value={onboardingData.email}
                            onChange={(e) => setOnboardingData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-white border border-stone-250 text-stone-800 rounded-xl pl-11 pr-4 py-2.5 text-[14px] font-medium transition focus:outline-none focus:border-[#1FA463] focus:ring-1 focus:ring-[#1FA463]"
                          />
                        </div>
                        <button
                          onClick={() => setOnboardingStep(2)}
                          className="bg-[#1FA463] hover:bg-[#178a52] text-white text-[13px] font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-98 shrink-0 cursor-pointer"
                        >
                          Continue
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 2: WHERE HEARD ABOUT US */}
              {onboardingStep === 2 && (
                <div className="w-full flex flex-col gap-3 animate-slideUp">
                  {[
                    "Google Search",
                    "Social Media (X, LinkedIn, TikTok)",
                    "Friend or Colleague",
                    "YouTube video",
                    "School or University recommendation",
                    "Online News Article",
                    "ChatGPT or other AI Tools",
                    "Other sources"
                  ].map((opt) => {
                    const isSelected = onboardingData.heardAboutUs === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect('heardAboutUs', opt)}
                        className={`w-full px-5 py-4 rounded-2xl border text-left text-[14.5px] font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#1FA463]/5 border-[#1FA463] text-[#1FA463] scale-[1.01] shadow-sm'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check size={16} strokeWidth={3} className="text-[#1FA463]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 3: WHY (DYNAMIC REASONS BY ROLE) */}
              {onboardingStep === 3 && (
                <div className="w-full flex flex-col gap-3 animate-slideUp">
                  {getWhyOptions().map((opt) => {
                    const isSelected = onboardingData.purpose === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect('purpose', opt)}
                        className={`w-full px-5 py-4 rounded-2xl border text-left text-[14.5px] font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#1FA463]/5 border-[#1FA463] text-[#1FA463] scale-[1.01] shadow-sm'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check size={16} strokeWidth={3} className="text-[#1FA463]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 4: SUBSCRIPTION PLAN CHOICE */}
              {onboardingStep === 4 && (
                <div className="w-full flex flex-col gap-6 animate-slideUp">
                  
                  <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
                    {[
                      {
                        name: 'Free Tier',
                        badge: 'Current Plan',
                        badgeClassName: 'bg-stone-100 text-stone-500 border-stone-200',
                        price: 'Rs. 0',
                        period: '',
                        features: [
                          'Access to AI detector',
                          'AI deep scan',
                          '10,000 words per input',
                          '50 AI detections',
                          'Basic misinformation detection',
                          'Standard response times'
                        ],
                        buttonText: 'Current Plan',
                        planChoice: 'Basic',
                        disabledStyle: true
                      },
                      {
                        name: 'Monthly Plan',
                        price: 'Rs. 250',
                        period: '/mo',
                        features: [
                          'Access to AI detector',
                          'AI deep scan',
                          '50,000 words per input',
                          '500 AI detections',
                          'Advanced misinformation detection',
                          'Fast response times',
                          'Standard support'
                        ],
                        buttonText: 'Upgrade',
                        planChoice: 'Premium'
                      },
                      {
                        name: 'Yearly Plan',
                        badge: 'Most Popular',
                        badgeClassName: 'bg-[#1FA463]/10 text-[#1FA463] border-[#1FA463]/20',
                        price: 'Rs. 2500',
                        period: '/yr',
                        popular: true,
                        features: [
                          'Access to AI detector',
                          'AI deep scan',
                          '500,000 words per input',
                          'Unlimited AI detections',
                          'Detailed misinformation reports + AI vs Human detection',
                          'Fastest response times',
                          'Priority support'
                        ],
                        buttonText: 'Upgrade',
                        planChoice: 'Yearly'
                      }
                    ].map((plan) => (
                      <article
                        key={plan.name}
                        className={`flex min-h-[455px] flex-col rounded-2xl bg-white px-6 py-6 text-left ${
                          plan.popular
                            ? 'border-2 border-[#1FA463]'
                            : 'border border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-stone-950">{plan.name}</h3>
                          {plan.badge && (
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${plan.badgeClassName}`}>
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-end gap-1">
                          <span className="text-4xl font-black leading-none tracking-normal text-stone-950">{plan.price}</span>
                          {plan.period && (
                            <span className="pb-1 text-sm font-bold text-stone-400">{plan.period}</span>
                          )}
                        </div>

                        <ul className="mt-6 flex flex-1 flex-col gap-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm font-medium leading-6 text-stone-600">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1FA463]/10 text-[#1FA463]">
                                <Check size={13} strokeWidth={3} />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleSubmitSurvey(plan.planChoice)}
                          disabled={isSubmitting}
                          className={`mt-6 h-11 rounded-xl px-5 text-sm font-bold ${
                            plan.disabledStyle
                              ? 'bg-stone-100 text-stone-400 hover:bg-stone-200/80'
                              : 'bg-stone-950 text-white hover:bg-[#1FA463]'
                          }`}
                        >
                          {plan.buttonText}
                        </button>
                      </article>
                    ))}
                  </div>

                  {/* Bridge link to see weekly / yearly subscription alternatives */}
                  <div className="mt-4 text-center flex flex-col items-center gap-1.5 border-t border-stone-100 pt-5 w-full">
                    <span className="text-[12px] font-medium text-stone-400">
                      Looking for other billing options?
                    </span>
                    <button
                      onClick={() => router.push('/dashboard?tab=plans')}
                      className="text-[13px] font-semibold text-[#7755FF] hover:text-[#6870fa] hover:underline flex items-center gap-1 cursor-pointer transition"
                    >
                      See our Weekly and Yearly Plans
                      <ArrowRight size={13} strokeWidth={2} />
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Embedded slide animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
