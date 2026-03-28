// diamond-frontend/src/components/products/DiamondCard.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, ArrowLeftRight, Loader } from 'lucide-react';
import { formatPrice, formatCarat, getCutBadge, getColorBadge } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import { useComparisonStore } from '../../store/useComparisonStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUserStore } from '../../store/useUserStore';
import axios from 'axios';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const DiamondCard = ({ diamond }) => {
  const navigate = useNavigate();
  const { isFavoriteDiamond, addDiamond, removeDiamond } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { token, isAuthenticated } = useUserStore();
  const { addDiamond: addToComparison } = useComparisonStore();
  const { selectDiamond } = useConfiguratorStore();

  // State for real-time price calculation
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    calculateRealPrice();
  }, [diamond.diamond_id]);

  const calculateRealPrice = async () => {
    try {
      setLoadingPrice(true);
      const response = await axios.post(
        `${API_BASE_URL}/pricing/calculate-diamond-price/`,
        { diamond_id: diamond.diamond_id }
      );
      if (response.data.success) {
        setCalculatedPrice(response.data.calculated_price);
        setPricingInfo({
          qualityMultiplier: response.data.quality_multiplier,
          clarityAdjustment: response.data.clarity_adjustment,
          sizePremium: response.data.size_premium,
        });
      }
    } catch (error) {
      setCalculatedPrice(parseFloat(diamond.base_price));
    } finally {
      setLoadingPrice(false);
    }
  };

  // ── Favorite toggle — calls store methods directly ────────────
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      navigate('/login');
      return;
    }

    if (isFavoriteDiamond(diamond.diamond_id)) {
      const result = await removeDiamond(diamond.diamond_id);
      if (result?.success !== false) {
        toast.success('Removed from favorites');
      } else {
        toast.error(result.error || 'Failed to remove');
      }
    } else {
      const result = await addDiamond(diamond);
      if (result?.success !== false) {
        toast.success('Added to favorites');
      } else {
        toast.error(result.error || 'Failed to add');
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      type: 'diamond',
      diamond_id: diamond.diamond_id,
      total_price: calculatedPrice || parseFloat(diamond.base_price),
      ...diamond,
    });
    toast.success('Added to cart');
  };

  const handleBuildRing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectDiamond(diamond);
    navigate('/configurator');
    toast.success('Diamond selected! Now choose a setting.');
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToComparison(diamond);
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

  const displayPrice = calculatedPrice || parseFloat(diamond.base_price);
  const isLiked = isFavoriteDiamond(diamond.diamond_id);

  return (
    <Link
      to={`/diamonds/${diamond.diamond_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Diamond Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-300 via-blue-200 to-cyan-200 rounded-full opacity-60 group-hover:scale-110 transition-transform duration-500 blur-sm" />
          <div className="absolute w-24 h-24 bg-white rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCompare}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
            title="Add to comparison"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/diamonds/${diamond.diamond_id}`);
            }}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
            title="View details"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Availability Badge */}
        {!diamond.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Carat & Shape */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {formatCarat(diamond.carat)} {diamond.shape}
          </h3>
          <span className="text-xs font-medium text-gray-500">{diamond.sku}</span>
        </div>

        {/* 4Cs Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Cut</p>
            <p className="font-semibold text-gray-900">{diamond.cut}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Color</p>
            <p className="font-semibold text-gray-900">{diamond.color}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Clarity</p>
            <p className="font-semibold text-gray-900">{diamond.clarity}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Cert</p>
            <p className="font-semibold text-gray-900">{diamond.certificate_type || 'GIA'}</p>
          </div>
        </div>

        {/* Price Section */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Price (With Quality Adjustment)</p>
              {loadingPrice ? (
                <div className="flex items-center gap-1">
                  <Loader className="h-4 w-4 animate-spin text-primary-600" />
                  <span className="text-sm text-gray-600">Calculating...</span>
                </div>
              ) : (
                <p className="text-xl font-bold text-primary-600">
                  {formatPrice(displayPrice)}
                </p>
              )}
            </div>
          </div>

          {pricingInfo && !loadingPrice && (
            <div className="bg-blue-50 rounded-lg p-2 text-xs space-y-1 border border-blue-100">
              <div className="flex justify-between">
                <span className="text-blue-700">Quality Factor:</span>
                <span className="font-semibold text-blue-900">
                  {pricingInfo.qualityMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Clarity Adj:</span>
                <span className="font-semibold text-blue-900">
                  {pricingInfo.clarityAdjustment.toFixed(2)}x
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={!diamond.is_available || loadingPrice}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </Button>

        <Button
          onClick={handleBuildRing}
          className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
        >
          🔨 Build Ring
        </Button>
      </div>
    </Link>
  );
};

export default DiamondCard;