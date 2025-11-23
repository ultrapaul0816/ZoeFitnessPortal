/**
 * Compresses an image file using canvas API
 * @param file - The original image file
 * @param maxSizeMB - Maximum file size in MB (default: 0.8MB)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 1920px)
 * @param quality - JPEG quality from 0-1 (default: 0.85)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 0.8,
  maxWidthOrHeight: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }
      img.src = e.target.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const maxSizeBytes = maxSizeMB * 1024 * 1024;

            // If still too large, reduce quality further
            if (blob.size > maxSizeBytes && quality > 0.5) {
              const newQuality = Math.max(0.5, quality - 0.1);
              canvas.toBlob(
                (newBlob) => {
                  if (!newBlob) {
                    reject(new Error("Failed to compress image"));
                    return;
                  }

                  const compressedFile = new File(
                    [newBlob],
                    file.name,
                    {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    }
                  );
                  resolve(compressedFile);
                },
                "image/jpeg",
                newQuality
              );
            } else {
              const compressedFile = new File(
                [blob],
                file.name,
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
