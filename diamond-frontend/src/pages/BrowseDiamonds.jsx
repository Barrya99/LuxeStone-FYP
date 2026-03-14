// diamond-frontend/src/pages/BrowseDiamonds.jsx

import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { diamondAPI } from '../services/api';
import DiamondCard from '../components/products/DiamondCard';
import FilterSidebar from '../components/products/FilterSidebar';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { 
  DIAMOND_CUTS, DIAMOND_COLORS, DIAMOND_CLARITIES, 
  DIAMOND_SHAPES, SORT_OPTIONS 
} from '../utils/constants';
import toast from 'react-hot-toast';

const BrowseDiamonds = () => {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    cut: '',
    color: '',
    clarity: '',
    shape: '',
    min_price: 0,
    max_price: 10000,
    ordering: '-created_at',
  });

  useEffect(() => {
    fetchDiamonds();
  }, [filters, currentPage]);

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      
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
      [key]: value === prev[key] ? '' : value,
    }));
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      min_price: min,
      max_price: max,
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({
      ...prev,
      ordering: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      cut: '',
      color: '',
      clarity: '',
      shape: '',
      min_price: 0,
      max_price: 10000,
      ordering: '-created_at',
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Diamonds</h1>
          <p className="text-gray-600">
            Explore our collection of {totalCount} lab-grown diamonds with real-time pricing
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceRangeChange}
              onSortChange={handleSortChange}
              onReset={handleResetFilters}
              cuts={DIAMOND_CUTS}
              colors={DIAMOND_COLORS}
              clarities={DIAMOND_CLARITIES}
              shapes={DIAMOND_SHAPES}
              sortOptions={SORT_OPTIONS}
            />
          </div>

          {/* Products */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {diamonds.length} of {totalCount} diamonds
              </span>
              <Button
                variant="outline"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Mobile Filter Sidebar */}
            {mobileFilterOpen && (
              <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onPriceChange={handlePriceRangeChange}
                  onSortChange={handleSortChange}
                  onReset={handleResetFilters}
                  cuts={DIAMOND_CUTS}
                  colors={DIAMOND_COLORS}
                  clarities={DIAMOND_CLARITIES}
                  shapes={DIAMOND_SHAPES}
                  sortOptions={SORT_OPTIONS}
                />
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <Loading />
            ) : diamonds.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {diamonds.map((diamond) => (
                    <DiamondCard key={diamond.diamond_id} diamond={diamond} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'primary' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">No diamonds found matching your criteria.</p>
                <Button
                  variant="primary"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseDiamonds;