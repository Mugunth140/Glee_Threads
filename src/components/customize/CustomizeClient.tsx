'use client';

import TShirtOutline from '@/components/TShirtOutline';
import { compressImage } from '@/lib/image-compression';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { useRef, useState } from 'react';

const COLORS = [
  { name: 'White', hex: '#ffffff', class: 'bg-white border-gray-200' },
  { name: 'Black', hex: '#171717', class: 'bg-neutral-900 border-neutral-900' },
  { name: 'Red', hex: '#E63946', class: 'bg-primary border-primary' },
  { name: 'Blue', hex: '#3b82f6', class: 'bg-blue-500 border-blue-500' },
  { name: 'Grey', hex: '#6b7280', class: 'bg-gray-500 border-gray-500' },
  { name: 'Yellow', hex: '#FBBF24', class: 'bg-yellow-400 border-yellow-400' },
  { name: 'Green', hex: '#10B981', class: 'bg-emerald-500 border-emerald-500' },
  { name: 'Purple', hex: '#8B5CF6', class: 'bg-violet-500 border-violet-500' },
  { name: 'Pink', hex: '#EC4899', class: 'bg-pink-500 border-pink-500' },
  { name: 'Orange', hex: '#F97316', class: 'bg-orange-500 border-orange-500' },
  { name: 'Navy', hex: '#1E3A8A', class: 'bg-blue-900 border-blue-900' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function CustomizeClient() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('M');

  // Front Image State
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [isUploadingFront, setIsUploadingFront] = useState(false);

  // Back Image State
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  // Instructions State
  const [instructions, setInstructions] = useState('');

  // Preview View State (front or back)
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    file: File,
    side: 'front' | 'back'
  ) => {
    if (file.type !== 'image/png') {
      showToast('Only PNG images are allowed', { type: 'error' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (side === 'front') {
      setFrontPreview(objectUrl);
      setFrontImageUrl(null);
      setIsUploadingFront(true);
    } else {
      setBackPreview(objectUrl);
      setBackImageUrl(null);
      setIsUploadingBack(true);
    }

    try {
      let fileToUpload = file;

      if (file.size > 2.5 * 1024 * 1024) {
        showToast('Compressing image...', { type: 'info' });
        try {
          fileToUpload = await compressImage(file, 2.5);
        } catch (compError) {
          console.warn('Compression failed, trying original file', compError);
        }
      }

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(fileToUpload.name)}`, {
        method: 'POST',
        body: fileToUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const blob = await response.json();

      if (side === 'front') {
        setFrontImageUrl(blob.url);
      } else {
        setBackImageUrl(blob.url);
      }
      showToast(`${side === 'front' ? 'Front' : 'Back'} image uploaded successfully`, { type: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image. Please try again.', { type: 'error' });
      if (side === 'front') {
        setFrontPreview(null);
      } else {
        setBackPreview(null);
      }
    } finally {
      if (side === 'front') {
        setIsUploadingFront(false);
      } else {
        setIsUploadingBack(false);
      }
    }
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, 'front');
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, 'back');
  };

  const handleAddToCart = () => {
    if (!frontImageUrl && !backImageUrl) {
      if ((frontPreview && !frontImageUrl) || (backPreview && !backImageUrl)) {
        showToast('Please wait for image uploads to complete', { type: 'error' });
        return;
      }
      showToast('Please upload at least one design image', { type: 'error' });
      return;
    }

    setIsAddingToCart(true);
    try {
      const customDraft = {
        product: {
          id: -1,
          name: 'Custom T-Shirt Design',
          price: 1000,
          image_url: frontImageUrl || backImageUrl || '/glee_logo.png',
        },
        quantity: 1,
        size_name: selectedSize,
        color: selectedColor.name,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        instructions: instructions,
      };

      localStorage.setItem('glee_custom_draft', JSON.stringify(customDraft));
      window.location.href = '/checkout/custom';

    } catch (error) {
      console.error(error);
      showToast('Failed to proceed to checkout', { type: 'error' });
      setIsAddingToCart(false);
    }
  };

  const currentPreview = viewSide === 'front' ? frontPreview : backPreview;
  const hasAnyImage = frontPreview || backPreview;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-8 text-center">Design Your Own Tee</h1>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 items-start">
          {/* Preview Area */}
          <div className="bg-gray-50 rounded-3xl p-6 lg:p-12 flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-[600px] lg:sticky top-24 overflow-hidden mb-10 lg:mb-0 shadow-inner">
            {/* Flip Button */}
            {hasAnyImage && (
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => setViewSide('front')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${viewSide === 'front'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-black'
                    }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setViewSide('back')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${viewSide === 'back'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-black'
                    }`}
                >
                  Back
                </button>
              </div>
            )}

            <div className="relative w-full max-w-[300px] md:max-w-md aspect-square">
              {/* T-Shirt SVG */}
              <TShirtOutline color={selectedColor.hex} className="w-full h-full drop-shadow-2xl" />

              {/* Design Overlay */}
              <div className="absolute top-[25%] left-[25%] w-[50%] h-[40%] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                {currentPreview && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={currentPreview}
                      alt={`${viewSide} Design`}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Hint text if empty */}
              {!hasAnyImage && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-gray-400 text-xs font-bold border-2 border-dashed border-gray-300 rounded-xl p-4 whitespace-nowrap bg-white/50 backdrop-blur-sm">
                  YOUR DESIGN HERE
                </div>
              )}
            </div>

            {/* Side indicator */}
            {hasAnyImage && (
              <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Viewing: {viewSide} side
              </p>
            )}
          </div>

          {/* Controls Area */}
          <div className="space-y-10 mt-12 lg:mt-0 relative z-10">
            {/* 1. Choose Color */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">01</span>
                CHOOSE COLOR
              </h3>
              <div className="flex gap-2.5 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${selectedColor.name === color.name
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-110'
                      }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* 2. Choose Size */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">02</span>
                SELECT SIZE
              </h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-9 rounded-lg text-xs font-bold transition-all ${selectedSize === size
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-black hover:text-black'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Upload Front Image */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">03</span>
                FRONT DESIGN
              </h3>
              <div
                onClick={() => frontInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${frontPreview
                  ? 'border-green-500 bg-green-50/30'
                  : 'border-gray-200 hover:border-black hover:bg-gray-50'
                  }`}
              >
                <input
                  type="file"
                  ref={frontInputRef}
                  onChange={handleFrontFileChange}
                  accept="image/png"
                  className="hidden"
                />

                {isUploadingFront ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[10px] font-bold text-gray-500">UPLOADING...</p>
                  </div>
                ) : frontPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={frontPreview} alt="Front preview" width={48} height={48} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-black uppercase tracking-tight">Front Image Ready</p>
                      <p className="text-[10px] text-gray-400 underline">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upload Front PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Upload Back Image */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">04</span>
                BACK DESIGN
              </h3>
              <div
                onClick={() => backInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${backPreview
                  ? 'border-green-500 bg-green-50/30'
                  : 'border-gray-200 hover:border-black hover:bg-gray-50'
                  }`}
              >
                <input
                  type="file"
                  ref={backInputRef}
                  onChange={handleBackFileChange}
                  accept="image/png"
                  className="hidden"
                />

                {isUploadingBack ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[10px] font-bold text-gray-500">UPLOADING...</p>
                  </div>
                ) : backPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={backPreview} alt="Back preview" width={48} height={48} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-black uppercase tracking-tight">Back Image Ready</p>
                      <p className="text-[10px] text-gray-400 underline">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upload Back PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Design Instructions */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">05</span>
                DESIGN INSTRUCTIONS
              </h3>
              <textarea
                placeholder="Describe how you want your t-shirt to look. Include details like image placement, sizing, any text you want added, special effects, etc."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-sm text-black placeholder:text-gray-400 resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-2">
                The more detail you provide, the better we can create your perfect design!
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500">Starting at</p>
                <p className="text-3xl font-bold text-black">₹1,000*</p>
                <p className="text-[10px] text-gray-400 mt-1 italic leading-tight max-w-full sm:max-w-[140px]">
                  *Price may vary based on final design complexity.
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={(!frontImageUrl && !backImageUrl) || isAddingToCart}
                className="w-full sm:w-auto sm:flex-1 sm:max-w-[180px] bg-primary text-white py-3.5 rounded-full text-base font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
              >
                {isAddingToCart ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
