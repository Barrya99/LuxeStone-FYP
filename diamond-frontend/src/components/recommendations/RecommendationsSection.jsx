// diamond-frontend/src/components/recommendations/RecommendationsSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, TrendingUp, Zap, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useCartStore } from '../../store/useCartStore';
import Button from '../common/Button';
import RecommendationCard from './RecommendationCard';

const RecommendationsSection = ({ type = 'personalized', limit = 10, budget = null, diamondId = null }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addFavorite } = useFavoritesStore();
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
      let params = {};

      if (type === 'budget' && budget) {
        params.max_price = budget;
      }
      
      // ✅ FIXED: Pass diamond_id for similar diamonds
      if (type === 'similar' && diamondId) {
        params.diamond_id = diamondId;
      }

      console.log('Fetching recommendations:', { type, endpoint, params });

      const response = await axios.get(endpoint, { params });

      console.log('API Response:', response.data);

      if (response.data.success) {
        // ✅ FIXED: Handle both response formats
        let processedData = { ...response.data };
        
        // If API returns "similar_diamonds" instead of "diamonds", rename it
        if (response.data.similar_diamonds && !response.data.diamonds) {
          processedData.diamonds = response.data.similar_diamonds;
        }
        
        setRecommendations(processedData);
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

  const getRecommendationTitle = () => {
    const titles = {
      personalized: '✨ Recommended For You',
      trending: '🔥 Trending Now',
      budget: `💰 Best Under ${budget ? `PKR ${budget.toLocaleString()}` : 'Budget'}`,
      similar: '🔍 Similar Diamonds',
      settings: '👑 Perfect Settings',
      combinations: '💎 Popular Combinations',
    };
    return titles[type] || 'Recommendations';
  };

  const getRecommendationIcon = () => {
    const icons = {
      personalized: Sparkles,
      trending: TrendingUp,
      budget: Zap,
      similar: Sparkles,
      settings: Sparkles,
      combinations: Sparkles,
    };
    return icons[type] || Sparkles;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-700 mb-4">{error}</p>
        <Button size="sm" onClick={fetchRecommendations}>
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

  if (!recommendations?.diamonds && !recommendations?.settings && !recommendations?.combinations) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No recommendations available</p>
      </div>
    );
  }

  // Horizontal Scroll Component
  const HorizontalScroll = ({ items, itemType, title, count }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = 300;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title} <span className="text-xs text-gray-500 font-normal">({count})</span>
          </h3>
          {items.length > 5 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {items.slice(0, 10).map((item) => {
            // ✅ FIXED: Safely access diamond_id or setting_id
            const id = itemType === 'diamond' ? item?.diamond_id : item?.setting_id;
            
            if (!id) {
              console.warn(`Missing ${itemType}_id for item:`, item);
              return null;
            }

            return (
              <div
                key={id}
                className="snap-center shrink-0"
              >
                <RecommendationCard item={item} type={itemType} />
              </div>
            );
          })}
        </div>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            {React.createElement(getRecommendationIcon(), {
              className: 'h-5 w-5 text-primary-600',
            })}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              {getRecommendationTitle()}
            </h2>
            {recommendations?.message && (
              <p className="text-sm text-gray-600 mt-1">{recommendations.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Diamonds Section - Horizontal Scroll */}
        {recommendations?.diamonds && recommendations.diamonds.length > 0 && (
          <HorizontalScroll
            items={recommendations.diamonds}
            itemType="diamond"
            title={type === 'similar' ? '💎 Similar Diamonds' : '💎 Recommended Diamonds'}
            count={recommendations.diamonds.length}
          />
        )}

        {/* Settings Section - Horizontal Scroll */}
        {recommendations?.settings && recommendations.settings.length > 0 && (
          <HorizontalScroll
            items={recommendations.settings}
            itemType="setting"
            title="👑 Perfect Settings"
            count={recommendations.settings.length}
          />
        )}

        {/* Combinations Section - Vertical List */}
        {recommendations?.combinations && recommendations.combinations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎁 Popular Combinations{' '}
              <span className="text-xs text-gray-500 font-normal">
                ({recommendations.combinations.length})
              </span>
            </h3>
            <div className="space-y-3">
              {recommendations.combinations.slice(0, 5).map((combo, idx) => {
                // ✅ FIXED: Safely access nested objects
                const diamond = combo.diamond || combo;
                const setting = combo.setting || combo;
                const diamondCarat = diamond?.carat || 'N/A';
                const diamondShape = diamond?.shape || 'Diamond';
                const settingName = setting?.name || 'Setting';
                const totalPrice = combo.total_price || combo.price || 'Contact';

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          💎
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {diamondCarat}ct {diamondShape} + {settingName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {diamond?.cut && `${diamond.cut} Cut`}
                            {diamond?.cut && diamond?.color && ' • '}
                            {diamond?.color && `${diamond.color} Color`}
                            {(diamond?.cut || diamond?.color) && diamond?.clarity && ' • '}
                            {diamond?.clarity && diamond.clarity}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-lg font-bold text-primary-600">
                          {typeof totalPrice === 'number' 
                            ? `PKR ${(totalPrice).toLocaleString()}`
                            : totalPrice
                          }
                        </p>
                        <Button size="sm" className="whitespace-nowrap">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSection;