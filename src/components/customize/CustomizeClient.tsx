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

const FONTS = [
  { name: 'Modern', class: 'font-sans' },
  { name: 'Classic', class: 'font-serif' },
  { name: 'Mono', class: 'font-mono' },
  { name: 'Bold', class: 'font-extrabold' },
];

export default function CustomizeClient() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // The final URL for the cart
  const [previewImage, setPreviewImage] = useState<string | null>(null); // The local preview
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Image Adjustment State
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      showToast('Only PNG images are allowed', { type: 'error' });
      return;
    }

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setUploadedImage(null); // Reset previous upload
    setImgScale(1); // Reset adjustments
    setImgPos({ x: 0, y: 0 });
    setIsUploading(true);

    try {
      let fileToUpload = file;

      // Compress if larger than 2.5MB
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
      setUploadedImage(blob.url);
      showToast('Image uploaded successfully', { type: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image. Please try again.', { type: 'error' });
      setPreviewImage(null); // Clear preview on failure
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (!uploadedImage && !customText) {
      // If we have a preview but no uploadedImage, it means upload is still in progress or failed
      if (previewImage && !uploadedImage) {
        showToast('Please wait for the image upload to complete', { type: 'error' });
        return;
      }
      showToast('Please add a design or text first', { type: 'error' });
      return;
    }

    setIsAddingToCart(true);
    try {
      // Create a draft object for the custom order
      const customDraft = {
        product: {
          id: -1,
          name: `Custom Tee (${customText ? 'Text: ' + customText : 'Graphic Only'})`,
          price: 1000, // Base price for custom orders
          image_url: uploadedImage || '/glee_logo.png',
        },
        quantity: 1,
        size_name: selectedSize,
        color: selectedColor.name,
        custom_image_url: uploadedImage,
        custom_text: customText,
        custom_options: {
          scale: imgScale,
          position: imgPos,
          font: selectedFont.name,
          text_color: textColor
        }
      };

      // Save to localStorage
      localStorage.setItem('glee_custom_draft', JSON.stringify(customDraft));

      // Redirect to the custom checkout page
      window.location.href = '/checkout/custom';

    } catch (error) {
      console.error(error);
      showToast('Failed to proceed to checkout', { type: 'error' });
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-8 text-center">Design Your Own Tee</h1>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 items-start">
          {/* Preview Area */}
          <div className="bg-gray-50 rounded-3xl p-6 lg:p-12 flex items-center justify-center relative min-h-[400px] lg:min-h-[600px] lg:sticky top-24 overflow-hidden mb-10 lg:mb-0 shadow-inner">
            <div className="relative w-full max-w-[300px] md:max-w-md aspect-square">
              {/* T-Shirt SVG */}
              <TShirtOutline color={selectedColor.hex} className="w-full h-full drop-shadow-2xl" />

              {/* Design Overlay */}
              <div className="absolute top-[25%] left-[25%] w-[50%] h-[40%] flex flex-col items-center justify-center gap-4 pointer-events-none overflow-hidden">
                {previewImage && (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center"
                    style={{
                      transform: `translate(${imgPos.x}px, ${imgPos.y}px) scale(${imgScale})`
                    }}
                  >
                    <Image
                      src={previewImage}
                      alt="Custom Design"
                      width={200}
                      height={200}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                )}
                {customText && (
                  <div
                    className={`text-center break-words w-full px-2 ${selectedFont.class}`}
                    style={{ color: textColor, fontSize: '1.2rem', lineHeight: '1.2' }}
                  >
                    {customText}
                  </div>
                )}
              </div>

              {/* Hint text if empty */}
              {!previewImage && !customText && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-gray-400 text-xs font-bold border-2 border-dashed border-gray-300 rounded-xl p-4 whitespace-nowrap bg-white/50 backdrop-blur-sm">
                  YOUR DESIGN HERE
                </div>
              )}
            </div>
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

            {/* 3. Add Custom Text */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">03</span>
                CUSTOM TEXT
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Type something..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black text-sm text-black placeholder:text-gray-400"
                />

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex gap-1.5">
                    {['#000000', '#ffffff', '#E63946', '#3b82f6', '#10b981'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setTextColor(c)}
                        className={`w-6 h-6 rounded-full border border-gray-200 transition-transform ${textColor === c ? 'scale-125 ring-1 ring-black' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
                  <div className="flex gap-1.5 flex-wrap">
                    {FONTS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFont(f)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter transition-all ${selectedFont.name === f.name ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Upload Design */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">04</span>
                UPLOAD GRAPHIC
              </h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${previewImage
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-gray-200 hover:border-black hover:bg-gray-50'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png"
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[10px] font-bold text-gray-500">UPLOADING...</p>
                  </div>
                ) : previewImage ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-black uppercase tracking-tight">Image Ready</p>
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
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upload PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Adjust Graphic */}
            {previewImage && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[9px] flex items-center justify-center shrink-0 font-mono">05</span>
                  ADJUST GRAPHIC
                </h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                  {/* Zoom Control */}
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                      <span>Zoom</span>
                      <span>{Math.round(imgScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.05"
                      value={imgScale}
                      onChange={(e) => setImgScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Horizontal Position */}
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                      <span>Horizontal</span>
                      <span>{imgPos.x}px</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={imgPos.x}
                      onChange={(e) => setImgPos(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Vertical Position */}
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                      <span>Vertical</span>
                      <span>{imgPos.y}px</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={imgPos.y}
                      onChange={(e) => setImgPos(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              </div>
            )}

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
                disabled={(!previewImage && !customText) || isAddingToCart}
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
