'use client';

import { Category } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Default placeholder image for categories without images
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000';

export default function CategorySection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="py-16 border-y border-gray-100 bg-gray-50/30">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-black mb-2">Shop by Category</h2>
                            <p className="text-gray-500">Find the style that suits you best</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {[...Array(5)].map((_, idx) => (
                            <div
                                key={idx}
                                className={`animate-pulse bg-gray-200 rounded-3xl ${idx === 0 || idx === 1 ? 'md:col-span-3 aspect-2/1' : 'md:col-span-2 aspect-square'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return null; // Don't show section if no categories
    }

    return (
        <section className="py-16 border-y border-gray-100 bg-gray-50/30">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-black mb-2">Shop by Category</h2>
                        <p className="text-gray-500">Find the style that suits you best</p>
                    </div>
                    <Link
                        href="/products"
                        className="text-sm font-semibold text-black flex items-center gap-2 hover:underline"
                    >
                        All Products
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {categories.slice(0, 5).map((cat, idx) => (
                        <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug}`}
                            className={`group relative flex flex-col justify-between p-8 rounded-3xl bg-black border border-gray-100 overflow-hidden
                ${idx === 0 || idx === 1 ? 'md:col-span-3 aspect-2/1' : 'md:col-span-2 aspect-square'}
              `}
                        >
                            <Image
                                src={cat.image_url || DEFAULT_CATEGORY_IMAGE}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-50"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            {/* Abstract Background Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-gray-200/10 to-transparent rounded-bl-full transition-all duration-500 z-10" />

                            <div className="relative z-10 flex justify-between items-start">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Collection 0{idx + 1}</span>
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                                    <svg className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl md:text-4xl font-extrabold text-white transition-colors duration-300 tracking-tight">{cat.name}</h3>
                                <p className="text-sm font-medium text-gray-300 group-hover:text-white mt-2 transition-all opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 duration-300 delay-75">
                                    Browse {cat.name} Collection
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
