// src/components/configurator/StepOneDiamond.jsx
import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { diamondAPI } from '../../services/api';
import { formatPrice, formatCarat } from '../../utils/formatters';
import { DIAMOND_SHAPES, DIAMOND_CUTS } from '../../utils/constants';
import Button from '../common/Button';
import Loading from '../common/Loading';

const StepOneDiamond = ({ selectedDiamond, onSelectDiamond, budget }) => {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    shape: '',
    cut: '',
    max_price: budget || 10000,
  });

  useEffect(() => {
    fetchDiamonds();
  }, [filters]);

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      const params = {
        page_size: 6,
        ordering: 'base_price',
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await diamondAPI.getAll(params);
      setDiamonds(response.data.results || []);
    } catch (error) {
      console.error('Error fetching diamonds:', error);
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
          Choose Your Diamond
        </h2>
        <p className="text-gray-600">
          Select from our collection of certified lab-grown diamonds
        </p>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Filters</h3>
        
        {/* Shape Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Shape</label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {DIAMOND_SHAPES.slice(0, 5).map((shape) => (
              <button
                key={shape.value}
                onClick={() => handleFilterChange('shape', shape.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  filters.shape === shape.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">{shape.icon}</div>
                <div className="text-xs mt-1">{shape.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Budget: {formatPrice(filters.max_price)}
          </label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={filters.max_price}
            onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        {/* Cut Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Cut Quality</label>
          <div className="flex flex-wrap gap-2">
            {DIAMOND_CUTS.slice(0, 3).map((cut) => (
              <button
                key={cut}
                onClick={() => handleFilterChange('cut', cut)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                  filters.cut === cut
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {cut}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diamond Grid */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diamonds.map((diamond) => (
            <div
              key={diamond.diamond_id}
              onClick={() => onSelectDiamond(diamond)}
              className={`group cursor-pointer bg-white rounded-xl border-2 overflow-hidden transition-all ${
                selectedDiamond?.diamond_id === diamond.diamond_id
                  ? 'border-primary-600 shadow-xl'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-blue-200 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                
                {selectedDiamond?.diamond_id === diamond.diamond_id && (
                  <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium text-sm">
                      Selected ✓
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                    {diamond.shape}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display font-bold text-gray-900 mb-2">
                  {formatCarat(diamond.carat)} {diamond.shape}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
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
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(diamond.base_price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      {selectedDiamond && (
        <div className="flex justify-end">
          <Button size="lg" onClick={() => {}}>
            Continue to Settings
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StepOneDiamond;