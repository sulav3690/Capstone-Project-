"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';

const Report = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <h1 className="text-3xl font-bold text-gray-800">Detection Analysis Report</h1>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Human Written" value="78%" color="bg-primary-green" />
          <StatCard label="AI Generated" value="12%" color="bg-accent-orange" />
          <StatCard label="Misinformation Risk" value="18%" color="bg-yellow-400" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Large Text Analysis Card */}
          <Card className="flex-[2] min-h-[600px] flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Text Analysis</h3>
            <div className="flex-1 text-gray-700 leading-relaxed text-lg space-y-6">
              <p>
                The provided text shows a high degree of <span className="bg-green-100 text-green-800 px-1 rounded">structural diversity</span> typically found in human-authored content. The sentence lengths vary significantly, and the word choice reflects a nuanced understanding of the subject matter.
              </p>
              <p>
                However, certain paragraphs exhibit <span className="bg-orange-100 text-orange-800 px-1 rounded">repetitive phrasings</span> often associated with Large Language Models. These patterns are particularly evident in the technical descriptions where the model used (BERT) identified a 98.2% confidence in its classification.
              </p>
              <p>
                The misinformation detection engine flagged early portions of the text as having a <span className="bg-yellow-100 text-yellow-800 px-1 rounded">low risk</span>, mainly due to the alignment with established data points in our knowledge base.
              </p>
            </div>
          </Card>

          {/* Right Side Panel */}
          <div className="flex-1 flex flex-col gap-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Detection Breakdown</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Model Used</p>
                  <p className="text-lg font-bold text-gray-800">BERT Model</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Analysis Confidence</p>
                  <p className="text-lg font-bold text-gray-800">98.2%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Risk Classification</p>
                  <p className="text-lg font-bold text-green-500 uppercase">Less Risk</p>
                </div>
              </div>
            </Card>

            <Card className="bg-primary-green text-white flex flex-col items-center text-center py-10">
              <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm mb-8 max-w-[200px]">Get access to advanced deepfake detection and API access.</p>
              <Button className="w-full bg-white hover:bg-gray-100" onClick={() => router.push('/subscription')}>
                <span className="text-blue-600">Upgrade Now</span>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
