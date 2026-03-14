// diamond-frontend/src/pages/DiamondDetail.jsx - FIXED

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Share2, Sparkles, ArrowLeft, CheckCircle, 
  ArrowLeftRight, Loader
} from 'lucide-react';
import { diamondAPI, reviewAPI } from '../services/api';
import { formatPrice, formatCarat, getCutBadge, getColorBadge } from '../utils/formatters';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { useComparisonStore } from '../store/useComparisonStore';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';

const DiamondDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diamond, setDiamond] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  
  // FIXED: State for calculated price
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { selectDiamond, reset: resetConfigurator } = useConfiguratorStore();
  const { addDiamond } = useComparisonStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchDiamond();
    fetchReviews();
  }, [id]);

  const fetchDiamond = async () => {
    try {
      setLoading(true);
      const response = await diamondAPI.getById(id);
      setDiamond(response.data);
      
      // FIXED: Calculate real price
      calculatePrice(response.data);
    } catch (error) {
      console.error('Error fetching diamond:', error);
      toast.error('Diamond not found');
      navigate('/diamonds');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Calculate real price
  const calculatePrice = async (diamondData) => {
    try {
      setPricingLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/pricing/calculate-diamond-price/`,
        { diamond_id: diamondData.diamond_id }
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
      console.error('Error calculating price:', error);
      // Fallback to base price
      setCalculatedPrice(parseFloat(diamondData.base_price));
    } finally {
      setPricingLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews({ diamond_id: id });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite(diamond.diamond_id)) {
      removeFavorite(diamond.diamond_id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({ id: diamond.diamond_id, type: 'diamond', ...diamond });
      toast.success('Added to favorites');
    }
  };

  const handleAddToCart = () => {
    const displayPrice = calculatedPrice || parseFloat(diamond.base_price);
    addItem({
      type: 'diamond',
      diamond_id: diamond.diamond_id,
      total_price: displayPrice,
      ...diamond,
    });
    toast.success('Added to cart');
  };

  const handleBuildRing = () => {
    resetConfigurator();
    selectDiamond(diamond);
    navigate('/configurator');
    toast.success('Diamond selected! Now choose a setting.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleCompare = () => {
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

  if (loading) return <Loading fullScreen />;
  if (!diamond) return null;

  const displayPrice = calculatedPrice || parseFloat(diamond.base_price);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/diamonds" className="text-gray-500 hover:text-gray-700">Diamonds</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{diamond.sku}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/diamonds"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Diamonds
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image */}
          <div className="sticky top-24 self-start">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-300 via-blue-200 to-cyan-200 rounded-full opacity-50 blur-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {formatCarat(diamond.carat)} {diamond.shape}
                  </h1>
                  <p className="text-gray-600">SKU: {diamond.sku}</p>
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full ${
                    isFavorite(diamond.diamond_id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-all`}
                >
                  <Heart className={`h-6 w-6 ${isFavorite(diamond.diamond_id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* FIXED: Price Section - Show Calculated Price */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
              <p className="text-sm text-gray-600 mb-2">REAL PRICE (with quality adjustments)</p>
              {pricingLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="text-lg text-gray-600">Calculating...</span>
                </div>
              ) : (
                <div>
                  <p className="text-4xl font-bold text-primary-600 mb-3">
                    {formatPrice(displayPrice)}
                  </p>
                  
                  {pricingInfo && (
                    <div className="bg-white rounded-lg p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Quality Multiplier:</span>
                        <span className="font-semibold text-gray-900">
                          {pricingInfo.qualityMultiplier.toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Clarity Adjustment:</span>
                        <span className="font-semibold text-gray-900">
                          {pricingInfo.clarityAdjustment.toFixed(2)}x
                        </span>
                      </div>
                      {pricingInfo.sizePremium > 1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Size Premium:</span>
                          <span className="font-semibold text-gray-900">
                            {pricingInfo.sizePremium.toFixed(2)}x
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4Cs Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Cut</p>
                <p className="text-2xl font-bold text-gray-900">{diamond.cut}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Color</p>
                <p className="text-2xl font-bold text-gray-900">{diamond.color}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Clarity</p>
                <p className="text-2xl font-bold text-gray-900">{diamond.clarity}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Carat</p>
                <p className="text-2xl font-bold text-gray-900">{diamond.carat}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuildRing}
                className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Build Ring with This Diamond
              </Button>

              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCompare}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                  Compare
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">✓ Real Pricing Guarantee</p>
              <p>This price includes quality adjustments for cut, color, and clarity. You'll see the same price when you add this diamond to a ring.</p>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <div className="mt-16 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['specs', 'details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : tab === 'details' ? 'Details' : 'Reviews'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Diamond Specifications</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Carat Weight</dt>
                        <dd className="font-semibold text-gray-900">{diamond.carat}ct</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Cut Grade</dt>
                        <dd className="font-semibold text-gray-900">{diamond.cut}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Color Grade</dt>
                        <dd className="font-semibold text-gray-900">{diamond.color}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Clarity Grade</dt>
                        <dd className="font-semibold text-gray-900">{diamond.clarity}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Shape</dt>
                        <dd className="font-semibold text-gray-900">{diamond.shape}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Dimensions</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Length (mm)</dt>
                        <dd className="font-semibold text-gray-900">{diamond.length_mm || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Width (mm)</dt>
                        <dd className="font-semibold text-gray-900">{diamond.width_mm || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Depth (mm)</dt>
                        <dd className="font-semibold text-gray-900">{diamond.depth_mm || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Table %</dt>
                        <dd className="font-semibold text-gray-900">{diamond.table_percent || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Depth %</dt>
                        <dd className="font-semibold text-gray-900">{diamond.depth_percent || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Certificate Information</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Certificate Type</dt>
                      <dd className="font-semibold text-gray-900">{diamond.certificate_type || 'GIA'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Certificate Number</dt>
                      <dd className="font-semibold text-gray-900">{diamond.certificate_number || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Polish</dt>
                      <dd className="font-semibold text-gray-900">{diamond.polish || 'Excellent'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Symmetry</dt>
                      <dd className="font-semibold text-gray-900">{diamond.symmetry || 'Excellent'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Fluorescence</dt>
                      <dd className="font-semibold text-gray-900">{diamond.fluorescence || 'None'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.review_id} className="pb-6 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.title}</p>
                            <p className="text-sm text-gray-600">{review.user_name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondDetail;