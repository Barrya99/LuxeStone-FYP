// diamond-frontend/src/components/configurator/StepTwoSetting.jsx

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';
import { settingAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import Loading from '../common/Loading';
import Button from '../common/Button';
import ProductImage from '../common/ProductImage';
import toast from 'react-hot-toast';

const StepTwoSetting = ({ selectedDiamond, onSelectSetting, selectedSetting }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    style_type: '',
    metal_type: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [filters]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const params = {
        page_size: 12,
        ...filters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await settingAPI.getAll(params);
      
      // Filter by compatible shapes if diamond selected
      let filteredSettings = response.data.results || [];
      if (selectedDiamond?.shape) {
        filteredSettings = filteredSettings.filter(setting => {
          if (!setting.compatible_shapes) return true;
          const shapes = setting.compatible_shapes.split(',').map(s => s.trim());
          return shapes.includes(selectedDiamond.shape);
        });
      }
      
      console.log('[StepTwoSetting] Fetched settings:', filteredSettings);
      console.log('[StepTwoSetting] First setting image URL:', filteredSettings[0]?.image_url);
      setSettings(filteredSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const filteredSettings = settings.filter(setting => {
    if (searchTerm) {
      return (
        setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const getMetalColor = (metalType) => {
    const colors = {
      'Gold': 'from-yellow-300 via-yellow-200 to-amber-200',
      'White Gold': 'from-gray-300 via-gray-200 to-slate-200',
      'Platinum': 'from-slate-300 via-slate-200 to-gray-200',
      'Silver': 'from-gray-300 via-blue-100 to-slate-200',
      'Rose Gold': 'from-rose-300 via-rose-200 to-pink-200',
    };
    return colors[metalType] || 'from-gray-300 via-gray-200 to-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Choose Your Setting
        </h2>
        <p className="text-gray-600">
          {selectedDiamond 
            ? `Ring settings compatible with ${selectedDiamond.shape} diamonds`
            : 'Select a diamond first to see compatible settings'}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide' : 'Show'} Filters
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <select
                value={filters.style_type}
                onChange={(e) => setFilters(prev => ({ ...prev, style_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Styles</option>
                <option value="Solitaire">Solitaire</option>
                <option value="Halo">Halo</option>
                <option value="Three Stone">Three Stone</option>
                <option value="Vintage">Vintage</option>
                <option value="Modern">Modern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metal</label>
              <select
                value={filters.metal_type}
                onChange={(e) => setFilters(prev => ({ ...prev, metal_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Metals</option>
                <option value="Gold">Gold</option>
                <option value="White Gold">White Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Rose Gold">Rose Gold</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Settings Grid Cards */}
      {loading ? (
        <Loading />
      ) : filteredSettings.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSettings.map((setting) => {
              const isSelected = selectedSetting?.setting_id === setting.setting_id;

              return (
                <div
                  key={setting.setting_id}
                  onClick={() => onSelectSetting(setting)}
                  className={`group bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-600 shadow-2xl scale-105'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
                  }`}
                >
                  {/* Image Container */}
                  <div 
                    className="relative aspect-square bg-gradient-to-br overflow-hidden"
                    style={{backgroundImage: `linear-gradient(to bottom right, ${getMetalColor(setting.metal_type)})`}}
                  >
                    {/* Product Image - Shows actual setting photos */}
                    <ProductImage 
                      src={setting.image_url || setting.thumbnail_url}
                      alt={`${setting.name} - ${setting.sku}`}
                      type="setting"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-primary-600 rounded-full p-2">
                        <Check className="h-5 w-5 text-white fill-white" />
                      </div>
                    )}

                    {/* Style Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-sm font-semibold text-gray-900">{setting.style_type}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Name & Metal */}
                    <div>
                      <p className="text-xs text-gray-500">{setting.sku}</p>
                      <p className="text-lg font-bold text-gray-900 line-clamp-2">
                        {setting.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{setting.metal_type}</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Style</p>
                        <p className="font-semibold text-gray-900 truncate">{setting.style_type}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Metal</p>
                        <p className="font-semibold text-gray-900 truncate">{setting.metal_type.split(' ')[0]}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Popular</p>
                        <p className="font-semibold text-gray-900">⭐ {setting.popularity_score || '—'}</p>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Setting Price</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(setting.base_price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total with diamond shown in next step
                      </p>
                    </div>

                    {/* Select Button */}
                    <Button
                      onClick={() => onSelectSetting(setting)}
                      variant={isSelected ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      {isSelected ? '✓ Selected' : 'Select Setting'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">
            {selectedDiamond 
              ? `No settings available for ${selectedDiamond.shape} diamonds`
              : 'No settings found matching your filters.'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => setFilters({
              style_type: '',
              metal_type: '',
            })}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">💍 Setting Information</p>
        <ul className="space-y-1 text-xs">
          <li>✓ All settings shown are compatible with your selected diamond shape</li>
          <li>✓ Setting price shown here; combined with diamond price in next step</li>
          <li>✓ Settings are templates - unlimited availability</li>
        </ul>
      </div>
    </div>
  );
};

export default StepTwoSetting;