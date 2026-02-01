// src/components/home/FeaturedProducts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Eye } from 'lucide-react';
import { diamondAPI, settingAPI } from '../../services/api';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import Button from '../common/Button';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [diamonds, setDiamonds] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diamonds');
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const [diamondsRes, settingsRes] = await Promise.all([
        diamondAPI.getAll({ ordering: '-created_at', page_size: 6 }),
        settingAPI.getAll({ ordering: '-popularity_score', page_size: 6 }),
      ]);
      setDiamonds(diamondsRes.data.results || []);
      setSettings(settingsRes.data.results || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (item, type) => {
    const favoriteItem = {
      id: type === 'diamond' ? item.diamond_id : item.setting_id,
      type,
      ...item,
    };

    if (isFavorite(favoriteItem.id)) {
      removeFavorite(favoriteItem.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite(favoriteItem);
      toast.success('Added to favorites');
    }
  };

  const DiamondCard = ({ diamond }) => (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-200 to-blue-200 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => handleToggleFavorite(diamond, 'diamond')}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(diamond.diamond_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite(diamond.diamond_id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
            {diamond.shape}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-2">
            {formatCarat(diamond.carat)} {diamond.shape} Diamond
          </h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
              {diamond.cut}
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-medium">
              {diamond.color}
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-medium">
              {diamond.clarity}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(diamond.base_price)}
            </div>
            <div className="text-sm text-gray-500">IGI Certified</div>
          </div>
          <Link to={`/diamonds/${diamond.diamond_id}`}>
            <Button size="sm" className="group/btn">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const SettingCard = ({ setting }) => (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => handleToggleFavorite(setting, 'setting')}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(setting.setting_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite(setting.setting_id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Badge */}
        {setting.popularity_score > 80 && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
              Popular
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-2">
            {setting.name}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded font-medium">
              {setting.style_type}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
              {setting.metal_type}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(setting.base_price)}
            </div>
            <div className="text-sm text-gray-500">Starting at</div>
          </div>
          <Link to={`/settings/${setting.setting_id}`}>
            <Button size="sm" className="group/btn">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Featured Collections
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of stunning diamonds and elegant settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('diamonds')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'diamonds'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Diamonds
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {activeTab === 'diamonds'
                ? diamonds.map((diamond) => (
                    <DiamondCard key={diamond.diamond_id} diamond={diamond} />
                  ))
                : settings.map((setting) => (
                    <SettingCard key={setting.setting_id} setting={setting} />
                  ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link to={activeTab === 'diamonds' ? '/diamonds' : '/settings'}>
                <Button size="lg" variant="secondary" className="group">
                  View All {activeTab === 'diamonds' ? 'Diamonds' : 'Settings'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;