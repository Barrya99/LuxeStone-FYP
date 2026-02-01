// src/pages/Comparison.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { X, ShoppingCart, Eye, Plus, Sparkles } from 'lucide-react';
import { diamondAPI, settingAPI } from '../services/api';
import { formatPrice, formatCarat, getCutBadge, getColorBadge } from '../utils/formatters';
import { useCartStore } from '../store/useCartStore';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Comparison = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  // Get IDs from URL params
  const diamondIds = searchParams.get('diamonds')?.split(',').filter(Boolean) || [];
  const settingIds = searchParams.get('settings')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const fetchedItems = [];

      // Fetch diamonds
      for (const id of diamondIds.slice(0, 3)) {
        try {
          const response = await diamondAPI.getById(id);
          fetchedItems.push({ ...response.data, itemType: 'diamond' });
        } catch (error) {
          console.error(`Error fetching diamond ${id}:`, error);
        }
      }

      // Fetch settings
      for (const id of settingIds.slice(0, 3)) {
        try {
          const response = await settingAPI.getById(id);
          fetchedItems.push({ ...response.data, itemType: 'setting' });
        } catch (error) {
          console.error(`Error fetching setting ${id}:`, error);
        }
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching comparison items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = (item) => {
    addItem({
      type: item.itemType,
      ...(item.itemType === 'diamond' ? { diamond_id: item.diamond_id } : { setting_id: item.setting_id }),
      total_price: item.base_price,
      ...item,
    });
    toast.success('Added to cart');
  };

  if (loading) return <Loading fullScreen />;

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
            No Items to Compare
          </h2>
          <p className="text-gray-600 mb-8">
            Add items to comparison from diamond or setting detail pages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/diamonds">
              <Button size="lg">Browse Diamonds</Button>
            </Link>
            <Link to="/settings">
              <Button size="lg" variant="secondary">Browse Settings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get comparison attributes based on item type
  const isDiamondComparison = items[0]?.itemType === 'diamond';

  const diamondAttributes = [
    { key: 'carat', label: 'Carat Weight', format: (val) => formatCarat(val) },
    { key: 'shape', label: 'Shape' },
    { key: 'cut', label: 'Cut Grade' },
    { key: 'color', label: 'Color Grade' },
    { key: 'clarity', label: 'Clarity Grade' },
    { key: 'table_percent', label: 'Table %', format: (val) => val ? `${val}%` : 'N/A' },
    { key: 'depth_percent', label: 'Depth %', format: (val) => val ? `${val}%` : 'N/A' },
    { key: 'polish', label: 'Polish', format: (val) => val || 'N/A' },
    { key: 'symmetry', label: 'Symmetry', format: (val) => val || 'N/A' },
    { key: 'fluorescence', label: 'Fluorescence', format: (val) => val || 'None' },
    { key: 'certificate_type', label: 'Certificate', format: (val) => val || 'IGI' },
  ];

  const settingAttributes = [
    { key: 'style_type', label: 'Style' },
    { key: 'metal_type', label: 'Metal Type' },
    { key: 'min_carat', label: 'Min Carat', format: (val) => `${val}ct` },
    { key: 'max_carat', label: 'Max Carat', format: (val) => `${val}ct` },
    { key: 'popularity_score', label: 'Popularity', format: (val) => `${val}/100` },
  ];

  const attributes = isDiamondComparison ? diamondAttributes : settingAttributes;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Compare {isDiamondComparison ? 'Diamonds' : 'Settings'}
              </h1>
              <p className="text-gray-600">
                Compare up to 3 items side-by-side
              </p>
            </div>
            <Link to={isDiamondComparison ? '/diamonds' : '/settings'}>
              <Button variant="outline">
                <Plus className="h-5 w-5" />
                Add More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left font-semibold text-gray-900 min-w-[200px]">
                    Specification
                  </th>
                  {items.map((item, index) => (
                    <th key={index} className="px-6 py-4 min-w-[280px]">
                      <div className="relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Item Preview */}
                        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4 mb-4">
                          <div className="w-full h-32 flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-primary-400" />
                          </div>
                        </div>

                        {/* Item Name */}
                        <h3 className="font-display font-bold text-gray-900 mb-2">
                          {isDiamondComparison
                            ? `${formatCarat(item.carat)} ${item.shape}`
                            : item.name
                          }
                        </h3>

                        {/* Price */}
                        <div className="text-2xl font-bold text-primary-600 mb-4">
                          {formatPrice(item.base_price)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            to={isDiamondComparison
                              ? `/diamonds/${item.diamond_id}`
                              : `/settings/${item.setting_id}`
                            }
                            className="flex-1"
                          >
                            <Button size="sm" variant="outline" fullWidth>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            fullWidth
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                  
                  {/* Add placeholder for empty slots */}
                  {[...Array(3 - items.length)].map((_, index) => (
                    <th key={`empty-${index}`} className="px-6 py-4 min-w-[280px]">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Plus className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Add item to compare</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Price Row - Highlighted */}
                <tr className="bg-primary-50 border-b border-gray-200">
                  <td className="sticky left-0 bg-primary-50 px-6 py-4 font-semibold text-gray-900">
                    Price
                  </td>
                  {items.map((item, index) => (
                    <td key={index} className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(item.base_price)}
                      </span>
                    </td>
                  ))}
                  {[...Array(3 - items.length)].map((_, index) => (
                    <td key={`empty-${index}`} className="px-6 py-4"></td>
                  ))}
                </tr>

                {/* Attribute Rows */}
                {attributes.map((attr, attrIndex) => (
                  <tr
                    key={attr.key}
                    className={`border-b border-gray-200 ${
                      attrIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className={`sticky left-0 px-6 py-4 font-medium text-gray-700 ${
                      attrIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      {attr.label}
                    </td>
                    {items.map((item, index) => {
                      const value = item[attr.key];
                      const formattedValue = attr.format ? attr.format(value) : value;
                      
                      return (
                        <td key={index} className="px-6 py-4 text-center">
                          {attr.key === 'cut' ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCutBadge(value)}`}>
                              {formattedValue}
                            </span>
                          ) : attr.key === 'color' ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorBadge(value)}`}>
                              {formattedValue}
                            </span>
                          ) : (
                            <span className="text-gray-900">{formattedValue || 'N/A'}</span>
                          )}
                        </td>
                      );
                    })}
                    {[...Array(3 - items.length)].map((_, index) => (
                      <td key={`empty-${index}`} className="px-6 py-4"></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Winner Badge (if applicable) */}
        {items.length > 1 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Best Value (based on price per carat/features)
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gold-100 text-gold-800 rounded-full font-medium">
              <span className="text-2xl">🏆</span>
              {isDiamondComparison
                ? `${formatCarat(items[0].carat)} ${items[0].shape} - ${formatPrice(items[0].base_price)}`
                : `${items[0].name} - ${formatPrice(items[0].base_price)}`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparison;