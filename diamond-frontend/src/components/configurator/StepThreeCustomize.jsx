// diamond-frontend/src/components/configurator/StepThreeCustomize.jsx - FIXED

import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Heart, Hand, Loader } from 'lucide-react';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { RING_SIZES } from '../../utils/constants';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import PriceBreakdown from './PriceBreakdown';
import axios from 'axios';
import toast from 'react-hot-toast';

const StepThreeCustomize = ({ selectedDiamond, selectedSetting, onBack }) => {
  const navigate = useNavigate();
  const [ringSize, setRingSize] = useState('7');
  const [skinTone, setSkinTone] = useState(50);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const { addItem } = useCartStore();
  const { addFavorite } = useFavoritesStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Calculate real price when diamond, setting, or ring size changes
  useEffect(() => {
    if (selectedDiamond && selectedSetting) {
      calculateRealPrice();
    }
  }, [selectedDiamond, selectedSetting, ringSize]);

  const calculateRealPrice = async () => {
    try {
      setLoadingPrice(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/pricing/calculate-ring-price/`,
        {
          diamond_id: selectedDiamond.diamond_id,
          setting_id: selectedSetting.setting_id,
          ring_size: ringSize,
        }
      );

      if (response.data.success) {
        setTotalPrice(response.data.subtotal);
        setPricingInfo({
          diamondPrice: response.data.diamond_price,
          settingPrice: response.data.setting_price,
          sizeCharge: response.data.ring_size_surcharge,
        });
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      // Fallback
      const diamondPrice = parseFloat(selectedDiamond?.base_price || 0);
      const settingPrice = parseFloat(selectedSetting?.base_price || 0);
      setTotalPrice(diamondPrice + settingPrice);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      type: 'complete_ring',
      diamond_id: selectedDiamond.diamond_id,
      setting_id: selectedSetting.setting_id,
      ring_size: ringSize,
      total_price: totalPrice,
      diamond: selectedDiamond,
      setting: selectedSetting,
    });
    toast.success('Ring added to cart!');
    navigate('/cart');
  };

  const handleSaveConfiguration = () => {
    addFavorite({
      id: `config-${Date.now()}`,
      type: 'configuration',
      diamond: selectedDiamond,
      setting: selectedSetting,
      ring_size: ringSize,
      total_price: totalPrice,
    });
    toast.success('Configuration saved to favorites!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Customize Your Ring
        </h2>
        <p className="text-gray-600">
          Choose ring size and preview your complete design
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left: Hand Preview */}
        <div className="sticky top-24 self-start">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Hand Model Preview */}
            <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simplified Hand Visual */}
                <div className="relative">
                  <Hand 
                    className="h-48 w-48 transition-colors" 
                    style={{ 
                      color: `hsl(${20 + skinTone/5}, ${60 - skinTone/3}%, ${70 - skinTone/2}%)`
                    }}
                  />
                  {/* Ring Preview */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-20 rounded-full border-4 border-amber-400 opacity-80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Skin Tone Selector */}
            <div className="p-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Skin Tone Preview
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={skinTone}
                onChange={(e) => setSkinTone(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Details & Price */}
        <div className="space-y-6">
          
          {/* Ring Size Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ring Size</h3>
            <div className="grid grid-cols-7 gap-2">
              {RING_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setRingSize(String(size))}
                  className={`py-2 rounded-lg font-medium text-sm transition-all ${
                    ringSize === String(size)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Your Selection</h3>
            
            {/* Diamond */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatCarat(selectedDiamond?.carat)} {selectedDiamond?.shape} Diamond
                </p>
                <p className="text-xs text-gray-500">
                  {selectedDiamond?.cut}, {selectedDiamond?.color}, {selectedDiamond?.clarity}
                </p>
              </div>
              <div className="text-right">
                {loadingPrice ? (
                  <div className="flex items-center gap-1">
                    <Loader className="h-4 w-4 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <p className="font-bold text-gray-900">
                    {formatPrice(pricingInfo?.diamondPrice || 0)}
                  </p>
                )}
              </div>
            </div>

            {/* Setting */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedSetting?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedSetting?.style_type} • {selectedSetting?.metal_type}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatPrice(pricingInfo?.settingPrice || 0)}
                </p>
              </div>
            </div>

            {/* Ring Size Charge */}
            {pricingInfo?.sizeCharge > 0 && (
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Ring Size {ringSize} Surcharge
                  </p>
                  <p className="text-xs text-gray-500">Custom sizing</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    +{formatPrice(pricingInfo.sizeCharge)}
                  </p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
              <div className="font-display text-lg font-bold text-gray-900">
                Total Price
              </div>
              <div className="text-3xl font-bold text-primary-600">
                {loadingPrice ? (
                  <Loader className="h-8 w-8 animate-spin text-primary-600" />
                ) : (
                  formatPrice(totalPrice)
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown Component */}
          <PriceBreakdown 
            selectedDiamond={selectedDiamond}
            selectedSetting={selectedSetting}
            ringSize={ringSize}
          />

          {/* What's Included */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Lab-Grown Diamond with certification
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Premium Ring Setting ({selectedSetting?.metal_type})
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Custom Ring Sizing (Size {ringSize})
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Free Lifetime Maintenance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                30-Day Money Back Guarantee
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={loadingPrice}
              className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart - {loadingPrice ? 'Calculating...' : formatPrice(totalPrice)}
            </Button>

            <Button
              onClick={handleSaveConfiguration}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Save Configuration
            </Button>

            <Button
              onClick={onBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThreeCustomize;