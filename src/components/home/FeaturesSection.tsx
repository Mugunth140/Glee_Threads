export default function FeaturesSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                        <div className="p-3 bg-black rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-black mb-1">Free Shipping</h3>
                            <p className="text-sm text-gray-500">On orders over Rs.1000</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                        <div className="p-3 bg-black rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-black mb-1">Easy Returns</h3>
                            <p className="text-sm text-gray-500">30 day return policy</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                        <div className="p-3 bg-black rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-black mb-1">Secure Payment</h3>
                            <p className="text-sm text-gray-500">100% secure checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
