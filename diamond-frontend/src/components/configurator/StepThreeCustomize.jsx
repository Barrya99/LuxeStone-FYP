// diamond-frontend/src/components/configurator/StepThreeCustomize.jsx
// UPDATED: integrates HandModelViewer with "Try On" button

import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Heart, Hand, Loader, Eye } from 'lucide-react';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { RING_SIZES } from '../../utils/constants';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import ProductImage from '../common/ProductImage';
import PriceBreakdown from './PriceBreakdown';
import HandModelViewer from '../../features/handModel/HandModelViewer';
import axios from 'axios';
import toast from 'react-hot-toast';

const StepThreeCustomize = ({ selectedDiamond, selectedSetting, onBack }) => {
  const navigate = useNavigate();
  const [ringSize, setRingSize] = useState('7');
  const [totalPrice, setTotalPrice] = useState(0);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [handModelOpen, setHandModelOpen] = useState(false);
  const { addItem } = useCartStore();
  const { addFavorite } = useFavoritesStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (selectedDiamond && selectedSetting) {
      calculateRealPrice();
    }
  }, [selectedDiamond, selectedSetting, ringSize]);

  const calculateRealPrice = async () => {
    try {
      setLoadingPrice(true);
      const response = await axios.post(`${API_BASE_URL}/pricing/calculate-ring-price/`, {
        diamond_id: selectedDiamond.diamond_id,
        setting_id: selectedSetting.setting_id,
        ring_size: ringSize,
      });
      if (response.data.success) {
        setTotalPrice(response.data.subtotal);
        setPricingInfo({
          diamondPrice: response.data.diamond_price,
          settingPrice: response.data.setting_price,
          sizeCharge: response.data.ring_size_surcharge,
        });
      }
    } catch (error) {
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

  // Determine metal type for hand model
  const getMetalId = () => {
    const metal = (selectedSetting?.metal_type || '').toLowerCase();
    if (metal.includes('rose')) return 'rose_gold';
    if (metal.includes('yellow')) return 'yellow_gold';
    if (metal.includes('platinum')) return 'platinum';
    return 'white_gold';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Customize Your Ring
        </h2>
        <p className="text-gray-600">Choose ring size and preview your complete design</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left: Ring Preview */}
        <div className="sticky top-24 self-start">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Visual preview area */}
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
              {/* Diamond Image */}
              {selectedDiamond?.image_url ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <ProductImage
                    src={selectedDiamond.image_url}
                    alt={`${selectedDiamond.shape} Diamond - ${formatCarat(selectedDiamond.carat)}ct`}
                    type="diamond"
                    className="w-full h-4/5 object-contain"
                  />
                  <div className="text-center mt-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {formatCarat(selectedDiamond?.carat)} {selectedDiamond?.shape}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedSetting?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* Ring band */}
                    <div
                      className="w-28 h-28 rounded-full border-8 flex items-center justify-center"
                      style={{
                        borderColor: selectedSetting?.metal_type?.includes('Yellow') ? '#D4A520'
                          : selectedSetting?.metal_type?.includes('Rose') ? '#C8837A'
                          : '#D0D0D0',
                        background: 'transparent',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      }}
                    >
                      {/* Diamond in center */}
                      <div className="w-12 h-14 bg-gradient-to-br from-white via-blue-100 to-blue-200 rounded-sm transform rotate-45 shadow-inner" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {formatCarat(selectedDiamond?.carat)} {selectedDiamond?.shape}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedSetting?.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Try On button overlay */}
              <button
                onClick={() => setHandModelOpen(true)}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-full shadow-lg transition-all hover:scale-105"
              >
                <Hand className="h-4 w-4" />
                Try On Hand
              </button>
            </div>

            {/* Ring size selector below preview */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Ring Size</h3>
              <div className="grid grid-cols-8 gap-1.5">
                {RING_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setRingSize(String(size))}
                    className={`py-1.5 rounded-lg font-medium text-xs transition-all ${
                      ringSize === String(size)
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details & Price */}
        <div className="space-y-6">

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
                  <Loader className="h-4 w-4 animate-spin text-primary-600" />
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
                <p className="text-sm font-medium text-gray-900">{selectedSetting?.name}</p>
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

            {/* Size charge */}
            {pricingInfo?.sizeCharge > 0 && (
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Ring Size {ringSize} Surcharge</p>
                  <p className="text-xs text-gray-500">Custom sizing</p>
                </div>
                <p className="font-bold text-gray-900">+{formatPrice(pricingInfo.sizeCharge)}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
              <div className="font-display text-lg font-bold text-gray-900">Total Price</div>
              <div className="text-3xl font-bold text-primary-600">
                {loadingPrice ? (
                  <Loader className="h-8 w-8 animate-spin text-primary-600" />
                ) : (
                  formatPrice(totalPrice)
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <PriceBreakdown
            selectedDiamond={selectedDiamond}
            selectedSetting={selectedSetting}
            ringSize={ringSize}
          />

          {/* What's Included */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Lab-Grown Diamond with certification',
                `Premium Ring Setting (${selectedSetting?.metal_type})`,
                `Custom Ring Sizing (Size ${ringSize})`,
                'Free Lifetime Maintenance',
                '30-Day Money Back Guarantee',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Try On prominent button */}
            <Button
              onClick={() => setHandModelOpen(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-primary-400 text-primary-700 hover:bg-primary-50"
            >
              <Hand className="h-5 w-5" />
              Try On Hand Model
            </Button>

            <Button
              onClick={handleAddToCart}
              disabled={loadingPrice}
              className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart — {loadingPrice ? 'Calculating...' : formatPrice(totalPrice)}
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

      {/* Hand Model Viewer Modal */}
      <HandModelViewer
        isOpen={handModelOpen}
        onClose={() => setHandModelOpen(false)}
        selectedShape={(selectedDiamond?.shape || 'Round').toLowerCase()}
        selectedCarat={parseFloat(selectedDiamond?.carat || 1.5)}
        selectedMetal={getMetalId()}
      />
    </div>
  );
};

export default StepThreeCustomize;