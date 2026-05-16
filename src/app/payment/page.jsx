"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CreditCard as CardIcon, Wallet, Landmark } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const PaymentContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = { name: searchParams.get('planName') || 'Monthly Plan', price: searchParams.get('planPrice') || '$20' };
  const [activeTab, setActiveTab] = useState('card');

  const tabs = [
    { id: 'card', name: 'Credit Card', icon: CardIcon },
    { id: 'debit', name: 'Debit Card', icon: CardIcon },
    { id: 'paypal', name: 'Paypal', icon: Wallet },
    { id: 'google', name: 'Google Pay', icon: Landmark },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-10">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Side: Summary */}
        <div className="flex-1 space-y-8">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-gray-500 font-medium">{plan.price}/month</p>
              </div>
              <Button variant="outline" className="text-xs py-1 px-3" onClick={() => router.push('/subscription')}>Change</Button>
            </div>

            <ul className="space-y-4 mb-8">
              {['AI Image Detection', 'Deepfake Video Analysis', 'Full API Access', 'Priority 24/7 Support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-primary-green rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800 font-bold">{plan.price}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-800 font-bold">$2.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-4">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-primary-green">${parseInt(plan.price.replace('$', '')) + 2}.00</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Form */}
        <div className="flex-[1.5] flex flex-col gap-6">
          <div className="flex bg-gray-200/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-soft text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          <Card className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input label="Cardholder Name" placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <Input label="Card Number" placeholder="0000 0000 0000 0000" />
              </div>
              <Input label="Expiry Date" placeholder="MM/YY" />
              <Input label="CVV" placeholder="123" />
              <div className="md:col-span-2">
                <Input label="Billing Address" placeholder="123 Main St, New York" />
              </div>
              <Input label="Country" placeholder="United States" />
              <Input label="Zip Code" placeholder="10001" />
            </div>

            <Button className="w-full py-4 text-lg font-bold mt-10 shadow-lg shadow-primary-green/20" onClick={() => alert('Payment Successful!')}>
              Complete Payment - ${parseInt(plan.price.replace('$', '')) + 2}.00
            </Button>

            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-xs">
              <ShieldCheck size={14} className="text-primary-green" />
              <span>Secure encrypted payment via 256-bit SSL.</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

const Payment = () => {
  return (
    <Layout>
      <React.Suspense fallback={<div className="p-10 text-center">Loading checkout...</div>}>
        <PaymentContent />
      </React.Suspense>
    </Layout>
  );
};

export default Payment;
