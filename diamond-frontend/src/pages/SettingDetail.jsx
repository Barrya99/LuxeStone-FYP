// src/pages/SettingDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Share2, Sparkles, ArrowLeft, CheckCircle
} from 'lucide-react';
import { settingAPI } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const SettingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { selectSetting } = useConfiguratorStore();

  useEffect(() => {
    fetchSetting();
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
    selectSetting(setting);
    navigate('/configurator');
    toast.success('Setting selected! Now choose a diamond.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <Loading fullScreen />;
  if (!setting) return null;

  const compatibleShapes = Array.isArray(setting.compatible_shapes) 
    ? setting.compatible_shapes 
    : [];

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
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-to-br from-amber-200 via-yellow-200 to-gold-400 rounded-full opacity-50 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-9xl opacity-40">💍</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-full shadow-lg">
                    {setting.style_type}
                  </span>
                  <span className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-full shadow-lg">
                    {setting.metal_type}
                  </span>
                  {setting.popularity_score > 80 && (
                    <span className="px-4 py-2 bg-gold-500 text-white text-sm font-medium rounded-full shadow-lg">
                      Popular Choice
                    </span>
                  )}
                </div>
              </div>

              {/* Compatible Diamonds */}
              {compatibleShapes.length > 0 && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Compatible Diamond Shapes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {compatibleShapes.map((shape, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {shape}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
                {setting.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-5xl font-bold text-gray-900">
                  {formatPrice(setting.base_price)}
                </div>
                <div className="text-lg text-gray-500">
                  Setting Only
                </div>
              </div>

              {/* Quick Attributes */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                  {setting.style_type}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {setting.metal_type}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" onClick={handleBuildRing} className="flex-1">
                <Sparkles className="h-5 w-5" />
                Build Your Ring
              </Button>
              <Button size="lg" variant="secondary" onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleFavorite}
                className={isFavorite(setting.setting_id) ? 'border-red-500 text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isFavorite(setting.setting_id) ? 'fill-current' : ''}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {setting.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {setting.description}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                {['details', 'compatibility', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' && 'Details'}
                    {tab === 'compatibility' && 'Compatibility'}
                    {tab === 'care' && 'Care Instructions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Style</span>
                      <span className="font-medium text-gray-900">{setting.style_type}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Metal Type</span>
                      <span className="font-medium text-gray-900">{setting.metal_type}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Min Carat</span>
                      <span className="font-medium text-gray-900">{setting.min_carat}ct</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Max Carat</span>
                      <span className="font-medium text-gray-900">{setting.max_carat}ct</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-medium text-gray-900">{setting.sku}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Availability</span>
                      <span className="font-medium text-green-600">
                        {setting.is_available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    This {setting.style_type} setting is compatible with the following diamond shapes:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {compatibleShapes.map((shape, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{shape}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Recommended carat range: {setting.min_carat}ct - {setting.max_carat}ct
                  </p>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Care Instructions</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Clean regularly with warm soapy water and a soft brush</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Remove before exercising or doing manual work</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Store in a fabric-lined jewelry box when not wearing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Have prongs checked by a jeweler annually</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Avoid harsh chemicals and chlorine</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingDetail;