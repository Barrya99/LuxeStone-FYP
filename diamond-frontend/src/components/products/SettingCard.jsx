// diamond-frontend/src/components/products/SettingCard.jsx - FIXED

import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import { useComparisonStore } from '../../store/useComparisonStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SettingCard = ({ setting }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { addSetting } = useComparisonStore();
  
  // FIXED: Get reset function to reset configurator state
  const { reset: resetConfigurator } = useConfiguratorStore();

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

  // FIXED: Build ring now starts from Step 1, not Step 3
  const handleBuildRing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset configurator to start fresh
    resetConfigurator();
    
    // Navigate to configurator (starts at Step 1)
    navigate('/configurator');
    
    // Info toast
    toast.success('Let\'s build a ring! Start by selecting a diamond.');
  };

  return (
    <Link
      to={`/settings/${setting.setting_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
        {/* Setting Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 rounded-full opacity-60 group-hover:scale-110 transition-transform duration-500 blur-sm" />
          <div className="absolute w-20 h-20 bg-white rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(setting.setting_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            title={isFavorite(setting.setting_id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite(setting.setting_id) ? 'fill-current' : ''
              }`}
            />
          </button>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
            title="Add to comparison"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          {/* View Detail */}
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/settings/${setting.setting_id}`);
            }}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
            title="View details"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name & Type */}
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {setting.name}
          </h3>
          <p className="text-xs text-gray-500">
            {setting.style_type} • {setting.metal_type}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Style</p>
            <p className="font-semibold text-gray-900">{setting.style_type}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Metal</p>
            <p className="font-semibold text-gray-900">{setting.metal_type}</p>
          </div>
        </div>

        {/* Price */}
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 mb-1">Setting Price</p>
          <p className="text-xl font-bold text-primary-600">
            {formatPrice(setting.base_price)}
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          {/* Build Ring Button - FIXED */}
          <Button
            onClick={handleBuildRing}
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            🔨 Build Your Ring
          </Button>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default SettingCard;