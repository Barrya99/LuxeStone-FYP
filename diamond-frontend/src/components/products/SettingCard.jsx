// src/components/products/SettingCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import { useComparisonStore } from '../../store/useComparisonStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SettingCard = ({ setting }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { addSetting } = useComparisonStore();

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favoriteItem = {
      id: setting.setting_id,
      type: 'setting',
      ...setting,
    };

    if (isFavorite(setting.setting_id)) {
      removeFavorite(setting.setting_id);
      toast.success('Removed from favorites');
    } else {
      addFavorite(favoriteItem);
      toast.success('Added to favorites');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      type: 'setting',
      setting_id: setting.setting_id,
      total_price: setting.base_price,
      ...setting,
    });
    toast.success('Added to cart');
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = addSetting(setting);
    if (success) {
      toast.success('Added to comparison');
      navigate('/comparison');
    } else {
      const { settings } = useComparisonStore.getState();
      if (settings.some(s => s.setting_id === setting.setting_id)) {
        toast.error('Already in comparison');
      } else if (settings.length >= 3) {
        toast.error('Maximum 3 items can be compared');
      } else {
        toast.error('Cannot add to comparison');
      }
    }
  };

  return (
    <Link
      to={`/settings/${setting.setting_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
        {/* Placeholder Setting Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-200 via-yellow-200 to-gold-400 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">💍</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(setting.setting_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            title="Add to favorites"
          >
            <Heart className={`h-5 w-5 ${isFavorite(setting.setting_id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white rounded-full transition-all"
            title="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
            {setting.style_type}
          </span>
          {setting.popularity_score > 80 && (
            <span className="px-3 py-1 bg-gold-500 text-white text-xs font-medium rounded-full">
              Popular
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {setting.name}
        </h3>

        {/* Attributes */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {setting.metal_type}
          </span>
          {setting.min_carat && setting.max_carat && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              {setting.min_carat}-{setting.max_carat}ct
            </span>
          )}
        </div>

        {/* Description */}
        {setting.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {setting.description}
          </p>
        )}

        {/* Price & CTA */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(setting.base_price)}
              </div>
              <div className="text-xs text-gray-500">Setting only</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              fullWidth 
              title="Compare"
              onClick={handleCompare}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare
            </Button>
            <Button size="sm" fullWidth className="group/btn">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SettingCard;