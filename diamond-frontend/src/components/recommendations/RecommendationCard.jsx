// diamond-frontend/src/components/recommendations/RecommendationCard.jsx

import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingCart } from 'lucide-react';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';

/**
 * Ultra-compact recommendation card - industry-standard size
 * Similar to Amazon/Flipkart recommendation cards
 * Size: ~180-200px wide, optimal for horizontal scrolling sections
 */
const RecommendationCard = ({ item, type = 'diamond' }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  
  // FIXED: Safely get the item ID
  const itemId = type === 'diamond' ? item?.diamond_id : item?.setting_id;
  
  // If no ID, don't render
  if (!itemId) {
    console.warn(`Missing ${type}_id for item:`, item);
    return null;
  }

  const isLiked = isFavorite(itemId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      type: type,
      [type === 'diamond' ? 'diamond_id' : 'setting_id']: itemId,
      total_price: item?.base_price || 0,
      ...item,
    });
    toast.success('Added to cart');
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFavorite(itemId);
      toast.success('Removed from favorites');
    } else {
      addFavorite({
        id: itemId,
        type: type,
        ...item,
      });
      toast.success('Added to favorites');
    }
  };

  const link = type === 'diamond' 
    ? `/diamonds/${itemId}` 
    : `/settings/${itemId}`;

  return (
    <Link
      to={link}
      className="group w-full min-w-max max-w-xs bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col"
    >
      {/* Compact Image Section - 120x120px */}
      <div className="relative w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {/* Emoji Icon */}
        <span className="text-3xl opacity-50">{type === 'diamond' ? '💎' : '👑'}</span>

        {/* Recommended Badge - Top Left */}
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
            <Sparkles className="w-3 h-3" />
          </span>
        </div>

        {/* Quick Actions - Icon Only, appear on hover */}
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={`p-1 rounded-full transition-all ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            title="Add to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-1 bg-white/90 text-gray-700 hover:bg-white rounded-full transition-all"
            title="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content - Minimal Padding */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        {/* Title - Single Line Truncated */}
        <h4 className="text-xs font-bold text-gray-900 truncate leading-tight mb-1">
          {type === 'diamond' 
            ? `${item?.carat ? formatCarat(item.carat) : 'N/A'} ${item?.shape || 'Diamond'}` 
            : item?.name || 'Setting'
          }
        </h4>

        {/* Mini Specs - 2 badges max */}
        <div className="flex gap-0.5 mb-1.5 flex-wrap">
          {type === 'diamond' ? (
            <>
              {item?.cut && (
                <span className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  {item.cut}
                </span>
              )}
              {item?.color && (
                <span className="px-1 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                  {item.color}
                </span>
              )}
            </>
          ) : (
            <>
              {item?.metal_type && (
                <span className="px-1 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                  {item.metal_type}
                </span>
              )}
              {item?.style_type && (
                <span className="px-1 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                  {item.style_type.substring(0, 5)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Price & Label */}
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {item?.base_price ? formatPrice(item.base_price) : 'Contact'}
          </p>
          <p className="text-xs text-gray-500">
            {type === 'diamond' ? 'IGI Certified' : 'Setting'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecommendationCard;