"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import api from '../../../../../utils/api';
import safeLocalStorage from '../../../../../utils/safeLocalStorage';

export default function EsewaPaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationStarted = useRef(false);
  const [state, setState] = useState({
    kind: 'loading',
    message: 'Verifying your payment with eSewa...',
    transaction: null,
  });
  const [retryNumber, setRetryNumber] = useState(0);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const verify = async () => {
      const encodedData = (searchParams.get('data') || '').replace(/ /g, '+');
      if (!encodedData) {
        setState({
          kind: 'error',
          message: 'The eSewa verification data is missing. Your plan was not changed.',
          transaction: null,
        });
        return;
      }

      try {
        const response = await api.post('/api/payments/esewa/verify/', {
          data: encodedData,
        }, { timeoutMs: 25000 });
        safeLocalStorage.setItem(
          'veritas_subscription_plan',
          response.user.subscription_plan
        );
        setState({
          kind: 'success',
          message: response.message,
          transaction: response.transaction,
        });
      } catch (error) {
        setState({
          kind: 'error',
          message:
            error.message ||
            'The payment could not be verified. Your plan has not been changed.',
          transaction: null,
        });
      }
    };

    verify();
  }, [params.transactionUuid, retryNumber, searchParams]);

  const retryVerification = () => {
    verificationStarted.current = false;
    setState({
      kind: 'loading',
      message: 'Verifying your payment with eSewa...',
      transaction: null,
    });
    setRetryNumber((value) => value + 1);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-12 grid place-items-center">
      <section className="w-full max-w-xl rounded-[30px] border border-stone-200 bg-white p-7 sm:p-10 text-center shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
        {state.kind === 'loading' && (
          <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-[#1FA463]" />
        )}
        {state.kind === 'success' && (
          <CheckCircle2 className="mx-auto h-16 w-16 text-[#1FA463]" />
        )}
        {state.kind === 'error' && (
          <TriangleAlert className="mx-auto h-16 w-16 text-amber-500" />
        )}

        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-stone-900">
          {state.kind === 'loading' && 'Confirming payment'}
          {state.kind === 'success' && 'Subscription activated'}
          {state.kind === 'error' && 'Verification needs attention'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-stone-500">
          {state.message}
        </p>

        {state.transaction && (
          <div className="mt-7 rounded-2xl bg-stone-50 p-4 text-left text-sm">
            <div className="flex justify-between gap-4 py-1.5">
              <span className="font-semibold text-stone-400">Plan</span>
              <span className="font-black text-stone-800">{state.transaction.plan_name}</span>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <span className="font-semibold text-stone-400">Paid</span>
              <span className="font-black text-[#1FA463]">
                Rs. {state.transaction.total_amount}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <span className="font-semibold text-stone-400">Reference</span>
              <span className="max-w-[65%] break-all text-right font-bold text-stone-700">
                {state.transaction.reference_id || state.transaction.transaction_uuid}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {state.kind === 'success' ? (
            <button
              type="button"
              onClick={() => router.replace('/dashboard')}
              className="w-full rounded-2xl bg-[#1FA463] px-5 py-3.5 font-black text-white transition hover:bg-[#178a52] cursor-pointer"
            >
              Continue to dashboard
            </button>
          ) : state.kind === 'error' ? (
            <>
              <button
                type="button"
                onClick={retryVerification}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1FA463] px-5 py-3.5 font-black text-white transition hover:bg-[#178a52] cursor-pointer"
              >
                <RefreshCw size={17} />
                Try verification again
              </button>
              <button
                type="button"
                onClick={() => router.push('/subscription')}
                className="w-full rounded-2xl bg-stone-100 px-5 py-3.5 font-black text-stone-700 transition hover:bg-stone-200 cursor-pointer"
              >
                Back to plans
              </button>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
