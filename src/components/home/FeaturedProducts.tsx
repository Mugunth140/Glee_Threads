'use client';

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

interface FeaturedProductsProps {
    products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-black mb-2">Trending T-Shirts</h2>
                        <p className="text-gray-500">Top picks from our collection</p>
                    </div>
                    <Link
                        href="/products"
                        className="text-sm font-medium text-black hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group"
                        >
                            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                {/* Quick Actions */}
                                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 rounded-xl text-sm font-semibold hover:bg-white transition-colors">
                                        Quick View
                                    </button>
                                </div>
                                {/* Wishlist Button */}
                                <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Add to wishlist">
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                                {/* Category Tag */}
                                {product.category_name && (
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                                        {product.category_name}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-lg font-semibold text-black">
                                    {formatPrice(Number(product.price))}
                                </p>
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="flex gap-1 pt-1">
                                        {product.sizes.slice(0, 4).map((size) => (
                                            <span
                                                key={size.size_id}
                                                className={`text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600`}
                                            >
                                                {size.size_name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
