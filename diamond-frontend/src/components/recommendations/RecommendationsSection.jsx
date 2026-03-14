// diamond-frontend/src/components/recommendations/RecommendationsSection.jsx

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap, Heart, Eye, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const RecommendationsSection = ({ type = 'personalized', limit = 10, budget = null, diamondId = null }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchRecommendations();
  }, [type, budget, diamondId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = `${API_BASE_URL}/recommendations/${type}/`;
      let params = { limit };

      if (type === 'budget' && budget) {
        params.max_price = budget;
      }

      if (type === 'similar' && diamondId) {
        params.diamond_id = diamondId;
      }

      const response = await axios.get(endpoint, { params });

      if (response.data.success) {
        setRecommendations(response.data);
      } else {
        setError(response.data.error || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = (item, itemType) => {
    addFavorite({
      id: itemType === 'diamond' ? item.diamond_id : item.setting_id,
      type: itemType,
      ...item,
    });
    toast.success('Added to favorites');
  };

  const handleAddToCart = (diamond) => {
    addItem({
      type: 'diamond',
      diamond_id: diamond.diamond_id,
      total_price: diamond.base_price,
      ...diamond,
    });
    toast.success('Added to cart');
  };

  const getRecommendationTitle = () => {
    const titles = {
      personalized: 'AI-Recommended For You',
      trending: 'Trending Now',
      budget: `Best Diamonds Under $${budget?.toLocaleString()}`,
      similar: 'Similar Diamonds',
      settings: 'Perfect Settings',
      combinations: 'Popular Combinations',
    };
    return titles[type] || 'Recommendations';
  };

  const getRecommendationIcon = () => {
    const icons = {
      personalized: Sparkles,
      trending: TrendingUp,
      budget: Zap,
      similar: Sparkles,
      settings: Heart,
      combinations: Heart,
    };
    const Icon = icons[type] || Sparkles;
    return <Icon className="h-6 w-6" />;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <Button size="sm" onClick={fetchRecommendations} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            {getRecommendationIcon()}
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            {getRecommendationTitle()}
          </h2>
        </div>
        {recommendations?.message && (
          <p className="text-gray-600 text-sm">{recommendations.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Diamonds Section */}
        {recommendations?.diamonds && recommendations.diamonds.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recommended Diamonds ({recommendations.diamonds.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recommendations.diamonds.slice(0, 5).map((diamond) => (
                <div
                  key={diamond.diamond_id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl opacity-50">💎</span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {formatCarat(diamond.carat)} {diamond.shape}
                    </h4>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Cut:</span>
                        <span className="font-medium text-gray-900">{diamond.cut}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium text-gray-900">{diamond.color}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Clarity:</span>
                        <span className="font-medium text-gray-900">{diamond.clarity}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-3">
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(diamond.base_price)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/diamonds/${diamond.diamond_id}`}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" fullWidth>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleAddFavorite(diamond, 'diamond')}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
                          isFavorite(diamond.diamond_id)
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-200'
                        }`}
                      >
                        <Heart className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {recommendations?.settings && recommendations.settings.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recommended Settings ({recommendations.settings.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recommendations.settings.slice(0, 5).map((setting) => (
                <div
                  key={setting.setting_id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                    <span className="text-4xl opacity-50">👑</span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                      {setting.name}
                    </h4>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-medium text-gray-900">{setting.style_type}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Metal:</span>
                        <span className="font-medium text-gray-900">{setting.metal_type}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-3">
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(setting.base_price)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/settings/${setting.setting_id}`}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" fullWidth>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleAddFavorite(setting, 'setting')}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
                          isFavorite(setting.setting_id)
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-200'
                        }`}
                      >
                        <Heart className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combinations Section */}
        {recommendations?.combinations && recommendations.combinations.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Popular Combinations ({recommendations.combinations.length})
            </h3>
            <div className="space-y-3">
              {recommendations.combinations.map((combo, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Diamond + Setting Preview */}
                    <div className="flex gap-2">
                      <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                        💎
                      </div>
                      <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center text-2xl">
                        👑
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {formatCarat(combo.diamond.carat)} {combo.diamond.shape} +{' '}
                        {combo.setting.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Popularity: {combo.popularity} people have saved this
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600 mb-2">
                        {formatPrice(combo.total_price)}
                      </p>
                      <Link to="/configurator">
                        <Button size="sm">Use This Combo</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!recommendations?.diamonds && !recommendations?.settings && !recommendations?.combinations && (
          <div className="text-center py-8">
            <p className="text-gray-600">No recommendations available at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSection;