import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { settingAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { SETTING_STYLES, METAL_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Loading from '../common/Loading';

const StepTwoSetting = ({ selectedSetting, onSelectSetting, onBack, selectedDiamond }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    style_type: '',
    metal_type: '',
  });

  useEffect(() => {
    fetchSettings();
  }, [filters]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const params = {
        page_size: 6,
        ordering: '-popularity_score',
        ...filters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await settingAPI.getAll(params);
      setSettings(response.data.results || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === prev[key] ? '' : value,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Choose Your Setting
        </h2>
        <p className="text-gray-600">
          Select a setting style for your {selectedDiamond?.shape} diamond
        </p>
      </div>

      {/* Selected Diamond Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-primary-700 font-medium mb-1">Selected Diamond</div>
            <div className="font-bold text-gray-900">
              {selectedDiamond?.carat}ct {selectedDiamond?.shape} - {formatPrice(selectedDiamond?.base_price)}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Change
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filter Settings</h3>
        
        {/* Style Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SETTING_STYLES.slice(0, 4).map((style) => (
              <button
                key={style.value}
                onClick={() => handleFilterChange('style_type', style.value)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  filters.style_type === style.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{style.label}</div>
                <div className="text-xs text-gray-500 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Metal Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Metal Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METAL_TYPES.slice(0, 4).map((metal) => (
              <button
                key={metal.value}
                onClick={() => handleFilterChange('metal_type', metal.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  filters.metal_type === metal.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full mb-2"
                  style={{ backgroundColor: metal.color }}
                />
                {metal.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.map((setting) => (
            <div
              key={setting.setting_id}
              onClick={() => onSelectSetting(setting)}
              className={`group cursor-pointer bg-white rounded-xl border-2 overflow-hidden transition-all ${
                selectedSetting?.setting_id === setting.setting_id
                  ? 'border-primary-600 shadow-xl'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                
                {selectedSetting?.setting_id === setting.setting_id && (
                  <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium text-sm">
                      Selected ✓
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                    {setting.style_type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display font-bold text-gray-900 mb-2">
                  {setting.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                    {setting.metal_type}
                  </span>
                  {setting.popularity_score > 80 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(setting.base_price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button size="lg" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
          Back to Diamonds
        </Button>
        
        {selectedSetting && (
          <Button size="lg">
            Continue to Customize
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepTwoSetting;