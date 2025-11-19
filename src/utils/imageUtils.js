import DIMENSIONS from './dimensions-config';

/**
 * Check if image dimensions match platform requirements
 * @param {File} file - Image file
 * @param {string} platform - Platform name
 * @param {string} type - Image type
 * @returns {Promise<{isValid: boolean, actual: {width: number, height: number}, required: {width: number, height: number}}>}
 */
export const validateImageDimensions = async (file, platform, type) => {
  if (!file || !platform || !type || !DIMENSIONS[platform] || !DIMENSIONS[platform][type]) {
    return { isValid: false, actual: {}, required: {} };
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const [requiredWidth, requiredHeight] = DIMENSIONS[platform][type];
      const isValid = img.width === requiredWidth && img.height === requiredHeight;
      
      resolve({
        isValid,
        actual: {
          width: img.width,
          height: img.height
        },
        required: {
          width: requiredWidth,
          height: requiredHeight
        }
      });
    };
    
    img.onerror = () => {
      resolve({
        isValid: false,
        actual: {},
        required: {}
      });
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Auto-resize image to match platform requirements
 * @param {File} file - Image file
 * @param {string} platform - Platform name
 * @param {string} type - Image type
 * @returns {Promise<File>} - Resized image file
 */
export const autoResizeImage = async (file, platform, type) => {
  if (!file || !platform || !type || !DIMENSIONS[platform] || !DIMENSIONS[platform][type]) {
    return file;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const [requiredWidth, requiredHeight] = DIMENSIONS[platform][type];
      
      // If dimensions already match, return original file
      if (img.width === requiredWidth && img.height === requiredHeight) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = requiredWidth;
      canvas.height = requiredHeight;
      
      // Draw image with cover positioning (center crop)
      const ctx = canvas.getContext('2d');
      
      // Calculate scaling and positioning for "cover" behavior
      const scale = Math.max(
        requiredWidth / img.width,
        requiredHeight / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      const offsetX = (requiredWidth - scaledWidth) / 2;
      const offsetY = (requiredHeight - scaledHeight) / 2;
      
      // Draw image centered
      ctx.drawImage(
        img,
        offsetX, offsetY,
        scaledWidth, scaledHeight
      );
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          // Clean up object URL
          URL.revokeObjectURL(img.src);
          
          // Create new file from blob
          const resizedFile = new File(
            [blob],
            file.name,
            { type: file.type }
          );
          
          resolve(resizedFile);
        },
        file.type
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(file); // Return original on error
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if aspect ratio is valid for Instagram
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean} - Whether the aspect ratio is valid
 */
export const isValidInstagramAspectRatio = (width, height) => {
  if (!width || !height) return false;
  
  const ratio = width / height;
  
  // Instagram allows aspect ratios from 4:5 (0.8) to 1.91:1 (1.91)
  return ratio >= 0.8 && ratio <= 1.91;
};

/**
 * Check if aspect ratio is valid for specific platform
 * @param {string} platform - Platform name
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean} - Whether the aspect ratio is valid
 */
export const isValidAspectRatio = (platform, width, height) => {
  if (!width || !height) return false;
  
  const ratio = width / height;
  
  switch (platform) {
    case 'instagram':
      return ratio >= 0.8 && ratio <= 1.91;
    case 'facebook':
      return ratio >= 0.5 && ratio <= 2.0;
    case 'linkedin':
      return ratio >= 0.75 && ratio <= 2.0;
    case 'youtube':
      return true; // YouTube is flexible
    case 'twitter':
      return ratio >= 0.5 && ratio <= 2.0;
    default:
      return true;
  }
};

/**
 * Get optimal image type based on dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} platform - Platform name
 * @returns {string} - Optimal image type
 */
export const getOptimalImageType = (width, height, platform) => {
  if (!width || !height || !platform) return 'square';
  
  const ratio = width / height;
  
  // Common aspect ratios
  const isSquare = Math.abs(ratio - 1) < 0.05;
  const isVertical = ratio < 0.9;
  const isHorizontal = ratio > 1.1;
  
  switch (platform) {
    case 'instagram':
      if (isSquare) return 'square';
      if (isVertical) return 'vertical';
      if (isHorizontal) return 'landscape';
      return 'square';
      
    case 'facebook':
      if (isSquare) return 'square';
      if (isVertical) return 'portrait';
      if (isHorizontal) return 'landscape';
      return 'square';
      
    case 'linkedin':
      if (isSquare) return 'square';
      if (isVertical) return 'portrait';
      if (isHorizontal) return 'horizontal';
      return 'square';
      
    case 'youtube':
      if (isVertical && ratio < 0.6) return 'shorts';
      if (isHorizontal && Math.abs(ratio - 1.78) < 0.1) return 'full';
      return 'image';
      
    case 'twitter':
      if (isSquare) return 'square';
      return 'standard';
      
    default:
      return 'square';
  }
};
