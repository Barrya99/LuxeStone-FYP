// diamond-frontend/src/pages/SettingDetail.jsx - FIXED

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, Sparkles, ArrowLeft, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { settingAPI, reviewAPI } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { useComparisonStore } from '../store/useComparisonStore';
import Button from '../components/common/Button';
import ProductImage from '../components/common/ProductImage';
import Loading from '../components/common/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [setting, setSetting] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { reset: resetConfigurator } = useConfiguratorStore();
  const { addSetting } = useComparisonStore();

  useEffect(() => {
    fetchSetting();
    fetchReviews();
  }, [id]);

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const response = await settingAPI.getById(id);
      setSetting(response.data);
    } catch (error) {
      console.error('Error fetching setting:', error);
      toast.error('Setting not found');
      navigate('/settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews({ setting_id: id });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite(setting.setting_id)) {
      removeFavorite(setting.setting_id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({ id: setting.setting_id, type: 'setting', ...setting });
      toast.success('Added to favorites');
    }
  };

  const handleAddToCart = () => {
    addItem({
      type: 'setting',
      setting_id: setting.setting_id,
      total_price: setting.base_price,
      ...setting,
    });
    toast.success('Added to cart');
  };

  const handleBuildRing = () => {
    resetConfigurator();
    navigate('/configurator');
    toast.success('Let\'s build a ring! Start by selecting a diamond.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleCompare = () => {
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

  if (loading) return <Loading fullScreen />;
  if (!setting) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700">Settings</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{setting.name}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Settings
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image */}
          <div className="sticky top-24 self-start">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50">
                <ProductImage 
                  src={setting.image_url || setting.thumbnail_url}
                  alt={`${setting.name} - ${setting.sku}`}
                  type="setting"
                  className="w-full h-full"
                />
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
                    {setting.name}
                  </h1>
                  <p className="text-gray-600">
                    {setting.style_type} • {setting.metal_type}
                  </p>
                  <p className="text-gray-600">SKU: {setting.sku}</p>
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full ${
                    isFavorite(setting.setting_id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-all`}
                >
                  <Heart className={`h-6 w-6 ${isFavorite(setting.setting_id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
              <p className="text-sm text-gray-600 mb-2">SETTING PRICE</p>
              <p className="text-4xl font-bold text-primary-600 mb-2">
                {formatPrice(setting.base_price)}
              </p>
              <p className="text-xs text-gray-600">
                Diamond price calculated separately when building a ring
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Style</p>
                <p className="text-2xl font-bold text-gray-900">{setting.style_type}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Metal</p>
                <p className="text-2xl font-bold text-gray-900">{setting.metal_type}</p>
              </div>
              {setting.min_carat && setting.max_carat && (
                <>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Min Carat</p>
                    <p className="text-2xl font-bold text-gray-900">{setting.min_carat}ct</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Max Carat</p>
                    <p className="text-2xl font-bold text-gray-900">{setting.max_carat}ct</p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuildRing}
                className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Build Ring with This Setting
              </Button>

              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add Setting to Cart
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
              <p className="font-semibold mb-2">💎 Complete Ring Pricing</p>
              <p>This is the setting price only. When you build a ring, the diamond price will be calculated with quality multipliers and added to this price.</p>
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
                    <h4 className="font-semibold text-gray-900 mb-4">Setting Specifications</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Setting Type</dt>
                        <dd className="font-semibold text-gray-900">{setting.setting_type || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Metal Type</dt>
                        <dd className="font-semibold text-gray-900">{setting.metal_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Style</dt>
                        <dd className="font-semibold text-gray-900">{setting.style_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Weight (approx)</dt>
                        <dd className="font-semibold text-gray-900">{setting.weight_grams || 'N/A'}g</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Compatibility</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Compatible Shapes</dt>
                        <dd className="font-semibold text-gray-900">
                          {setting.compatible_shapes || 'All'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Diamond Size Range</dt>
                        <dd className="font-semibold text-gray-900">
                          {setting.min_carat && setting.max_carat
                            ? `${setting.min_carat}-${setting.max_carat}ct`
                            : 'Flexible'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Price</dt>
                        <dd className="font-semibold text-gray-900">
                          {formatPrice(setting.base_price)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">About This Setting</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {setting.description || 'No description available.'}
                </p>
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

export default SettingDetail;