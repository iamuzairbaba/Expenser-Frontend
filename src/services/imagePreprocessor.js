/**
 * preprocessImage
 * Converts an image File/Blob into a preprocessed canvas data URL
 * optimised for Tesseract OCR accuracy.
 *
 * Pipeline:
 *  1. Resize to max 2000px (keeps aspect ratio, reduces memory)
 *  2. Grayscale
 *  3. Contrast + brightness boost
 *  4. Sharpen (convolution kernel)
 *  5. Binarise (adaptive threshold via histogram)
 */
export async function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const MAX = 2000;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Step 1: Grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
        }

        // Step 2: Contrast stretch (histogram min/max)
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < min) min = data[i];
          if (data[i] > max) max = data[i];
        }
        const range = max - min || 1;
        for (let i = 0; i < data.length; i += 4) {
          const stretched = Math.round(((data[i] - min) / range) * 255);
          data[i] = data[i + 1] = data[i + 2] = stretched;
        }

        ctx.putImageData(imageData, 0, 0);

        // Step 3: Sharpen via convolution
        const sharpened = ctx.getImageData(0, 0, width, height);
        const src = new Uint8ClampedArray(sharpened.data);
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * width + (x + kx)) * 4;
                sum += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
              }
            }
            const outIdx = (y * width + x) * 4;
            const clamped = Math.max(0, Math.min(255, sum));
            sharpened.data[outIdx] = sharpened.data[outIdx + 1] = sharpened.data[outIdx + 2] = clamped;
          }
        }
        ctx.putImageData(sharpened, 0, 0);

        // Step 4: Binarise — Otsu threshold
        const hist = new Array(256).fill(0);
        for (let i = 0; i < sharpened.data.length; i += 4) hist[sharpened.data[i]]++;
        const total = width * height;
        let sum2 = 0;
        for (let i = 0; i < 256; i++) sum2 += i * hist[i];
        let sumB = 0, wB = 0, maxVar = 0, threshold = 128;
        for (let t = 0; t < 256; t++) {
          wB += hist[t];
          if (!wB) continue;
          const wF = total - wB;
          if (!wF) break;
          sumB += t * hist[t];
          const mB = sumB / wB;
          const mF = (sum2 - sumB) / wF;
          const variance = wB * wF * (mB - mF) ** 2;
          if (variance > maxVar) { maxVar = variance; threshold = t; }
        }

        const binary = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < binary.data.length; i += 4) {
          const v = binary.data[i] > threshold ? 255 : 0;
          binary.data[i] = binary.data[i + 1] = binary.data[i + 2] = v;
        }
        ctx.putImageData(binary, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
