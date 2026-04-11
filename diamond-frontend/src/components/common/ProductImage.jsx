import { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

/**
 * ProductImage - Displays product images with fallback handling
 * 
 * Features:
 * - Handles local and external URLs
 * - Routes external URLs through backend proxy (bypasses CORS)
 * - Error state with placeholder
 * - Loading state
 * - Responsive sizing
 */
const ProductImage = ({ 
  src, 
  alt = 'Product image',
  className = '',
  fallbackIcon = null,
  type = 'diamond' // 'diamond' or 'setting' for different fallbacks
}) => {
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error
  const [error, setError] = useState(null);

  // Check if URL is external (needs proxy)
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Build proxy URL for external images
  const getProxiedUrl = (url) => {
    if (!isExternalUrl(url)) {
      return url; // Local images don't need proxy
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    const encodedUrl = encodeURIComponent(url);
    return `${API_BASE_URL}/images/proxy/?url=${encodedUrl}`;
  };

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = (e) => {
    console.warn(`[ProductImage] Failed to load image: ${src}`);
    setImageState('error');
    setError(e);
  };

  // Diamond placeholder - shiny gradient
  const DiamondPlaceholder = () => (
    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <div className="w-32 h-32 bg-gradient-to-br from-blue-300 via-blue-200 to-cyan-200 rounded-full opacity-60 blur-sm" />
      <div className="absolute w-24 h-24 bg-white rounded-full opacity-40" />
    </div>
  );

  // Setting placeholder - detailed architecture style
  const SettingPlaceholder = () => (
    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <svg className="w-24 h-24 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="8" r="3" />
        <path d="M12 11v4M8 15h8M7 19h10" />
        <circle cx="12" cy="12" r="10" strokeWidth="0.5" opacity="0.2" />
      </svg>
    </div>
  );

  // Error state
  const ErrorPlaceholder = () => (
    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 ${className}`}>
      <AlertCircle className="w-12 h-12 text-red-300 mb-2" />
      <p className="text-xs text-red-600 text-center px-2">Image unavailable</p>
    </div>
  );

  // Get final image URL (proxied if needed)
  const finalImageUrl = src ? getProxiedUrl(src) : null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* If we have a URL and haven't errored, try to load it */}
      {finalImageUrl && imageState !== 'error' ? (
        <>
          {/* Loading state */}
          {imageState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Actual image */}
          <img
            src={finalImageUrl}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-full object-cover"
          />
        </>
      ) : (
        <>
          {/* No URL provided or error occurred */}
          {imageState === 'error' ? (
            <ErrorPlaceholder />
          ) : type === 'setting' ? (
            <SettingPlaceholder />
          ) : (
            <DiamondPlaceholder />
          )}
        </>
      )}
    </div>
  );
};

export default ProductImage;
