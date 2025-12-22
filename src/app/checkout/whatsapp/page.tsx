'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function WhatsappContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const waUrl = searchParams.get('waUrl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleOpenWhatsApp = () => {
    if (waUrl) {
      window.location.href = waUrl;
      // After a short delay, redirect to success? Or let user click "Done".
      // Better to let user manually confirm they are done or just leave them here/redirect after timeout.
      // Let's redirect to success after a delay to ensure the browser has time to handle the custom protocol.
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${orderId}`);
      }, 1500);
    }
  };

  if (!mounted) return null;

  if (!orderId || !waUrl) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <p className="text-gray-500">Invalid order details.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-2">Order Created!</h1>
        <div className="bg-white rounded-xl p-3 mb-6 border border-gray-100 inline-block">
          <p className="text-sm font-mono font-bold text-black">Order #{orderId}</p>
        </div>

        <p className="text-gray-600 mb-8">
          Your order has been saved. Please click the button below to send the details to us on WhatsApp to finalize it.
        </p>

        <button 
          onClick={handleOpenWhatsApp}
          className="block w-full bg-[#25D366] text-white py-4 rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-lg hover:shadow-xl active:scale-95 mb-4 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Open WhatsApp
        </button>

        <button 
          onClick={() => router.push(`/checkout/success?orderId=${orderId}`)}
          className="text-sm text-gray-500 hover:text-black underline transition-colors"
        >
          Skip / I&apos;ve already sent it
        </button>
      </div>
    </div>
  );
}

export default function WhatsappConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    }>
      <WhatsappContent />
    </Suspense>
  );
}
