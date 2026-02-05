import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { formatPrice, formatCarat, getCutBadge, getColorBadge } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import { useComparisonStore } from '../../store/useComparisonStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const DiamondCard = ({ diamond }) => {
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { addDiamond } = useComparisonStore();

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favoriteItem = {
      id: diamond.diamond_id,
      type: 'diamond',
      ...diamond,
    };

    if (isFavorite(diamond.diamond_id)) {
      removeFavorite(diamond.diamond_id);
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
      type: 'diamond',
      diamond_id: diamond.diamond_id,
      total_price: diamond.base_price,
      ...diamond,
    });
    toast.success('Added to cart');
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = addDiamond(diamond);
    if (success) {
      toast.success('Added to comparison');
      navigate('/comparison');
    } else {
      const { diamonds } = useComparisonStore.getState();
      if (diamonds.some(d => d.diamond_id === diamond.diamond_id)) {
        toast.error('Already in comparison');
      } else if (diamonds.length >= 3) {
        toast.error('Maximum 3 items can be compared');
      } else {
        toast.error('Cannot add to comparison');
      }
    }
  };

  return (
    <Link
      to={`/diamonds/${diamond.diamond_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Placeholder Diamond Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-200 via-blue-200 to-purple-200 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">💎</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(diamond.diamond_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            title="Add to favorites"
          >
            <Heart className={`h-5 w-5 ${isFavorite(diamond.diamond_id) ? 'fill-current' : ''}`} />
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
          <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
            {diamond.shape}
          </span>
          {diamond.certificate_type && (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              {diamond.certificate_type}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {formatCarat(diamond.carat)} {diamond.shape} Diamond
        </h3>

        {/* 4Cs Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getCutBadge(diamond.cut)}`}>
            {diamond.cut}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getColorBadge(diamond.color)}`}>
            Color: {diamond.color}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            {diamond.clarity}
          </span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Table:</span>
            <span className="ml-1 font-medium text-gray-900">
              {diamond.table_percent ? `${diamond.table_percent}%` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Depth:</span>
            <span className="ml-1 font-medium text-gray-900">
              {diamond.depth_percent ? `${diamond.depth_percent}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(diamond.base_price)}
              </div>
              <div className="text-xs text-gray-500">Lab-Grown</div>
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

export default DiamondCard;