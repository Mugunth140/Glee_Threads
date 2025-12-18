"use client";

import { getCart, removeFromCartById, updateQuantity } from '@/lib/anonymousCart';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function CartPage() {
  const [items, setItems] = useState<Array<{
    id: string;
    product_id: number;
    product: {
      name: string;
      price: number;
      image_url?: string;
    };
    size_id?: number;
    size_name?: string;
    color?: string;
    quantity?: number;
  }>>([]);

  useEffect(() => {
    // Populate from localStorage after mount to avoid hydration mismatch
    const initial = getCart();
    setTimeout(() => setItems(initial), 0);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'glee_cart_v1') {
        setItems(getCart());
      }
    };
    window.addEventListener('storage', onStorage);
    // Also listen to our custom storage event dispatch
    const onCustom = () => setItems(getCart());
    window.addEventListener('glee-cart-updated', onCustom as EventListener);

    // If any items miss `size_name`, fetch product sizes to resolve readable labels
    (async () => {
      const needLookup = initial.filter((it) => !it.size_name);
      const byProduct = Array.from(new Set(needLookup.map((i) => i.product_id)));
      if (byProduct.length === 0) return;
      const updated = [...initial];
      await Promise.all(byProduct.map(async (pid) => {
        try {
          const res = await fetch(`/api/products/${pid}`);
          if (!res.ok) return;
          const prod = await res.json();
          const sizes = prod.sizes || [];
          updated.forEach((it, idx) => {
            if (it.product_id === pid && !it.size_name) {
              const s = sizes.find((ss: { size_id: number }) => ss.size_id === it.size_id);
              if (s) updated[idx].size_name = s.size_name;
            }
          });
        } catch {
          // ignore
        }
      }));
      // Write back to localStorage so future loads include size_name
      try {
        localStorage.setItem('glee_cart_v1', JSON.stringify(updated));
        // notify listeners in same window
        window.dispatchEvent(new StorageEvent('storage', { key: 'glee_cart_v1', newValue: JSON.stringify(updated) }));
      } catch (e) {console.log(e)}
      setItems(updated);
    })();

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('glee-cart-updated', onCustom as EventListener);
    };
  }, []);

  const handleRemove = (id: string) => {
    removeFromCartById(id);
    setItems(getCart());
    showToast('Removed from cart', { type: 'info' });
  };

  const changeQty = (id: string, delta: number) => {
    const it = getCart().find((x) => x.id === id);
    if (!it) return;
    const newQ = (it.quantity || 1) + delta;
    updateQuantity(id, newQ);
    setItems(getCart());
  };

  const subtotal = items.reduce((s, it) => s + ((it.product?.price || 0) * (it.quantity || 1)), 0);
  const shipping = subtotal > 999 ? 0 : items.length ? 99 : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to checkout — find your favorite tees and add them to your cart.</p>
          <Link href="/products" className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-6">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative">
                  {item.product?.image_url ? (
                    <Image src={item.product.image_url} alt={item.product?.name || ''} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-black">{item.product?.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">{item.product?.price ? formatPrice(Number(item.product.price)) : ''}</div>
                  <div className="flex items-center gap-3 mt-2">
                    {item.color && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: item.color }} />
                        <div className="text-sm text-gray-600">{item.color}</div>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">Size: {item.size_name || item.size_id}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => handleRemove(item.id)} className="text-sm text-red-600 ">Remove</button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(item.id, -1)} className="px-3 py-1 border rounded text-black">-</button>
                    <div className="px-3 py-1 border rounded text-black">{item.quantity}</div>
                    <button onClick={() => changeQty(item.id, 1)} className="px-3 py-1 border rounded text-black">+</button>
                  </div>
                  <div className="text-sm font-medium text-black">{formatPrice(Number(item.product?.price || 0) * (item.quantity || 1))}</div>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-black mb-4">Order Summary</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>GST</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between font-semibold text-black text-lg mb-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="block text-center px-4 py-3 bg-black text-white rounded-full font-semibold">Proceed to Checkout</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
