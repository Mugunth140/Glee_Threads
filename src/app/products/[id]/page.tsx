"use client";

import { addToCart as addToAnonymousCart } from '@/lib/anonymousCart';
import { showToast } from '@/lib/toast';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

// Format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [showShipping, setShowShipping] = useState(true);
  // No auth required — use anonymous localStorage cart

  // Countdown timer for delivery
  // Delivery timing removed per request

  const fetchProduct = async () => {
    try {
      const id = resolvedParams?.id || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : undefined);
      if (!id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data);
      // Pre-select first size if available
      const firstSize = data.sizes?.[0];
      if (firstSize) {
        setSelectedSize(firstSize.size_name || null);
      }
      // Pre-select first color if available
      const firstColor = data.colors?.[0];
      if (firstColor) setSelectedColor(firstColor);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast('Please select a size', { type: 'error' });
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      showToast('Please select a color', { type: 'error' });
      return;
    }

    setAddingToCart(true);
    try {
      // Use anonymous localStorage cart so users can add items without authentication
      addToAnonymousCart({
        product_id: product?.id || 0,
        size_id: 0,
        size_name: selectedSizeInfo?.size_name || selectedSize || undefined,
        quantity: 1,
        color: selectedColor || undefined,
        product: { id: product?.id || 0, name: product?.name, price: product?.price, image_url: product?.image_url },
      });

      // Optionally, attempt server-side add for authenticated users — skipped here.
      showToast('Added to cart', { type: 'success' });
      // Notify other windows/components by dispatching storage event already handled in helper
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', { type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const getSelectedSizeInfo = () => {
    if (!selectedSize || !product?.sizes) return null;
    return product.sizes.find((s) => s.size_name === selectedSize);
  };

  const selectedSizeInfo = getSelectedSizeInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-black border-r-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Product not found</h1>
          <Link href="/products" className="text-black underline hover:text-gray-600">
            ← Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  // Mock additional images (in a real app, these would come from the API)
  const productImages = [product.image_url, product.image_url, product.image_url];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-black transition-colors">Product details</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden bg-gray-100 transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-black' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Pill */}
            {product.category_name && (
              <span className="inline-block px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">
                {product.category_name}
              </span>
            )}
            
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl font-semibold text-black mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-black">{formatPrice(Number(product.price))}</p>
            </div>

            {/* Delivery timing removed */}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Choose Color</p>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        aria-label={`Select color ${c}`}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === c ? 'border-black' : 'border-gray-200'}`}
                        style={{ backgroundColor: c }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size) => {
                    return (
                      <button
                        key={size.size_name}
                        onClick={() => setSelectedSize(size.size_name)}
                        className={`min-w-14 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                          selectedSize === size.size_name
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {size.size_name}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">Size options are not configured for this product.</p>
                )}
              </div>
              {/* Stock/quantity display removed per request */}
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  // If the product has size variants, require a size to be selected
                  (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                  addingToCart
                }
                className="flex-1 bg-primary text-white py-4 rounded-full text-sm font-semibold hover:bg-primary-hover transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="p-4 border border-gray-200 rounded-full hover:border-black transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Description Accordion */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-black">Description & Fit</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${showDescription ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDescription && (
                <div className="px-5 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  {product.material && (
                    <p className="text-gray-600 text-sm mt-3">
                      <span className="font-medium text-black">Material:</span> {product.material}
                    </p>
                  )}
                  {product.care_instructions && (
                    <p className="text-gray-600 text-sm mt-2">
                      <span className="font-medium text-black">Care:</span> {product.care_instructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowShipping(!showShipping)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-black">Shipping & Returns</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${showShipping ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showShipping && (
                <div className="px-5 pb-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">Free Delivery</p>
                      <p className="text-xs text-gray-500">On orders above ₹999</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Available across India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">Easy Returns</p>
                      <p className="text-xs text-gray-500">30 day return policy</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
