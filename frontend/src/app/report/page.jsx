"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import safeLocalStorage from '../../utils/safeLocalStorage';
import { analyzeText, buildHighlightedSegments } from '../../utils/analyzeText';

const REPORT_STORAGE_KEY = 'veritas_detailed_report';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const splitSentences = (text) => (
  cleanText(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
).map(cleanText).filter(Boolean);

const percent = (value) => `${Math.round(Number(value) || 0)}%`;

const cleanLabel = (value) => cleanText(value).replace(/_/g, ' ') || 'review';

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const topFeatures = (features = []) => {
  const rows = features
    .filter((feature) => feature?.text)
    .sort((a, b) => Math.abs(Number(b.weight || 0)) - Math.abs(Number(a.weight || 0)));

  return rows.slice(0, 3);
};

const featureText = (features) => {
  const names = topFeatures(features).map((feature) => `"${feature.text}"`);
  if (names.length === 0) return 'the highlighted wording';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

const findSentence = (sentences, phrase, fallback) => {
  const target = cleanText(phrase).toLowerCase();
  if (!target) return fallback || sentences[0] || '';

  return sentences.find((sentence) => cleanText(sentence).toLowerCase().includes(target))
    || fallback
    || sentences[0]
    || '';
};

const buildReportEntries = (text, result) => {
  const sentences = splitSentences(text);
  const details = result?.details || {};
  const entries = [];
  const aiLime = details.ai_details?.lime;
  const misinfoLime = Array.isArray(details.misinfo_details?.lime)
    ? details.misinfo_details.lime[0]
    : details.misinfo_details?.lime;

  if (aiLime?.features?.length) {
    const features = topFeatures(aiLime.features);
    entries.push({
      title: 'AI Authorship',
      sentence: findSentence(sentences, features[0]?.text),
      reason: `This sentence was flagged because LIME found ${featureText(features)} most influential for the ${cleanLabel(aiLime.explained_class)} decision, with ${percent(Number(aiLime.probability) * 100)} model confidence for that local explanation.`
    });
  }

  if (misinfoLime?.claim) {
    entries.push({
      title: 'Misinformation Claim',
      sentence: findSentence(sentences, misinfoLime.claim, misinfoLime.claim),
      reason: `This sentence was flagged because the claim was classified as ${cleanLabel(misinfoLime.explained_class)}. LIME weighted ${featureText(misinfoLime.features)} as the strongest local evidence for that decision.`
    });
  } else if (details.misinfo_details?.top_claim_flags?.[0]?.claim) {
    const claim = details.misinfo_details.top_claim_flags[0];
    entries.push({
      title: 'Misinformation Claim',
      sentence: findSentence(sentences, claim.claim, claim.claim),
      reason: `This sentence was flagged because the misinformation model marked it as ${cleanLabel(claim.label)} with ${percent(Number(claim.confidence) * 100)} confidence.`
    });
  }

  if (entries.length === 0) {
    const highlighted = buildHighlightedSegments(text, result?.aiPct || 0)
      .find((segment) => segment.color);

    if (highlighted?.text) {
      entries.push({
        title: 'Sentence Review',
        sentence: cleanText(highlighted.text),
        reason: 'This sentence was highlighted because the scan found the strongest available writing-pattern signal here, so it is the best place to review the model result.'
      });
    }
  }

  return entries.filter((entry) => entry.sentence);
};

const riskTone = (value) => {
  const risk = String(value || '').toLowerCase();
  if (risk.includes('high')) return { text: 'text-red-500', bar: 'bg-red-500', value: 90, label: 'High' };
  if (risk.includes('moderate') || risk.includes('medium')) return { text: 'text-amber-500', bar: 'bg-amber-500', value: 50, label: 'Moderate' };
  return { text: 'text-[#1FA463]', bar: 'bg-[#1FA463]', value: 15, label: 'Low' };
};

const SummaryCard = ({ label, value, barValue, colorClass }) => (
  <Card className="rounded-3xl border-stone-200/50 bg-white p-6 shadow-[0_15px_45px_rgba(28,25,23,0.03)] sm:p-7">
    <span className="block text-[11px] font-black uppercase tracking-wider text-stone-400">{label}</span>
    <span className="mt-3 block text-4xl font-black tracking-tight text-stone-950">{value}</span>
    <div className="mt-5 h-2.5 rounded-full bg-stone-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${clampPercent(barValue)}%` }}
      />
    </div>
  </Card>
);

const RiskLevelGraph = ({ score, risk }) => (
  <div className="space-y-4">
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-stone-400">Risk Level</p>
        <p className={`mt-1 text-2xl font-black uppercase ${risk.text}`}>{risk.label}</p>
      </div>
      <span className="text-3xl font-black text-stone-950">{percent(score)}</span>
    </div>
    <div className="h-4 rounded-full bg-stone-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
        style={{ width: `${clampPercent(score)}%` }}
      />
    </div>
    <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-wider text-stone-400">
      <span>Low</span>
      <span className="text-center">Moderate</span>
      <span className="text-right">High</span>
    </div>
  </div>
);

const Report = () => {
  const [savedReport, setSavedReport] = useState({ text: '', result: null });

  useEffect(() => {
    const savedText = safeLocalStorage.getItem('veritas_text') || '';
    const savedPayload = safeLocalStorage.getItem(REPORT_STORAGE_KEY);

    try {
      const payload = JSON.parse(savedPayload);
      setSavedReport({
        text: payload?.text || savedText,
        result: payload?.result || null,
      });
    } catch {
      setSavedReport({ text: savedText, result: null });
    }
  }, []);

  const text = savedReport.text;
  const result = savedReport.result || (text ? analyzeText(text) : null);
  const details = result?.details || {};
  const reportEntries = result ? buildReportEntries(text, result) : [];
  const hasReport = Boolean(text && result);
  const risk = riskTone(result?.misinfoRisk);
  const modelUsed =
    details.ai_details?.model_used
    || details.misinfo_details?.model_used
    || 'Local Analysis';
  const confidence =
    details.ai_details?.confidence_percent
    || (details.ai_details?.lime?.probability && Number(details.ai_details.lime.probability) * 100)
    || result?.authenticity
    || 0;
  const misinfoScore = result?.misinformationScore !== undefined
    ? result.misinformationScore
    : risk.value;

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-10">
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-stone-950 sm:text-[40px]">
          Detection Analysis Report
        </h1>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <SummaryCard
            label="Human Written"
            value={hasReport ? percent(result.humanPct) : '0%'}
            barValue={result?.humanPct || 0}
            colorClass="bg-[#1FA463]"
          />
          <SummaryCard
            label="AI Generated"
            value={hasReport ? percent(result.aiPct) : '0%'}
            barValue={result?.aiPct || 0}
            colorClass="bg-[#F36C3D]"
          />
          <SummaryCard
            label="Misinformation Risk"
            value={hasReport ? percent(misinfoScore) : '0%'}
            barValue={hasReport ? misinfoScore : 0}
            colorClass={risk.bar}
          />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-[2] rounded-3xl border-stone-200/50 bg-white p-6 shadow-[0_15px_45px_rgba(28,25,23,0.03)] sm:p-8">
            <h2 className="mb-6 text-xl font-black text-stone-950">LIME Detailed Report</h2>
            <div className="space-y-6 text-[17px] leading-8 text-stone-700">
              {hasReport && reportEntries.length > 0 ? (
                reportEntries.map((entry) => (
                  <p key={`${entry.title}-${entry.sentence}`}>
                    <span className="mr-2 rounded bg-yellow-100 px-1.5 py-0.5 font-semibold text-yellow-900">
                      {entry.sentence}
                    </span>
                    {entry.reason}
                  </p>
                ))
              ) : (
                <p className="text-stone-500">
                  No detailed report is available yet. Run an analysis first, then open the detailed report.
                </p>
              )}
            </div>
          </Card>

          <div className="flex-1 flex flex-col gap-6">
            <Card className="rounded-3xl border-stone-200/50 bg-white p-6 shadow-[0_15px_45px_rgba(28,25,23,0.03)] sm:p-7">
              <h2 className="border-b border-stone-100 pb-5 text-xl font-black text-stone-950">Detection Breakdown</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-stone-400">Model Used</p>
                  <p className="break-words text-lg font-black text-stone-950">{hasReport ? modelUsed : 'Not Analyzed'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-stone-400">Analysis Confidence</p>
                  <p className="text-lg font-black text-stone-950">{hasReport ? percent(confidence) : '0%'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-stone-400">Risk Classification</p>
                  <p className={`text-lg font-black uppercase ${risk.text}`}>{hasReport ? result.misinfoRisk : 'None'}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-stone-200/50 bg-white p-6 shadow-[0_15px_45px_rgba(28,25,23,0.03)] sm:p-7">
              <RiskLevelGraph score={hasReport ? misinfoScore : 0} risk={risk} />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
