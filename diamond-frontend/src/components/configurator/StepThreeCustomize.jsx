import { useState } from 'react';
import { ChevronLeft, ShoppingCart, Heart, Hand } from 'lucide-react';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { RING_SIZES } from '../../utils/constants';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const StepThreeCustomize = ({ selectedDiamond, selectedSetting, onBack }) => {
  const navigate = useNavigate();
  const [ringSize, setRingSize] = useState('7');
  const [skinTone, setSkinTone] = useState(50);
  const { addItem } = useCartStore();
  const { addFavorite } = useFavoritesStore();

  const diamondPrice = parseFloat(selectedDiamond?.base_price || 0);
  const settingPrice = parseFloat(selectedSetting?.base_price || 0);
  const totalPrice = diamondPrice + settingPrice;

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
                  {/* Ring on finger */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-200 to-yellow-200 shadow-xl animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Info Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900">
                  Ring Size: {ringSize}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedDiamond?.shape} Diamond • {selectedSetting?.style_type} Setting
                </div>
              </div>
            </div>

            {/* Skin Tone Slider */}
            <div className="p-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Adjust Skin Tone
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={skinTone}
                onChange={(e) => setSkinTone(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-pink-200 via-amber-200 to-amber-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Lighter</span>
                <span>Darker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Configuration Details */}
        <div className="space-y-6">
          
          {/* Ring Size Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Select Ring Size
            </label>
            <div className="grid grid-cols-5 gap-2">
              {RING_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setRingSize(size)}
                  className={`py-3 px-4 border rounded-lg font-medium transition-all ${
                    ringSize === size
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Not sure about your size? <a href="#" className="text-primary-600 hover:underline">View size guide</a>
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Configuration</h3>
            
            {/* Diamond */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">Diamond</div>
                <div className="text-sm text-gray-600">
                  {formatCarat(selectedDiamond?.carat)} {selectedDiamond?.shape}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedDiamond?.cut} • {selectedDiamond?.color} • {selectedDiamond?.clarity}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatPrice(diamondPrice)}
                </div>
                <button 
                  onClick={onBack}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Setting */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">Setting</div>
                <div className="text-sm text-gray-600">
                  {selectedSetting?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedSetting?.style_type} • {selectedSetting?.metal_type}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatPrice(settingPrice)}
                </div>
                <button 
                  onClick={onBack}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
              <div className="font-display text-lg font-bold text-gray-900">
                Total Price
              </div>
              <div className="text-3xl font-bold text-primary-600">
                {formatPrice(totalPrice)}
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                IGI Certified Diamond
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Premium {selectedSetting?.metal_type} Setting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Free Insured Shipping
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                30-Day Returns
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Lifetime Warranty
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Complimentary Ring Box
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button size="lg" fullWidth onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" fullWidth onClick={handleSaveConfiguration}>
              <Heart className="h-5 w-5" />
              Save Configuration
            </Button>
          </div>

          {/* Back Button */}
          <Button variant="outline" fullWidth onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepThreeCustomize;