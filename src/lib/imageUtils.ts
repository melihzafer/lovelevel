/**
 * Compress an image file to a target size (max bytes)
 * @param file - Original image file
 * @param maxSizeKB - Maximum size in kilobytes (default: 1024 KB = 1 MB)
 * @returns Compressed image as File
 */
export async function compressImage(file: File, maxSizeKB = 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Max width/height

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality adjustment
        const quality = 0.9;
        const maxSize = maxSizeKB * 1024;

        const tryCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If size is acceptable or quality is already low, resolve
              if (blob.size <= maxSize || q <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                tryCompress(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };

        tryCompress(quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
