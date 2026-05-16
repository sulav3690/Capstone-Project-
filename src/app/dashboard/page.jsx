"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

const Detector = () => {
  const router = useRouter();
  const [aiDetection, setAiDetection] = useState(true);
  const [misinformation, setMisinformation] = useState(true);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const MAX_WORDS = 5000;

  const handleAnalyze = () => {
    if (text.trim().length < 20) {
      setError('Please enter at least 20 characters to analyze.');
      return;
    }
    setError('');
    setIsAnalyzing(true);

    // Save to localStorage so result page can read it
    localStorage.setItem('veritas_text', text);
    localStorage.setItem('veritas_aiDetection', aiDetection.toString());
    localStorage.setItem('veritas_misinformation', misinformation.toString());

    // Simulate a brief analyzing delay for UX
    setTimeout(() => {
      router.push('/result');
    }, 900);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target.result);
      setError('');
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Content &amp; Misinformation Detector</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Panel */}
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              <Toggle
                label="AI Generated Detection"
                enabled={aiDetection}
                onChange={setAiDetection}
              />
              <Toggle
                label="Misinformation Signals"
                enabled={misinformation}
                onChange={setMisinformation}
              />
            </div>

            <textarea
              id="analyze-input"
              className="flex-1 w-full p-6 text-gray-700 placeholder:text-gray-400 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1FA463]/30 resize-none text-base leading-relaxed transition min-h-[340px]"
              placeholder="Enter or paste the text you want to verify here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
            />

            {/* Word Count + Upload */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
              >
                <Upload size={16} />
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                wordCount > MAX_WORDS
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {wordCount} / {MAX_WORDS} words
              </span>
            </div>

            {/* Validation error */}
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing || wordCount > MAX_WORDS}
            className={`px-16 py-4 text-lg font-bold rounded-xl text-white shadow-lg transition-all duration-200 ${
              isAnalyzing || wordCount > MAX_WORDS
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#1FA463] hover:bg-[#178a52] hover:-translate-y-0.5 shadow-[#1FA463]/25'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing...
              </span>
            ) : 'Analyze Now'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Detector;
