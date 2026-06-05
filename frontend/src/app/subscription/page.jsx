"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import PlanCard from '../../components/ui/PlanCard';

const Subscription = () => {
  const router = useRouter();

  const handleSubscribe = (plan) => {
    router.push(`/payment?planName=${encodeURIComponent(plan.name)}&planPrice=${encodeURIComponent(plan.price)}`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto text-center mb-16 pt-6">
        <h1 className="text-[42px] font-black tracking-tight text-[#0f172a] mb-6 leading-[1.1] max-w-[440px] mx-auto">
          Choose Your Subscription<br />Plan
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-[15px] font-medium">
          Select the best plan to detect AI generated content and misinformation with surgical precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PlanCard
          title="Weekly Plan"
          price="$5"
          period="week"
          features={[
            "50 detections",
            "Human vs AI",
            "Basic misinformation",
            "Standard speed"
          ]}
          buttonText="Subscribe Weekly"
          onSubscribe={() => handleSubscribe({ name: 'Weekly Plan', price: '$5' })}
        />

        <PlanCard
          title="Monthly Plan"
          price="$20"
          period="month"
          features={[
            "Unlimited detections",
            "Humanized AI detection",
            "Advanced misinformation",
            "Detailed reports",
            "Faster processing"
          ]}
          buttonText="Subscribe Monthly"
          highlighted={true}
          onSubscribe={() => handleSubscribe({ name: 'Monthly Plan', price: '$20' })}
        />

        <PlanCard
          title="Yearly Plan"
          price="$250"
          period="year"
          features={[
            "Unlimited detection",
            "Advanced features",
            "Downloadable reports",
            "API access",
            "Priority support"
          ]}
          buttonText="Subscribe Yearly"
          onSubscribe={() => handleSubscribe({ name: 'Yearly Plan', price: '$250' })}
        />
      </div>
    </Layout>
  );
};

export default Subscription;
