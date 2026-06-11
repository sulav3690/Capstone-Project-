"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicLayout from '../../components/PublicLayout';
import { ShieldCheck, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
      window.localStorage.removeItem(key);
    }
  }
};

export default function SurveyPage() {
  const router = useRouter();
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    experience: '',
    detectorUsed: '',
    heardAboutUs: '',
    purpose: '',
    frequency: '',
    updates: '',
    helpText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync with localStorage so completing standalone survey completes onboarding modal too
  useEffect(() => {
    const completed = safeLocalStorage.getItem('veritas_onboarding_completed');
    if (completed && completed !== 'skipped') {
      try {
        const data = JSON.parse(completed);
        setOnboardingData(data);
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleOnboardingSelect = (field, value) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setOnboardingStep(prev => prev - 1);
  };

  const handleSkipOnboarding = () => {
    safeLocalStorage.setItem('veritas_onboarding_completed', 'skipped');
    router.push('/');
  };

  const handleSubmitOnboarding = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      safeLocalStorage.setItem('veritas_onboarding_completed', JSON.stringify(onboardingData));
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }, 1000);
  };

  const onboardingQuestions = {
    role: {
      question: "What best describes you?",
      options: ["Student", "Teacher", "Researcher", "Content Creator", "Business Professional", "Other"]
    },
    heardAboutUs: {
      question: "How did you hear about us?",
      options: ["Google Search", "Social Media", "Friend/Colleague", "YouTube", "School/University", "Other"]
    },
    detectorUsed: {
      question: "Have you used an AI detector before?",
      options: ["Yes, frequently", "Yes, a few times", "No, this is my first time"]
    },
    purpose: {
      question: "What do you plan to use this website for?",
      options: ["Checking assignments", "Detecting AI-generated content", "Academic research", "Content writing", "Business use", "Other"]
    },
    frequency: {
      question: "How often do you expect to use this platform?",
      options: ["Daily", "Weekly", "Monthly", "Occasionally"]
    },
    updates: {
      question: "Would you like product updates and tips?",
      options: ["Yes", "No"]
    },
    experience: {
      question: "What is your experience level with AI tools?",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    helpText: {
      question: "Is there anything specific you'd like us to help you with?"
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        
        {/* Intro header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#7B82FF]/10 text-[#7B82FF] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <Sparkles size={14} />
            User Insights Survey
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none mb-4">
            VeritasAI Survey
          </h1>
          <p className="text-stone-500 font-semibold text-[15px] max-w-xl mx-auto">
            Help us tailor the AI content verification experience to your exact needs.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-stone-200/50 rounded-[32px] p-8 md:p-12 shadow-[0_15px_40px_rgba(28,25,23,0.02)] relative overflow-hidden">
          
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-5">
              <div className="w-16 h-16 bg-[#1FA463]/10 text-[#1FA463] rounded-full flex items-center justify-center animate-bounce">
                <Check size={32} strokeWidth={3} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">Survey Completed!</h3>
                <p className="text-stone-500 font-semibold text-sm max-w-sm">
                  Thank you for your valuable feedback. Redirecting you to the dashboard...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              
              {/* Header & Progress Bar */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <span>Progress Survey</span>
                  <span>Step {onboardingStep} of 4</span>
                </div>
                
                {/* Progress Line */}
                <div className="h-1.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7755FF] to-[#1FA463] rounded-full transition-all duration-300"
                    style={{ width: `${(onboardingStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step contents */}
              <div className="min-h-[300px] flex flex-col justify-start gap-6 py-2">
                
                {/* Step 1: Role & Experience */}
                {onboardingStep === 1 && (
                  <div className="flex flex-col gap-6 text-left">
                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.role.question}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onboardingQuestions.role.options.map((opt) => {
                          const isSelected = onboardingData.role === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('role', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm shadow-[#7B82FF]/10' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.experience.question}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {onboardingQuestions.experience.options.map((opt) => {
                          const isSelected = onboardingData.experience === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('experience', opt)}
                              className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl border text-center text-sm font-semibold transition-all ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm shadow-[#7B82FF]/10' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: AI Detector Usage & Source */}
                {onboardingStep === 2 && (
                  <div className="flex flex-col gap-6 text-left">
                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.detectorUsed.question}
                      </label>
                      <div className="flex flex-col gap-2.5">
                        {onboardingQuestions.detectorUsed.options.map((opt) => {
                          const isSelected = onboardingData.detectorUsed === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('detectorUsed', opt)}
                              className={`px-5 py-3.5 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.heardAboutUs.question}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onboardingQuestions.heardAboutUs.options.map((opt) => {
                          const isSelected = onboardingData.heardAboutUs === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('heardAboutUs', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Purpose & Frequency */}
                {onboardingStep === 3 && (
                  <div className="flex flex-col gap-6 text-left">
                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.purpose.question}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onboardingQuestions.purpose.options.map((opt) => {
                          const isSelected = onboardingData.purpose === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('purpose', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-lg font-bold text-stone-900">
                        {onboardingQuestions.frequency.question}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onboardingQuestions.frequency.options.map((opt) => {
                          const isSelected = onboardingData.frequency === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('frequency', opt)}
                              className={`px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#7B82FF]/5 border-[#7B82FF] text-[#7B82FF] shadow-sm' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Updates & Submission */}
                {onboardingStep === 4 && (
                  <div className="flex flex-col gap-5 justify-center items-center py-4 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#7755FF]/20 to-[#7755FF]/5 rounded-2xl flex items-center justify-center mb-1">
                      <Sparkles size={28} className="text-[#7755FF]" />
                    </div>
                    <div className="text-center max-w-md flex flex-col gap-1.5">
                      <h4 className="text-2xl font-black text-stone-900 leading-tight">Join the VeritasAI Community!</h4>
                      <p className="text-stone-500 font-medium text-sm leading-relaxed">
                        We post regular product tips, AI detection research insights, and new feature updates.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-sm mt-1 text-left">
                      <label className="text-sm font-bold text-stone-700">
                        {onboardingQuestions.updates.question}
                      </label>
                      <div className="flex gap-3">
                        {onboardingQuestions.updates.options.map((opt) => {
                          const isSelected = onboardingData.updates === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOnboardingSelect('updates', opt)}
                              className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                isSelected 
                                  ? 'bg-[#1FA463]/5 border-[#1FA463] text-[#1FA463] shadow-sm' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-sm text-left">
                      <label className="text-sm font-bold text-stone-700">
                        {onboardingQuestions.helpText.question}
                      </label>
                      <textarea
                        value={onboardingData.helpText}
                        onChange={(e) => handleOnboardingSelect('helpText', e.target.value)}
                        placeholder="Type your response here..."
                        rows={2.5}
                        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#7B82FF] focus:ring-1 focus:ring-[#7B82FF] transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                
                {/* Back button */}
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 text-sm font-bold transition"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSkipOnboarding}
                    className="text-stone-400 hover:text-stone-600 text-sm font-bold transition px-2 py-2"
                  >
                    Skip & Dashboard
                  </button>
                )}

                {/* Next / Submit button */}
                {onboardingStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      (onboardingStep === 1 && (!onboardingData.role || !onboardingData.experience)) ||
                      (onboardingStep === 2 && (!onboardingData.detectorUsed || !onboardingData.heardAboutUs)) ||
                      (onboardingStep === 3 && (!onboardingData.purpose || !onboardingData.frequency))
                    }
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-sm font-bold transition shadow-md hover:shadow-lg ${
                      ((onboardingStep === 1 && (!onboardingData.role || !onboardingData.experience)) ||
                       (onboardingStep === 2 && (!onboardingData.detectorUsed || !onboardingData.heardAboutUs)) ||
                       (onboardingStep === 3 && (!onboardingData.purpose || !onboardingData.frequency)))
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                        : 'bg-[#7B82FF] hover:bg-[#6870fa]'
                    }`}
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitOnboarding}
                    disabled={isSubmitting || !onboardingData.updates}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl text-white text-sm font-bold transition shadow-md hover:shadow-lg ${
                      isSubmitting || !onboardingData.updates
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                        : 'bg-[#1FA463] hover:bg-[#178a52] shadow-[#1FA463]/15'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                  </button>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
