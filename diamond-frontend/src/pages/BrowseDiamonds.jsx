import { useState, useEffect } from 'react';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { diamondAPI } from '../services/api';
import DiamondCard from '../components/products/DiamondCard';
import FilterSidebar from '../components/products/FilterSidebar';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { SORT_OPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

const BrowseDiamonds = () => {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    shape: '',
    cut: '',
    color: '',
    clarity: '',
    min_price: 0,
    max_price: 50000,
    min_carat: 0.3,
    max_carat: 5.0,
    ordering: '-created_at',
  });

  useEffect(() => {
    fetchDiamonds();
  }, [filters, currentPage]);

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        page: currentPage,
        page_size: 12,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await diamondAPI.getAll(params);
      setDiamonds(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching diamonds:', error);
      toast.error('Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === prev[key] ? '' : value, // Toggle if same value
    }));
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      shape: '',
      cut: '',
      color: '',
      clarity: '',
      min_price: 0,
      max_price: 50000,
      min_carat: 0.3,
      max_carat: 5.0,
      ordering: '-created_at',
    });
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    let ordering = '-created_at';
    
    switch(value) {
      case 'price_asc':
        ordering = 'base_price';
        break;
      case 'price_desc':
        ordering = '-base_price';
        break;
      case 'carat_asc':
        ordering = 'carat';
        break;
      case 'carat_desc':
        ordering = '-carat';
        break;
      case 'newest':
        ordering = '-created_at';
        break;
      default:
        ordering = '-created_at';
    }
    
    setFilters(prev => ({ ...prev, ordering }));
  };

  const totalPages = Math.ceil(totalCount / 12);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '' && v !== 0 && v !== 50000 && v !== 0.3 && v !== 5.0 && v !== '-created_at'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Browse Lab-Grown Diamonds
              </h1>
              <p className="text-gray-600">
                Discover {totalCount} ethically sourced, certified diamonds
              </p>
            </div>

            {/* View Mode Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Products Grid */}
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
                Showing {diamonds.length} of {totalCount} diamonds
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={SORT_OPTIONS.find(opt => {
                    if (opt.value === 'price_asc') return filters.ordering === 'base_price';
                    if (opt.value === 'price_desc') return filters.ordering === '-base_price';
                    if (opt.value === 'carat_asc') return filters.ordering === 'carat';
                    if (opt.value === 'carat_desc') return filters.ordering === '-carat';
                    if (opt.value === 'newest') return filters.ordering === '-created_at';
                    return false;
                  })?.value || 'newest'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <Loading />
            ) : diamonds.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                  No diamonds found
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
                <div className={`grid gap-6 mb-8 ${
                  viewMode === 'grid' 
                    ? 'sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {diamonds.map((diamond) => (
                    <DiamondCard key={diamond.diamond_id} diamond={diamond} />
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
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseDiamonds;