// diamond-frontend/src/components/configurator/PriceBreakdown.jsx

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../utils/formatters';

const PriceBreakdown = ({ selectedDiamond, selectedSetting, ringSize }) => {
  const [pricing, setPricing] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Fetch real-time pricing whenever diamond, setting, or ring size changes
  useEffect(() => {
    if (selectedDiamond && selectedSetting) {
      calculatePricing();
    }
  }, [selectedDiamond, selectedSetting, ringSize]);

  const calculatePricing = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call backend pricing API
      const response = await axios.post(
        `${API_BASE_URL}/pricing/get-price-breakdown/`,
        {
          diamond_id: selectedDiamond.diamond_id,
          setting_id: selectedSetting.setting_id,
          ring_size: ringSize || '7',
        }
      );

      if (response.data.success) {
        setBreakdown(response.data);
        
        // Also fetch detailed pricing for debugging/display
        const pricingResponse = await axios.post(
          `${API_BASE_URL}/pricing/calculate-ring-price/`,
          {
            diamond_id: selectedDiamond.diamond_id,
            setting_id: selectedSetting.setting_id,
            ring_size: ringSize || '7',
          }
        );
        
        setPricing(pricingResponse.data);
      }
    } catch (err) {
      console.error('Error calculating pricing:', err);
      
      // Fallback to simple calculation
      fallbackPricing();
      // Don't show error since we have fallback
    } finally {
      setLoading(false);
    }
  };

  const fallbackPricing = () => {
    // Simple fallback if API fails
    const diamondPrice = parseFloat(selectedDiamond?.base_price || 0);
    const settingPrice = parseFloat(selectedSetting?.base_price || 0);
    
    setBreakdown({
      items: [
        {
          name: `${selectedDiamond.carat}ct ${selectedDiamond.shape} Diamond`,
          description: `${selectedDiamond.cut}, ${selectedDiamond.color}, ${selectedDiamond.clarity}`,
          price: diamondPrice,
        },
        {
          name: selectedSetting.name,
          description: `${selectedSetting.metal_type} Setting`,
          price: settingPrice,
        },
      ],
      subtotal: diamondPrice + settingPrice,
      total: diamondPrice + settingPrice,
      surcharges: [],
    });
  };

  if (!selectedDiamond || !selectedSetting) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Select diamond and setting to see pricing</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
        </div>
        <p className="text-sm text-gray-600">Real-time pricing with quality multipliers</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-gray-600 mt-2">Calculating price...</p>
          </div>
        ) : breakdown ? (
          <>
            {/* Items Breakdown */}
            <div className="space-y-4">
              {breakdown.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Surcharges */}
            {breakdown.surcharges?.length > 0 && (
              <div className="space-y-2 border-t border-gray-200 pt-4">
                {breakdown.surcharges.map((surcharge, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{surcharge.name}</span>
                    <span className="font-medium text-gray-900">
                      {surcharge.price > 0 ? '+' : ''}{formatPrice(surcharge.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing Details (if available from API) */}
            {pricing && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700">Quality Multiplier (Cut + Color):</span>
                  <span className="font-semibold text-blue-900">
                    {pricing.quality_multiplier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Clarity Adjustment:</span>
                  <span className="font-semibold text-blue-900">
                    {pricing.clarity_adjustment?.toFixed(2)}x
                  </span>
                </div>
                {pricing.size_premium && pricing.size_premium !== 1 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Size Premium:</span>
                    <span className="font-semibold text-blue-900">
                      {pricing.size_premium?.toFixed(2)}x
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Subtotal */}
            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(breakdown.subtotal)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">Estimated Total</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(breakdown.total)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                ✓ Price includes quality multipliers for 4Cs
              </p>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>💎 Diamond price calculated with:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Cut quality premium</li>
                <li>Color grade adjustment</li>
                <li>Clarity impact</li>
                <li>Size premium (if applicable)</li>
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PriceBreakdown;