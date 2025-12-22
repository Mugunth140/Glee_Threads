export async function compressImage(file: File, maxSizeMB: number = 2.5): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = (e) => reject(e);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if too massive to save memory
      const MAX_DIMENSION = 2000; 
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Start with quality 0.8 and go down if needed, 
      // but for this simple implementation we'll just pick a reasonable default
      // that usually yields good compression for PNG/JPEG
      const quality = 0.7; 
      
      // If original was PNG, we might want to keep it PNG for transparency
      // But PNG compression in canvas is not quality-adjustable in standard toBlob
      // So if it's large, we might have to convert to JPEG (losing transparency) 
      // OR just accept standard PNG compression.
      // However, for T-shirt designs, transparency is KEY. 
      // We cannot convert PNG to JPEG as it will have a white/black background.
      
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          // If the compressed blob is actually bigger (rare but possible with PNGs), return original
          if (blob.size > file.size) {
            resolve(file);
          } else {
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        },
        mimeType,
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}
