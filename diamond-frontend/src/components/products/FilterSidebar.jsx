import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  DIAMOND_SHAPES, 
  DIAMOND_CUTS, 
  DIAMOND_COLORS, 
  DIAMOND_CLARITIES 
} from '../../utils/constants';
import Button from '../common/Button';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    shape: true,
    price: true,
    carat: true,
    cut: true,
    color: true,
    clarity: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ title, id, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {expandedSections[id] ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="mt-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        
        {/* Shape Filter */}
        <FilterSection title="Shape" id="shape">
          <div className="grid grid-cols-2 gap-2">
            {DIAMOND_SHAPES.map((shape) => (
              <button
                key={shape.value}
                onClick={() => onFilterChange('shape', shape.value)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  filters.shape === shape.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{shape.icon}</div>
                {shape.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection title="Price Range" id="price">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Min Price: ${filters.min_price || 0}
              </label>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={filters.min_price || 0}
                onChange={(e) => onFilterChange('min_price', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Max Price: ${filters.max_price || 50000}
              </label>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={filters.max_price || 50000}
                onChange={(e) => onFilterChange('max_price', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
        </FilterSection>

        {/* Carat Range Filter */}
        <FilterSection title="Carat Weight" id="carat">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Min Carat: {filters.min_carat || 0.3}ct
              </label>
              <input
                type="range"
                min="0.3"
                max="5.0"
                step="0.1"
                value={filters.min_carat || 0.3}
                onChange={(e) => onFilterChange('min_carat', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Max Carat: {filters.max_carat || 5.0}ct
              </label>
              <input
                type="range"
                min="0.3"
                max="5.0"
                step="0.1"
                value={filters.max_carat || 5.0}
                onChange={(e) => onFilterChange('max_carat', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
        </FilterSection>

        {/* Cut Filter */}
        <FilterSection title="Cut Quality" id="cut">
          <div className="space-y-2">
            {DIAMOND_CUTS.map((cut) => (
              <label
                key={cut}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name="cut"
                  value={cut}
                  checked={filters.cut === cut}
                  onChange={(e) => onFilterChange('cut', e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{cut}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Color Filter */}
        <FilterSection title="Color Grade" id="color">
          <div className="grid grid-cols-4 gap-2">
            {DIAMOND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onFilterChange('color', color)}
                className={`p-2 border rounded-lg text-sm font-medium transition-all ${
                  filters.color === color
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Clarity Filter */}
        <FilterSection title="Clarity Grade" id="clarity">
          <div className="grid grid-cols-3 gap-2">
            {DIAMOND_CLARITIES.map((clarity) => (
              <button
                key={clarity}
                onClick={() => onFilterChange('clarity', clarity)}
                className={`p-2 border rounded-lg text-xs font-medium transition-all ${
                  filters.clarity === clarity
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {clarity}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply Button - Mobile */}
      <div className="md:hidden p-6 border-t border-gray-200">
        <Button fullWidth onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;