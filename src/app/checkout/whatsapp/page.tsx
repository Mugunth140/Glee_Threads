"use client";

import { clearCart, getCart } from '@/lib/anonymousCart';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function WhatsappConfirmationPage() {
  const router = useRouter();
  const [items, setItems] = useState<Array<{
    id: string;
    name: string;
    qty: number;
    size: string | number;
    color: string;
    price: number;
    image: string;
  }>>([]);

  useEffect(() => {
    setTimeout(() => {
      const cart = getCart();
      setItems(cart.map((it) => ({
        id: it.id,
        name: it.product?.name || 'Product',
        qty: it.quantity || 1,
        size: it.size_name || it.size_id,
        color: it.color || '',
        price: Number(it.product?.price || 0),
        image: it.product?.image_url || '',
      })));
    }, 0);
  }, []);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  const confirmSent = () => {
    // Try to persist the saved order draft to the database, then clear cart and redirect
    (async () => {
      try {
        const raw = localStorage.getItem('glee_last_order');
        if (raw) {
          const payload = JSON.parse(raw);
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Failed to persist order from WhatsApp flow');
          }
          // Clear draft
          localStorage.removeItem('glee_last_order');
        }

        clearCart();
        localStorage.setItem('glee_cart_v1', JSON.stringify([]));
        showToast('Thanks — order acknowledged', { type: 'success' });
        router.push('/');
      } catch (err) {
        console.error('Error confirming WhatsApp order:', err);
        // fallback: still clear cart
        try { clearCart(); localStorage.setItem('glee_cart_v1', JSON.stringify([])); } catch {}
        showToast('Thanks — order acknowledged', { type: 'success' });
        router.push('/');
      }
    })();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black">Placing your order on WhatsApp</h1>
          <p className="text-sm text-gray-600 mt-2">We opened WhatsApp with your order details — please send the message to complete the order.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-black">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-black">{it.name}</div>
                  <div className="text-xs text-gray-600">Size: {it.size} · Color: {it.color}</div>
                </div>
                <div className="text-sm font-semibold">{formatPrice(it.price * it.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
            <div>Subtotal</div>
            <div>{formatPrice(subtotal)}</div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-600">If you already sent the message on WhatsApp, click the button below to finish.</p>
          <button onClick={confirmSent} className="mt-3 inline-block px-6 py-3 bg-black text-white rounded-full font-semibold">Finish</button>
          <div className="mt-4 text-xs text-gray-500">If you prefer, you can return home and contact us later.</div>
        </div>
      </div>
    </div>
  );
}
