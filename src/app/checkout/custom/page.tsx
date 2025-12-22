'use client';

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

export default function CustomCheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [customItem, setCustomItem] = useState<{
    product: { name: string; price: number; image_url: string };
    quantity: number;
    size_name: string;
    color: string;
    custom_image_url?: string;
    custom_text?: string;
    custom_options?: Record<string, unknown>;
  } | null>(null);

  const [storeSettings, setStoreSettings] = useState<{ shipping_fee: number; free_shipping_threshold: number; gst_percentage: number; gst_enabled: boolean }>({
    shipping_fee: 99,
    free_shipping_threshold: 999,
    gst_percentage: 18,
    gst_enabled: true,
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  useEffect(() => {
    // Fetch store settings
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setStoreSettings({
              shipping_fee: Number(data.settings.shipping_fee || 99),
              free_shipping_threshold: Number(data.settings.free_shipping_threshold || 999),
              gst_percentage: Number(data.settings.gst_percentage || 18),
              gst_enabled: typeof data.settings.gst_enabled !== 'undefined' ? Boolean(data.settings.gst_enabled) : true,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    })();

    // Load draft from localStorage
    const raw = localStorage.getItem('glee_custom_draft');
    if (!raw) {
      router.replace('/customize'); // Redirect back if no draft
      return;
    }
    try {
      setCustomItem(JSON.parse(raw));
    } catch {
      router.replace('/customize');
    }
  }, [router]);

  // Calculations
  const subtotal = customItem ? customItem.product.price * customItem.quantity : 0;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const proceedToWhatsApp = async () => {
     // require phone
     if (!formData.phone) {
        showToast('Please enter your phone number so we can open WhatsApp', { type: 'error' });
        return;
      }

      if (!customItem) {
        showToast('No custom design found. Please create your design first.', { type: 'error' });
        return;
      }

      // 1. Create Order in DB
      let orderId = null;
      try {
        const items = [{
            product_id: -1, // Custom product
            quantity: customItem.quantity,
            size: customItem.size_name,
            price: customItem.product.price,
            custom_color: customItem.color,
            custom_image_url: customItem.custom_image_url,
            custom_text: customItem.custom_text,
            custom_options: customItem.custom_options
        }];

        const payload = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            shipping_address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
            payment_method: 'whatsapp_custom',
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
            throw new Error('Failed to create order');
        }

        const data = await res.json();
        orderId = data.order_id;
      } catch (error) {
        console.error('Order creation failed:', error);
        showToast('Failed to create order. Please try again.', { type: 'error' });
        return;
      }
  
      // Owner Number
      const ownerNumber = 8248333655;
  
      let msg = `*New Custom Order #${orderId}*\n`;
      msg += `Name: ${formData.firstName} ${formData.lastName} (${formData.phone})\n`;
      msg += `Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n`;
      
      msg += `*Custom Design Details:*\n`;
      if (customItem) {
        msg += `- Product: ${customItem.product.name}\n`;
        msg += `- Size: ${customItem.size_name} | Color: ${customItem.color}\n`;
        if (customItem.custom_text) msg += `- Text: "${customItem.custom_text}"\n`;
        if (customItem.custom_image_url) {
            msg += `- Design URL: ${customItem.custom_image_url}\n`;
        }
        // Add option details if available
        if (customItem.custom_options) {
             const opts = customItem.custom_options as { scale?: number | string; position?: { x?: number | string; y?: number | string } };
             const scale = typeof opts.scale === 'number' ? opts.scale : (typeof opts.scale === 'string' ? Number(opts.scale) : NaN);
             const finalScale = Number.isFinite(scale) ? scale : 1;
             const posX = opts.position && (typeof opts.position.x === 'number' ? opts.position.x : (typeof opts.position.x === 'string' ? Number(opts.position.x) : 0));
             const posY = opts.position && (typeof opts.position.y === 'number' ? opts.position.y : (typeof opts.position.y === 'string' ? Number(opts.position.y) : 0));
             msg += `- Specs: Scale ${finalScale.toFixed(2)}x, Pos(${posX},${posY})\n`;
        }
        msg += `\nSubtotal: ${formatPrice(subtotal)}\n`;
        if (appliedCoupon) {
          msg += `Coupon: ${appliedCoupon.code} (-${appliedCoupon.discount_percent}%)\n`;
          msg += `Discount: -${formatPrice(discountAmount)}\n`;
        }
        msg += `Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}\n`;
        if (gst > 0) msg += `GST: ${formatPrice(gst)}\n`;
        msg += `*Total: ${formatPrice(total)}*\n\n`;
        msg += `(Subject to change based on complexity)\n`;
      }
      
      const encodedMsg = encodeURIComponent(msg);
      const waUrl = `https://wa.me/${ownerNumber}?text=${encodedMsg}`;
      
      // Navigate straight to WhatsApp
      window.location.href = waUrl;
      
      // Clear draft
      localStorage.removeItem('glee_custom_draft');

      setTimeout(() => {
        router.replace(`/checkout/success?orderId=${orderId}`);
      }, 1000);
  };

  if (!customItem) return null; // or loading spinner

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
            <Link href="/customize" className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Design
            </Link>
            <span className="font-bold text-lg text-black
            ">Custom Order Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="order-2 lg:order-1">
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
                  onClick={proceedToWhatsApp}
                  disabled={!isFormComplete}
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${isFormComplete
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Confirm & Send on WhatsApp
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  This will open WhatsApp with your design details. The final price may be adjusted based on the complexity of your design.
                </p>
             </div>     
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-black mb-6">Custom Order Summary</h2>
              
              {/* Item Details */}
              <div className="flex gap-4 mb-6">
                <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                  <Image
                    src={customItem.product.image_url}
                    alt={customItem.product.name}
                    fill
                    className="object-cover"
                    unoptimized={customItem.product.image_url.startsWith('blob:')} // Handle blob urls for preview
                  />
                </div>
                <div className="grow">
                  <p className="font-medium text-black text-sm">{customItem.product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Size: {customItem.size_name}</p>
                  <p className="text-xs text-gray-500">Color: {customItem.color}</p>
                  {customItem.custom_text && (
                     <p className="text-xs text-gray-500 mt-1 italic">&quot;{customItem.custom_text}&quot;</p>
                  )}
                </div>
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
                <div className="flex justify-between pt-3 border-t border-gray-100 items-baseline">
                  <span className="text-lg font-bold text-black">Total Estimate</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">{formatPrice(total)}*</span>
                    <p className="text-[10px] text-gray-400 font-normal mt-0.5">*Final price may vary</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <p className="text-xs text-blue-700 leading-relaxed">
                   <strong>How Custom Orders Work:</strong><br/>
                   1. Send your design details via WhatsApp.<br/>
                   2. We&apos;ll review the complexity and confirm the final price.<br/>
                   3. Once confirmed, we&apos;ll process your payment and start printing!
                 </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
