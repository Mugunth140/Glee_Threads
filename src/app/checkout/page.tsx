'use client';

import { clearCart, getCart } from '@/lib/anonymousCart';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Contact
    email: '',
    phone: '',
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    // Payment
    upiId: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    size: string | number;
    color: string;
    quantity: number;
    image: string;
  }>>([]);

  useEffect(() => {
    setTimeout(() => {
      setCartItems(getCart().map((it) => ({
        id: it.id,
        name: it.product?.name || 'Product',
        price: Number(it.product?.price || 0),
        size: it.size_name || it.size_id,
        color: it.color || '',
        quantity: it.quantity || 1,
        image: it.product?.image_url || '',
      })));
    }, 0);
  }, []);

  const [storeSettings, setStoreSettings] = useState<{ shipping_fee: number; free_shipping_threshold: number; gst_percentage: number; gst_enabled: boolean }>({ shipping_fee: 99, free_shipping_threshold: 999, gst_percentage: 18, gst_enabled: true });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (data.settings) {
          setStoreSettings({
            shipping_fee: Number(data.settings.shipping_fee || 99),
            free_shipping_threshold: Number(data.settings.free_shipping_threshold || 999),
            gst_percentage: Number(data.settings.gst_percentage || 18),
            gst_enabled: (() => {
              const v = data.settings.gst_enabled;
              if (v === true || v === 'true' || v === 1 || v === '1') return true;
              return false;
            })(),
          });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount_percent / 100)) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = subtotalAfterDiscount >= storeSettings.free_shipping_threshold ? 0 : storeSettings.shipping_fee;
  const gst = storeSettings.gst_enabled ? Math.round(subtotalAfterDiscount * (storeSettings.gst_percentage / 100)) : 0;
  const total = subtotalAfterDiscount + shipping + gst;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
        showToast(`Coupon applied: ${data.discount_percent}% OFF`, { type: 'success' });
      } else {
        showToast(data.error || 'Invalid coupon', { type: 'error' });
      }
    } catch {
      showToast('Error applying coupon', { type: 'error' });
    }
  };

  const isFormComplete = [
    formData.email,
    formData.phone,
    formData.firstName,
    formData.lastName,
    formData.address,
    formData.city,
    formData.state,
    formData.pincode,
  ].every((v) => typeof v === 'string' && v.trim().length > 0);

  const handleWhatsAppCheckout = async () => {
    // require phone
    if (!formData.phone) {
      showToast('Please enter your phone number so we can open WhatsApp', { type: 'error' });
      return;
    }

    // TODO : refactor to use phone number in .env
    // const ownerNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || 8248333655;
    const ownerNumber = 8248333655;
    
    const cart = getCart();
    if (!cart || cart.length === 0) {
      showToast('Your cart is empty', { type: 'error' });
      return;
    }

    // 1. Create Order in DB first
    let orderId = null;
    try {
      const items = cart.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity || 1,
        size: it.size_name || it.size_id || null,
        price: Number(it.product?.price || 0),
      }));

      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        shipping_address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        payment_method: 'whatsapp',
        items,
        // use computed `total` (already includes coupon discount)
        total_amount: total,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount_percent: appliedCoupon?.discount_percent || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const data = await res.json();
      orderId = data.order_id;

    } catch (error) {
      console.error('Order creation failed:', error);
      showToast('Failed to create order. Please try again.', { type: 'error' });
      return;
    }

    // 2. Construct WhatsApp Message with Order ID
    let msg = `*New Order #${orderId}*\n`;
    msg += `Name: ${formData.firstName} ${formData.lastName} (${formData.phone})\n`;
    msg += `Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n`;
    msg += `*Items:*\n`;
    cart.forEach((it) => {
      const name = it.product?.name || 'Product';
      const qty = it.quantity || 1;
      const size = it.size_name || it.size_id;
      const color = it.color || '-';
      msg += `- ${name} x${qty} | Size: ${size} | Color: ${color}\n`;
    });
    msg += `\nSubtotal: ${formatPrice(subtotal)}\n`;
    if (appliedCoupon) {
      msg += `Coupon: ${appliedCoupon.code} (-${appliedCoupon.discount_percent}%)\n`;
      msg += `Discount: -${formatPrice(discountAmount)}\n`;
    }
    msg += `Total: ${formatPrice(total)}`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${ownerNumber}?text=${encodedMsg}`;
    
    // 3. Open WhatsApp in a new tab and keep current tab so we can redirect to success reliably
    try {
      window.open(waUrl, '_blank');
    } catch {
      // fallback to same-tab navigation if popup blocked
      window.location.href = waUrl;
    }

    // 4. Clear Cart
    clearCart();
    try { localStorage.setItem('glee_cart_v1', JSON.stringify([])); } catch {}

    // 5. Redirect to success page after a short delay to allow WhatsApp to trigger
    setTimeout(() => {
      router.replace(`/checkout/success?orderId=${orderId}`);
    }, 1000);
  };

  const placeOrder = async () => {
    try {
      const cart = getCart();
      const items = cart.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity || 1,
        size: it.size_name || it.size_id || null,
        price: Number(it.product?.price || 0),
      }));

      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        shipping_address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        payment_method: 'manual',
        items,
        total_amount: total,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount_percent: appliedCoupon?.discount_percent || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to place order', { type: 'error' });
        return;
      }

      // Success — clear cart and redirect
      try {
        clearCart();
        localStorage.setItem('glee_cart_v1', JSON.stringify([]));
      } catch {
        // ignore
      }
      const data = await res.json().catch(() => ({}));
      const orderId = (data && (data.order_id || data.orderId)) || null;
      showToast('Order placed — thank you!', { type: 'success' });
      // Redirect to success page for consistent desktop/mobile UX
      router.replace(`/checkout/success${orderId ? `?orderId=${orderId}` : ''}`);
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('Failed to place order', { type: 'error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Return to Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="order-2 lg:order-1">
            {/* Step 1: Contact & Shipping Address */}
            {step === 1 && (
              <div className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-black">
                  <h2 className="text-xl font-bold text-black mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                          +91
                        </span>
                        <input
                          type="number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="9876543210"
                          className="w-full px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-black mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 text-black focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House no, Building, Street, Area"
                        className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, Suite, etc. (Optional)</label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                        <input
                          type="number"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="6 digit PIN"
                          maxLength={6}
                          className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleWhatsAppCheckout()}
                  disabled={!isFormComplete}
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${
                    isFormComplete
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Place Order via WhatsApp
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-black mb-6">Shipping</h2>
                  <p className="text-sm text-gray-600">We&apos;ll ship to the address you provided. No shipping method selection is required.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white text-black py-4 rounded-full font-semibold border border-gray-200 hover:border-black transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => placeOrder()}
                    className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    Place Order
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
                
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="grow">
                      <p className="font-medium text-black text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                    </div>
                    <p className="font-medium text-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="grow px-4 py-3 border border-gray-200 text-black rounded-xl text-sm focus:ring-2 focus:ring-black/60 focus:border-transparent transition-all font-bold"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-md active:scale-95"
                >
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>Discount ({appliedCoupon.discount_percent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className={`flex justify-between text-sm ${storeSettings.gst_enabled ? 'text-gray-600' : 'text-gray-400 opacity-70'}`}>
                  <span>Estimated Tax</span>
                  <span className={`font-medium ${storeSettings.gst_enabled ? 'text-black' : 'text-gray-400'}`}>{storeSettings.gst_enabled ? formatPrice(gst) : '—'}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-black">Total</span>
                  <span className="text-lg font-bold text-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-xs text-gray-500">Secure Payment</p>
                  </div>
                  <div>
                    <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-xs text-gray-500">Easy Returns</p>
                  </div>
                  <div>
                    <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p className="text-xs text-gray-500">Free Shipping 999+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
