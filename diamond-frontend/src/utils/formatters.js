// src/utils/formatters.js

/**
 * Format price to currency
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format carat with precision
 */
export const formatCarat = (carat) => {
  return `${parseFloat(carat).toFixed(2)}ct`;
};

/**
 * Get color badge class based on color grade
 */
export const getColorBadge = (color) => {
  const colorMap = {
    D: 'bg-purple-100 text-purple-800',
    E: 'bg-purple-100 text-purple-800',
    F: 'bg-blue-100 text-blue-800',
    G: 'bg-blue-100 text-blue-800',
    H: 'bg-green-100 text-green-800',
    I: 'bg-yellow-100 text-yellow-800',
    J: 'bg-yellow-100 text-yellow-800',
    K: 'bg-orange-100 text-orange-800',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800';
};

/**
 * Get cut badge class
 */
export const getCutBadge = (cut) => {
  const cutMap = {
    Excellent: 'bg-emerald-100 text-emerald-800',
    'Very Good': 'bg-blue-100 text-blue-800',
    Good: 'bg-green-100 text-green-800',
    Fair: 'bg-yellow-100 text-yellow-800',
    Poor: 'bg-red-100 text-red-800',
  };
  return cutMap[cut] || 'bg-gray-100 text-gray-800';
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || 'U';
};