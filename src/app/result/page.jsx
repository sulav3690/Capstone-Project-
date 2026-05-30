"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// ─── Simulated Analysis Engine ────────────────────────────────────────────────
// Produces realistic, text-dependent scores without a backend
function analyzeText(text) {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Avg words per sentence (AI tends to be consistent: ~18-22)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

  // Vocabulary richness: unique / total words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/\W/g, '')));
  const lexicalDiversity = uniqueWords.size / Math.max(wordCount, 1);

  // Repetition score: how many words repeat >3 times
  const freq = {};
  words.forEach((w) => {
    const wl = w.toLowerCase().replace(/\W/g, '');
    freq[wl] = (freq[wl] || 0) + 1;
  });
  const repeatedWords = Object.values(freq).filter((c) => c > 3).length;
  const repetitionRatio = repeatedWords / Math.max(uniqueWords.size, 1);

  // AI probability signal: uniform sentence length + low lexical diversity + repetition
  let aiSignal = 0;
  if (avgWordsPerSentence > 16 && avgWordsPerSentence < 24) aiSignal += 0.25;
  if (lexicalDiversity < 0.55) aiSignal += 0.30;
  if (repetitionRatio > 0.05) aiSignal += 0.20;
  if (wordCount < 30) aiSignal += 0.10; // Short texts are less conclusive

  // Clamp aiSignal 0–0.80  (never 100% AI — always some uncertainty)
  aiSignal = Math.min(aiSignal + Math.random() * 0.08, 0.80);

  const aiPct = Math.round(aiSignal * 100);
  const humanPct = Math.round((1 - aiSignal) * 0.88 * 100); // small gap for "humanized AI"
  const humanizedPct = 100 - aiPct - humanPct;
  const authenticity = humanPct;

  // Misinformation: random-ish but seeded by text length + content
  const misinfoKeywords = ['fake', 'false', 'hoax', 'conspiracy', 'rumor', 'unverified', 'claim'];
  const misinfoHits = misinfoKeywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const misinfoRisk = misinfoHits > 1 ? 'High' : misinfoHits === 1 ? 'Medium' : 'Low';

  return { aiPct, humanPct, humanizedPct, authenticity, misinfoRisk };
}

// ─── Highlight words in the user's text ───────────────────────────────────────
function buildHighlightedSegments(text, aiPct) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, i) => {
    // Deterministically classify each sentence
    const hash = sentence.length + i;
    if (aiPct > 50 && hash % 4 === 0) return { text: sentence, color: 'decoration-red-400' };
    if (hash % 3 === 0) return { text: sentence, color: 'decoration-green-400' };
    if (hash % 5 === 0) return { text: sentence, color: 'decoration-yellow-400' };
    if (aiPct > 35 && hash % 7 === 0) return { text: sentence, color: 'decoration-orange-400' };
    return { text: sentence, color: null };
  });
}

const LegendItem = ({ colorClass, label }) => (
  <div className="flex items-center gap-2">
    <div className={`h-1 w-6 rounded-full ${colorClass}`} />
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Result = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [segments, setSegments] = useState([]);
  const [localText, setLocalText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('veritas_text') || '';
    setLocalText(saved);
    if (saved.trim().length > 0) {
      const analysis = analyzeText(saved);
      setResult(analysis);
      setSegments(buildHighlightedSegments(saved, analysis.aiPct));
    }
  }, []);

  const isAnalyzed = result !== null;

  const getMisinfoColor = (risk) => {
    if (risk === 'High') return 'text-red-500';
    if (risk === 'Medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left: Text Panel ─────────────────────────────── */}
        <div className="flex-[2] flex flex-col gap-6">
          <Card className="flex-1 min-h-[500px] p-0 overflow-hidden relative">
            {!isAnalyzed ? (
              <div className="w-full h-full min-h-[500px] p-6 flex items-center justify-center text-gray-400">
                <p>No text to display. Go back and enter some text.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed text-base space-y-4">
                  {segments.map((seg, i) => (
                    <span
                      key={i}
                      className={seg.color
                        ? `underline ${seg.color} decoration-2 underline-offset-4`
                        : undefined}
                    >
                      {seg.text}{' '}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Legend */}
          <div className={`flex flex-wrap gap-6 items-center bg-white p-4 rounded-xl shadow-soft border border-gray-100 transition-opacity ${isAnalyzed ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <LegendItem colorClass="bg-red-400" label="AI Probability" />
            <LegendItem colorClass="bg-green-400" label="Human Probability" />
            <LegendItem colorClass="bg-yellow-400" label="Humanized AI" />
            <LegendItem colorClass="bg-orange-400" label="Misinformation Risk" />
          </div>
        </div>

        {/* ── Right Panel ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Overall Authenticity — GREEN card */}
          <div className="bg-[#1FA463] rounded-2xl p-6 flex flex-col items-center text-white shadow-lg shadow-[#1FA463]/20">
            <h3 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Overall Authenticity</h3>
            <div className="text-6xl font-extrabold mb-4">
              {isAnalyzed ? `${result.authenticity}%` : '0%'}
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-white/20 rounded-full mb-6">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000"
                style={{ width: isAnalyzed ? `${result.authenticity}%` : '0%' }}
              />
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">AI Generated</span>
                <span className="text-sm font-bold">{isAnalyzed ? `${result.aiPct}%` : '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Human Written</span>
                <span className="text-sm font-bold">{isAnalyzed ? `${result.humanPct}%` : '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Misinformation Risk</span>
                <span className="text-sm font-bold uppercase text-xs">
                  {isAnalyzed ? result.misinfoRisk : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Detection Tip — GREEN card */}
          <div className="bg-[#1FA463] rounded-2xl p-6 text-white shadow-lg shadow-[#1FA463]/20">
            <h3 className="font-bold mb-2 text-base">Detection Tip</h3>
            <p className="text-sm text-white/85 leading-relaxed">
              {isAnalyzed && result.aiPct > 50
                ? 'This text shows patterns common in AI writing — uniform sentence length and low lexical diversity. Consider reviewing critical sections.'
                : 'Sentences with varying lengths and structures are more likely to be human-written. AI models often produce repetitive sentence patterns.'}
            </p>
          </div>

          <Button
            id="view-report-btn"
            className="w-full py-4 text-lg font-bold"
            onClick={() => router.push('/report')}
            disabled={!isAnalyzed}
          >
            View Detailed Report
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Result;
