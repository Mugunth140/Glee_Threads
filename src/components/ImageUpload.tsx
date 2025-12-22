'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { compressImage } from '@/lib/image-compression';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export default function ImageUpload({ value, onChange, onUploadStart, onUploadEnd }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Compressing...');
    if (onUploadStart) onUploadStart();
    
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      setUploadStatus('Uploading...');
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(compressedFile.name)}`, {
        method: 'POST',
        body: compressedFile,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const blob = await response.json();
      onChange(blob.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      setUploadStatus('');
      if (onUploadEnd) onUploadEnd();
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Upload Image
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
          {uploading && <span className="text-sm text-gray-500">{uploadStatus || 'Uploading...'}</span>}
        </div>
        
        {/* Hidden input to ensure URL is submitted if manually edited (optional) */}
        <input
          type="hidden"
          value={value}
          name="image_url"
        />
      </div>

      {/* Image Preview */}
      <div className="aspect-square rounded-lg bg-white border border-gray-100 overflow-hidden relative">
        {uploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
            <p>{uploadStatus || 'Uploading...'}</p>
          </div>
        ) : value ? (
          <>
            <Image
              src={value}
              alt="Product preview"
              width={400}
              height={400}
              className="w-full h-full object-cover"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => {
                onChange('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No image uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
