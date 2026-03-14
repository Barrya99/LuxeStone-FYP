// diamond-frontend/src/pages/Account.jsx - FIXED (without useAuthStore)

import { useState, useEffect } from 'react';
import { Heart, Eye, ShoppingCart, LogOut, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { orderAPI } from '../services/api';
import { formatPrice, formatCarat } from '../utils/formatters';
import Button from '../components/common/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const Account = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  
  // FIXED: State for calculated prices
  const [favoritePrices, setFavoritePrices] = useState({});
  const [pricingLoading, setPricingLoading] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchOrders();
    // FIXED: Calculate prices for diamond favorites
    if (favorites.length > 0) {
      calculateFavoritePrices();
    }
  }, [favorites]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.results || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // FIXED: Calculate real prices for diamond favorites
  const calculateFavoritePrices = async () => {
    try {
      const diamondFavorites = favorites.filter(f => f.type === 'diamond');
      const priceMap = {};
      
      for (const fav of diamondFavorites) {
        setPricingLoading(prev => ({
          ...prev,
          [fav.id]: true
        }));

        try {
          const response = await axios.post(
            `${API_BASE_URL}/pricing/calculate-diamond-price/`,
            { diamond_id: fav.id }
          );

          if (response.data.success) {
            priceMap[fav.id] = response.data.calculated_price;
          }
        } catch (error) {
          priceMap[fav.id] = parseFloat(fav.base_price);
        }

        setPricingLoading(prev => {
          const updated = { ...prev };
          delete updated[fav.id];
          return updated;
        });
      }

      setFavoritePrices(priceMap);
    } catch (error) {
      console.error('Error calculating favorite prices:', error);
    }
  };

  // FIXED: Get display price for favorites
  const getDisplayPrice = (favorite) => {
    if (favorite.type === 'diamond') {
      return favoritePrices[favorite.id] || parseFloat(favorite.base_price);
    }
    return favorite.base_price || favorite.total_price;
  };

  const handleAddToCart = (favorite) => {
    const price = getDisplayPrice(favorite);
    addItem({
      type: favorite.type,
      id: favorite.id,
      diamond_id: favorite.type === 'diamond' ? favorite.id : null,
      setting_id: favorite.type === 'setting' ? favorite.id : null,
      total_price: price,
      ...favorite,
    });
    toast.success('Added to cart');
  };

  const handleRemoveFavorite = (id) => {
    removeFavorite(id);
    toast.success('Removed from favorites');
  };

  const handleLogout = () => {
    // Clear auth and redirect
    localStorage.removeItem('auth_token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const ORDER_STATUS = {
    pending: { label: 'Pending', color: 'yellow' },
    confirmed: { label: 'Confirmed', color: 'blue' },
    processing: { label: 'Processing', color: 'purple' },
    shipped: { label: 'Shipped', color: 'indigo' },
    delivered: { label: 'Delivered', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold text-gray-900">My Account</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['orders', 'favorites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab === 'orders' ? 'My Orders' : 'My Favorites'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Order History
              </h2>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Link to="/diamonds">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #</p>
                          <p className="font-semibold text-gray-900">
                            {order.order_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium bg-${
                              ORDER_STATUS[order.status]?.color || 'gray'
                            }-100 text-${
                              ORDER_STATUS[order.status]?.color || 'gray'
                            }-700`}
                          >
                            {ORDER_STATUS[order.status]?.label || order.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-gray-900">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="text-sm text-gray-600 mb-2">
                          {order.items?.length || 0} item(s)
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                My Favorites
              </h2>
              {favorites.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearFavorites}>
                  Clear All
                </Button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No favorites yet</p>
                <Link to="/diamonds">
                  <Button>Browse Diamonds</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-4xl opacity-50">
                        {item.type === 'diamond' ? '💎' : item.type === 'setting' ? '👑' : '💍'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.type === 'diamond' && `${formatCarat(item.carat)} ${item.shape}`}
                          {item.type === 'setting' && item.name}
                          {item.type === 'configuration' && 'Complete Ring'}
                        </h3>

                        {item.type === 'diamond' && (
                          <div className="flex flex-wrap gap-2 mb-3 text-xs mt-2">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {item.cut}
                            </span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                              {item.color}
                            </span>
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                              {item.clarity}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* FIXED: Price */}
                      <div className="text-2xl font-bold text-primary-600">
                        {pricingLoading[item.id] ? (
                          <div className="flex items-center gap-1">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Calculating...</span>
                          </div>
                        ) : (
                          formatPrice(getDisplayPrice(item))
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          fullWidth
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorite(item.id)}
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;