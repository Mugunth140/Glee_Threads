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
    id: number;
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

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

  const proceedToShipping = () => {
    // require phone
    if (!formData.phone) {
      showToast('Please enter your phone number so we can open WhatsApp', { type: 'error' });
      return;
    }

    // TODO : refactor to use phone number in .env
    // const ownerNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || 8248333655;
    const ownerNumber = 8248333655;
    if (!ownerNumber) {
      showToast('Site owner WhatsApp number is not configured', { type: 'error' });
      setStep(2);
      return;
    }

    const cart = getCart();
    if (!cart || cart.length === 0) {
      showToast('Your cart is empty', { type: 'error' });
      return;
    }

    let msg = `New order from ${formData.firstName} ${formData.lastName} (${formData.phone})\n`;
    msg += `Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n`;
    msg += `Items:\n`;
    cart.forEach((it) => {
      const name = it.product?.name || 'Product';
      const qty = it.quantity || 1;
      const size = it.size_name || it.size_id;
      const color = it.color || '-';
      msg += `- ${name} x${qty} | Size: ${size} | Color: ${color}\n`;
    });
    msg += `\nSubtotal: ${formatPrice(subtotal)}\nTotal: ${formatPrice(total)}`;

    // encoded message (used below as encodedMsg)
    // Save last order draft to localStorage so the WhatsApp confirmation page can persist it
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
        total_amount: subtotal + shipping + gst,
      };
      localStorage.setItem('glee_last_order', JSON.stringify(payload));
    } catch {
      // ignore
    }

    const encodedMsg = encodeURIComponent(msg);
    // open WhatsApp web/app with prefilled message to owner's number in a new tab
    const waUrl = `https://wa.me/${ownerNumber}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');

    // Redirect the current tab to a confirmation page explaining that WhatsApp was opened
    router.replace('/checkout/whatsapp');
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
      showToast('Order placed — thank you!', { type: 'success' });
      router.push('/');
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
                  onClick={() => proceedToShipping()}
                  disabled={!isFormComplete}
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${
                    isFormComplete
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continue to Shipping
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                  className="grow px-4 py-3 border border-gray-200 text-black rounded-xl text-sm focus:ring-2 focus:ring-black/60 focus:border-transparent transition-all"
                />
                <button className="px-6 py-3 bg-gray-100 text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-medium text-black">{formatPrice(gst)}</span>
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
