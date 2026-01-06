'use client';

import showToast from '@/lib/toast';
import { useState } from 'react';

export default function Newsletter() {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatsappNumber || whatsappNumber.length !== 10) {
            showToast('Please enter a valid 10-digit number', { type: 'error' });
            return;
        }

        setSubscribing(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappNumber }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Successfully subscribed!', { type: 'success' });
                setWhatsappNumber('');
            } else {
                showToast(data.error || 'Failed to subscribe', { type: 'error' });
            }
        } catch (error) {
            console.error('Subscribe error:', error);
            showToast('Something went wrong', { type: 'error' });
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-black mb-4">Get Updates on WhatsApp</h2>
                    <p className="text-gray-500 mb-8">Subscribe to get special offers, free giveaways, and exclusive deals directly on WhatsApp.</p>
                    <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-md mx-auto">
                        <input
                            type="tel"
                            placeholder="Enter WhatsApp Number"
                            value={whatsappNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 10) setWhatsappNumber(val);
                            }}
                            className="w-full px-6 py-4 bg-gray-100 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 text-black transition-all"
                            disabled={subscribing}
                            required
                            pattern="\d{10}"
                            title="Please enter a valid 10-digit mobile number"
                        />
                        <button
                            type="submit"
                            disabled={subscribing}
                            className="w-full px-8 py-4 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {subscribing ? 'Subscribing...' : 'Subscribe Now'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
