"use client";

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import api from '../../../../../utils/api';

export default function EsewaPaymentFailurePage() {
  const params = useParams();
  const router = useRouter();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current || !params.transactionUuid) return;
    recorded.current = true;
    api
      .post(`/api/payments/esewa/transactions/${params.transactionUuid}/failure/`, {})
      .catch(() => {
        // The canceled payment remains inactive even if this best-effort update fails.
      });
  }, [params.transactionUuid]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-12 grid place-items-center">
      <section className="w-full max-w-lg rounded-[30px] border border-stone-200 bg-white p-7 sm:p-10 text-center shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
        <XCircle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-stone-900">
          Payment was not completed
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-stone-500">
          No subscription change was made. You can safely return to the plans page and
          try the eSewa sandbox again.
        </p>
        <button
          type="button"
          onClick={() => router.replace('/subscription')}
          className="mt-8 w-full rounded-2xl bg-[#1FA463] px-5 py-3.5 font-black text-white transition hover:bg-[#178a52] cursor-pointer"
        >
          Return to plans
        </button>
      </section>
    </main>
  );
}
