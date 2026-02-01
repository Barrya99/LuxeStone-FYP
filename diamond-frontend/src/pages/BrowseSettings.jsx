// src/pages/BrowseSettings.jsx
import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { settingAPI } from '../services/api';
import SettingCard from '../components/products/SettingCard';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { SETTING_STYLES, METAL_TYPES, SORT_OPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

const BrowseSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    style_type: '',
    metal_type: '',
    min_price: 0,
    max_price: 5000,
    ordering: '-popularity_score',
  });

  useEffect(() => {
    fetchSettings();
  }, [filters, currentPage]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        page_size: 12,
        ...filters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await settingAPI.getAll(params);
      setSettings(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === prev[key] ? '' : value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      style_type: '',
      metal_type: '',
      min_price: 0,
      max_price: 5000,
      ordering: '-popularity_score',
    });
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    let ordering = '-popularity_score';
    
    switch(value) {
      case 'price_asc':
        ordering = 'base_price';
        break;
      case 'price_desc':
        ordering = '-base_price';
        break;
      case 'newest':
        ordering = '-created_at';
        break;
      default:
        ordering = '-popularity_score';
    }
    
    setFilters(prev => ({ ...prev, ordering }));
  };

  const totalPages = Math.ceil(totalCount / 12);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '' && v !== 0 && v !== 5000 && v !== '-popularity_score'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Browse Ring Settings
            </h1>
            <p className="text-gray-600">
              Discover {totalCount} premium settings for your perfect ring
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Style Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Style</h3>
                <div className="space-y-2">
                  {SETTING_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleFilterChange('style_type', style.value)}
                      className={`w-full text-left p-3 border rounded-lg transition-all ${
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
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Metal Type</h3>
                <div className="space-y-2">
                  {METAL_TYPES.map((metal) => (
                    <button
                      key={metal.value}
                      onClick={() => handleFilterChange('metal_type', metal.value)}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                        filters.metal_type === metal.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: metal.color }}
                      />
                      <span className="text-sm font-medium">{metal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Max Price: ${filters.max_price}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.max_price}
                      onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Settings Grid */}
          <div className="flex-1">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="font-medium">
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </span>
              </button>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing {settings.length} of {totalCount} settings
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Settings Grid */}
            {loading ? (
              <Loading />
            ) : settings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">💍</div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                  No settings found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {settings.map((setting) => (
                    <SettingCard key={setting.setting_id} setting={setting} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            {/* Same filters as desktop */}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSettings;