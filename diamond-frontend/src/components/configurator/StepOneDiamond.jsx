// diamond-frontend/src/components/configurator/StepOneDiamond.jsx

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Loader, Check } from 'lucide-react';
import { diamondAPI } from '../../services/api';
import { formatPrice, formatCarat } from '../../utils/formatters';
import axios from 'axios';
import Loading from '../common/Loading';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const StepOneDiamond = ({ onSelectDiamond, selectedDiamond }) => {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diamondPrices, setDiamondPrices] = useState({});
  const [pricingLoading, setPricingLoading] = useState({});

  const [filters, setFilters] = useState({
    cut: '',
    color: '',
    clarity: '',
    shape: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchDiamonds();
  }, [filters]);

  const fetchDiamonds = async () => {
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

      const response = await diamondAPI.getAll(params);
      setDiamonds(response.data.results || []);
      
      if (response.data.results) {
        calculateAllPrices(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching diamonds:', error);
      toast.error('Failed to load diamonds');
    } finally {
      setLoading(false);
    }
  };

  const calculateAllPrices = async (diamondList) => {
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
              clarity_adjustment: response.data.clarity_adjustment,
              size_premium: response.data.size_premium,
            };
          }
        } catch (error) {
          priceMap[diamond.diamond_id] = {
            calculated_price: parseFloat(diamond.base_price),
            quality_multiplier: 1,
            clarity_adjustment: 1,
            size_premium: 1,
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

  const filteredDiamonds = diamonds.filter(diamond => {
    if (searchTerm) {
      return (
        diamond.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const getDisplayPrice = (diamond) => {
    return diamondPrices[diamond.diamond_id]?.calculated_price || 
           parseFloat(diamond.base_price);
  };

  const getShapeColor = (shape) => {
    const colors = {
      'Round': 'from-blue-300 via-blue-200 to-cyan-200',
      'Cushion': 'from-purple-300 via-purple-200 to-pink-200',
      'Oval': 'from-green-300 via-green-200 to-emerald-200',
      'Emerald': 'from-yellow-300 via-yellow-200 to-amber-200',
      'Asscher': 'from-red-300 via-red-200 to-pink-200',
    };
    return colors[shape] || 'from-blue-300 via-blue-200 to-cyan-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Select Your Diamond
        </h2>
        <p className="text-gray-600">
          Choose from our collection with real-time pricing & quality adjustments
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by SKU or shape..."
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cut</label>
              <select
                value={filters.cut}
                onChange={(e) => setFilters(prev => ({ ...prev, cut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cuts</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select
                value={filters.color}
                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Colors</option>
                <option value="D">D - Colorless</option>
                <option value="E">E - Colorless</option>
                <option value="F">F - Colorless</option>
                <option value="G">G - Near Colorless</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clarity</label>
              <select
                value={filters.clarity}
                onChange={(e) => setFilters(prev => ({ ...prev, clarity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Clarity</option>
                <option value="IF">IF - Internally Flawless</option>
                <option value="VVS1">VVS1</option>
                <option value="VVS2">VVS2</option>
                <option value="VS1">VS1</option>
                <option value="VS2">VS2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
              <select
                value={filters.shape}
                onChange={(e) => setFilters(prev => ({ ...prev, shape: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Shapes</option>
                <option value="Round">Round</option>
                <option value="Cushion">Cushion</option>
                <option value="Emerald">Emerald</option>
                <option value="Oval">Oval</option>
                <option value="Asscher">Asscher</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Diamond Grid Cards */}
      {loading ? (
        <Loading />
      ) : filteredDiamonds.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiamonds.map((diamond) => {
              const displayPrice = getDisplayPrice(diamond);
              const pricingInfo = diamondPrices[diamond.diamond_id];
              const isSelected = selectedDiamond?.diamond_id === diamond.diamond_id;

              return (
                <div
                  key={diamond.diamond_id}
                  onClick={() => onSelectDiamond(diamond)}
                  className={`group bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-600 shadow-2xl scale-105'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gradient-to-br overflow-hidden" 
                       style={{backgroundImage: `linear-gradient(to bottom right, ${getShapeColor(diamond.shape)})`}}>
                    
                    {/* Diamond Visual */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-32 h-32 bg-gradient-to-br ${getShapeColor(diamond.shape)} rounded-full opacity-60 group-hover:scale-110 transition-transform duration-500 blur-sm`} />
                      <div className="absolute w-24 h-24 bg-white rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="absolute w-16 h-16 bg-white rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-primary-600 rounded-full p-2">
                        <Check className="h-5 w-5 text-white fill-white" />
                      </div>
                    )}

                    {/* Shape Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-sm font-semibold text-gray-900">{diamond.shape}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* SKU & Carat */}
                    <div>
                      <p className="text-xs text-gray-500">{diamond.sku}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCarat(diamond.carat)}
                      </p>
                    </div>

                    {/* 4Cs Specs */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Cut</p>
                        <p className="font-semibold text-gray-900">{diamond.cut}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Color</p>
                        <p className="font-semibold text-gray-900">{diamond.color}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Clarity</p>
                        <p className="font-semibold text-gray-900">{diamond.clarity}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Cert</p>
                        <p className="font-semibold text-gray-900">{diamond.certificate_type || 'GIA'}</p>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Real Price (w/ Quality Adj)</p>
                      
                      {pricingLoading[diamond.diamond_id] ? (
                        <div className="flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin text-primary-600" />
                          <span className="text-sm text-gray-600">Calculating...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-primary-600">
                            {formatPrice(displayPrice)}
                          </p>
                          {pricingInfo && (
                            <p className="text-xs text-blue-600 font-medium">
                              Quality: {pricingInfo.quality_multiplier?.toFixed(2)}x
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Select Button */}
                    <Button
                      onClick={() => onSelectDiamond(diamond)}
                      variant={isSelected ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      {isSelected ? '✓ Selected' : 'Select Diamond'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No diamonds found matching your filters.</p>
          <Button 
            variant="primary" 
            onClick={() => setFilters({
              cut: '',
              color: '',
              clarity: '',
              shape: '',
            })}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">💎 Real Pricing Applied</p>
        <ul className="space-y-1 text-xs">
          <li>✓ All prices include quality adjustments for cut, color, and clarity</li>
          <li>✓ Same price shown in checkout - no surprises</li>
          <li>✓ Click "Quality: X.XXx" to see detailed breakdown</li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneDiamond;