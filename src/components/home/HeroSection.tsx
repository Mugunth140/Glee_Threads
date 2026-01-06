'use client';

import { HeroProduct, Product } from '@/types/product';
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

interface HeroSectionProps {
    heroProducts: HeroProduct[];
    featuredProducts: Product[];
}

export default function HeroSection({ heroProducts, featuredProducts }: HeroSectionProps) {
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // Auto-scroll carousel
    useEffect(() => {
        if (heroProducts.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroProducts.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroProducts.length]);

    return (
        <section className="relative">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh] py-12">
                    {/* Left - Text Content */}
                    <div className="order-1 lg:order-1">
                        <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
                            Custom & Ready-Made T-Shirts
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                            Design Your
                            <br />
                            <span className="text-gray-400">Perfect Tee</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                            Create custom t-shirts with your unique designs or shop our collection of ready-made styles. Premium quality, endless possibilities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/customize"
                                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-primary-hover transition-all w-full sm:w-auto"
                            >
                                Customize Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/products"
                                className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-semibold border border-gray-200 hover:border-black/60 transition-all w-full sm:w-auto"
                            >
                                Shop Collection
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-12 mt-12 pt-8 border-t border-gray-100">
                            <div>
                                <p className="text-3xl font-bold text-black">500+</p>
                                <p className="text-sm text-gray-500">Designs</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-black">1000+</p>
                                <p className="text-sm text-gray-500">Custom Orders</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-black">15k+</p>
                                <p className="text-sm text-gray-500">Happy Customers</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Featured Image / Carousel */}
                    <div className="order-2 lg:order-2 relative">
                        <div className="relative aspect-3/4 max-w-md mx-auto lg:max-w-none">
                            <div className="absolute inset-0 bg-linear-to-b from-gray-100 to-gray-200 rounded-3xl" />

                            {/* Carousel Image */}
                            {heroProducts.length > 0 ? (
                                heroProducts.map((item, idx) => (
                                    <Link
                                        key={item.id}
                                        href={`/products/${item.product_id}`}
                                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out block ${idx === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                            }`}
                                    >
                                        <Image
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover rounded-3xl"
                                            priority={idx === 0}
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        {/* Floating Card */}
                                        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500">Featured</p>
                                                    <p className="font-semibold text-black">{item.product.name}</p>
                                                </div>
                                                <p className="text-xl font-bold text-black">{formatPrice(Number(item.product.price))}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                // Fallback to Featured Product
                                featuredProducts[0] && (
                                    <Link href={`/products/${featuredProducts[0].id}`} className="block h-full relative">
                                        <Image
                                            src={featuredProducts[0].image_url}
                                            alt="Featured Product"
                                            fill
                                            className="object-cover rounded-3xl"
                                            priority
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        {/* Floating Card */}
                                        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500">Featured</p>
                                                    <p className="font-semibold text-black">{featuredProducts[0].name}</p>
                                                </div>
                                                <p className="text-xl font-bold text-black">{formatPrice(Number(featuredProducts[0].price))}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>

                        {/* Carousel Indicators */}
                        {heroProducts.length > 1 && (
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {heroProducts.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentHeroIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentHeroIndex ? 'bg-black w-4' : 'bg-gray-300'
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
