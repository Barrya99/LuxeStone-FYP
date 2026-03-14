// diamond-frontend/src/components/home/FeaturedProducts.jsx - FIXED

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Eye, Loader } from 'lucide-react';
import { diamondAPI, settingAPI } from '../../services/api';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import Button from '../common/Button';
import Loading from '../common/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [diamonds, setDiamonds] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diamonds');
  const [diamondPrices, setDiamondPrices] = useState({});
  const [pricingLoading, setPricingLoading] = useState({});
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

      // Calculate prices for all diamonds
      if (diamondsRes.data.results) {
        calculateAllDiamondPrices(diamondsRes.data.results);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const calculateAllDiamondPrices = async (diamondList) => {
    try {
      const priceMap = {};
      
      for (const diamond of diamondList) {
        setPricingLoading(prev => ({
          ...prev,
          [diamond.diamond_id]: true
        }));

        try {
          const response = await axios.post(
            `${API_BASE_URL}/pricing/calculate-diamond-price/`,
            { diamond_id: diamond.diamond_id }
          );

          if (response.data.success) {
            priceMap[diamond.diamond_id] = {
              calculated_price: response.data.calculated_price,
              quality_multiplier: response.data.quality_multiplier,
            };
          }
        } catch (error) {
          // Fallback to base price
          priceMap[diamond.diamond_id] = {
            calculated_price: parseFloat(diamond.base_price),
            quality_multiplier: 1,
          };
        }

        setPricingLoading(prev => {
          const updated = { ...prev };
          delete updated[diamond.diamond_id];
          return updated;
        });
      }

      setDiamondPrices(priceMap);
    } catch (error) {
      console.error('Error calculating prices:', error);
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

  const getDisplayPrice = (diamond) => {
    return diamondPrices[diamond.diamond_id]?.calculated_price || 
           parseFloat(diamond.base_price);
  };

  const DiamondCard = ({ diamond }) => (
    <Link
      to={`/diamonds/${diamond.diamond_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-300 via-blue-200 to-cyan-200 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 blur-sm" />
        </div>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleFavorite(diamond, 'diamond');
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(diamond.diamond_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite(diamond.diamond_id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/diamonds/${diamond.diamond_id}`;
            }}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Specs */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              {formatCarat(diamond.carat)} {diamond.shape}
            </p>
            <p className="text-xs text-gray-500">
              {diamond.cut} • {diamond.color} • {diamond.clarity}
            </p>
          </div>
        </div>

        {/* Price - FIXED: Show calculated price */}
        <div className="border-t border-gray-200 pt-3">
          {pricingLoading[diamond.diamond_id] ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin text-primary-600" />
              <span className="text-xs text-gray-600">Calculating...</span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-1">Price (with quality)</p>
              <p className="text-xl font-bold text-primary-600">
                {formatPrice(getDisplayPrice(diamond))}
              </p>
              {diamondPrices[diamond.diamond_id]?.quality_multiplier && (
                <p className="text-xs text-blue-600 mt-1">
                  Quality: {diamondPrices[diamond.diamond_id].quality_multiplier.toFixed(2)}x
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  const SettingCard = ({ setting }) => (
    <Link
      to={`/settings/${setting.setting_id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 blur-sm" />
        </div>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleFavorite(setting, 'setting');
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(setting.setting_id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite(setting.setting_id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/settings/${setting.setting_id}`;
            }}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {setting.name}
          </p>
          <p className="text-xs text-gray-500">
            {setting.style_type} • {setting.metal_type}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 mb-1">Price</p>
          <p className="text-xl font-bold text-primary-600">
            {formatPrice(setting.base_price)}
          </p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Featured Collection
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of diamonds and settings with transparent, real-time pricing
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('diamonds')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'diamonds'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
            }`}
          >
            💎 Diamonds
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
            }`}
          >
            👑 Settings
          </button>
        </div>

        {/* Products Grid */}
        {activeTab === 'diamonds' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {diamonds.map((diamond) => (
              <DiamondCard key={diamond.diamond_id} diamond={diamond} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {settings.map((setting) => (
              <SettingCard key={setting.setting_id} setting={setting} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center">
          <Link
            to={activeTab === 'diamonds' ? '/diamonds' : '/settings'}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            View All {activeTab === 'diamonds' ? 'Diamonds' : 'Settings'}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            <strong>✓ All prices shown are REAL calculated prices</strong> including quality adjustments for cut, color, and clarity.
            <br />
            You'll see the same price throughout your shopping experience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;