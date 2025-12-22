'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We have received your details.
        </p>

        {orderId && (
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
            <p className="text-xl font-mono font-bold text-black">#{orderId}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Please complete the conversation on WhatsApp if you haven&apos;t already.
        </p>

        <Link 
          href="/" 
          className="block w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
