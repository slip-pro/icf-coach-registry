/**
 * ICF Registry -- Shared Utilities
 *
 * @module utils
 */

/**
 * HTML-escape a string for safe insertion into innerHTML.
 * Prevents XSS when translation strings or user data contain
 * characters that would be interpreted as HTML.
 *
 * @param {string} str
 * @returns {string}
 */
export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Downscale and re-encode an image File to a base64 JPEG.
 *
 * Coach photos are only ever displayed as a 400px Drive
 * thumbnail, so there is no reason to upload multi-megabyte
 * originals. Large files (a 4 MB phone photo becomes ~5.6 MB
 * once base64-encoded) exceed Vercel's ~4.5 MB request-body
 * limit and make the save fail. Compressing in the browser
 * keeps the payload at a few hundred KB.
 *
 * @param {File} file - The image file from a file input.
 * @param {Object} [opts]
 * @param {number} [opts.maxDimension=1000] - Max width/height in px.
 * @param {number} [opts.quality=0.85] - JPEG quality (0-1).
 * @returns {Promise<{base64: string, filename: string}>}
 *   base64 is the raw payload (no data: prefix); filename
 *   always ends in .jpg.
 */
export function compressImageToBase64(file, opts = {}) {
  const maxDimension = opts.maxDimension || 1000;
  const quality = opts.quality || 0.85;

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.split(',')[1];
      const baseName = (file.name || 'photo')
        .replace(/\.[^.]+$/, '');
      resolve({ base64, filename: `${baseName}.jpg` });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}
