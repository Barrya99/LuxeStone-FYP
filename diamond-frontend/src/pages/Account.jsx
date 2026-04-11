// diamond-frontend/src/pages/Account.jsx

import { useState, useEffect } from 'react';
import { Heart, Eye, ShoppingCart, LogOut, Loader, Package, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { orderAPI } from '../services/api';
import { formatPrice, formatCarat } from '../utils/formatters';
import Button from '../components/common/Button';
import ProductImage from '../components/common/ProductImage';
import toast from 'react-hot-toast';

const ORDER_STATUS_MAP = {
  pending:    { label: 'Pending',    color: 'yellow' },
  confirmed:  { label: 'Confirmed',  color: 'blue'   },
  processing: { label: 'Processing', color: 'purple' },
  shipped:    { label: 'Shipped',    color: 'indigo' },
  delivered:  { label: 'Delivered',  color: 'green'  },
  cancelled:  { label: 'Cancelled',  color: 'red'    },
};

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { diamonds, settings, removeFavorite, clearFavorites, loadFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();

  const [orders, setOrders]             = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab]       = useState('orders');

  const favorites = [
    ...diamonds.map(d => ({ ...d, type: 'diamond', _id: d.diamond_id })),
    ...settings.map(s => ({ ...s, type: 'setting', _id: s.setting_id })),
  ];

  // ── Load orders for the current user only ─────────────────
  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      // /orders/my_orders/ returns only the authenticated user's orders
      const res = await orderAPI.getMyOrders();
      const data = res.data;
      // Handle both paginated { results: [] } and raw array responses
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to view your orders');
        navigate('/login');
      } else {
        toast.error('Failed to load orders');
      }
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddToCart = (item) => {
    addItem({
      type: item.type,
      diamond_id: item.type === 'diamond' ? item.diamond_id : null,
      setting_id: item.type === 'setting' ? item.setting_id : null,
      total_price: item.base_price,
      ...item,
    });
    toast.success('Added to cart');
  };

  const handleRemoveFavorite = async (item) => {
    const result = await removeFavorite(item._id);
    if (result?.success !== false) {
      toast.success('Removed from favorites');
    } else {
      toast.error(result.error || 'Failed to remove');
    }
  };

  const handleLogout = async () => {
    await logout();
    clearFavorites();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                {user?.first_name?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'My Account'}
                </h1>
                {user?.email && (
                  <p className="text-sm text-gray-500">{user.email}</p>
                )}
              </div>
            </div>
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
            {['orders', 'favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab === 'orders' ? (
                  <><Package className="h-5 w-5 inline mr-2" />My Orders</>
                ) : (
                  <><Heart className="h-5 w-5 inline mr-2" />My Favorites ({favorites.length})</>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Order History</h2>

            {loadingOrders ? (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Link to="/diamonds"><Button>Start Shopping</Button></Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.order_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #</p>
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${ORDER_STATUS_MAP[order.status]?.color || 'gray'}-100 text-${ORDER_STATUS_MAP[order.status]?.color || 'gray'}-700`}>
                            {ORDER_STATUS_MAP[order.status]?.label || order.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Items</p>
                          <p className="font-semibold text-gray-900">{order.items?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                        </div>
                      </div>

                      {order.items?.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-sm font-medium text-gray-900 mb-3">Items in Order:</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                                <p className="font-medium">• {item.item_description || 'Ring'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Ring Size: {item.ring_size || 'N/A'} |
                                  Diamond: {formatPrice(item.diamond_price || 0)} |
                                  Setting: {formatPrice(item.setting_price || 0)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-4 pt-4 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatPrice(order.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span>{formatPrice(order.tax_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span>{formatPrice(order.shipping_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
                          <span>Total</span>
                          <span className="text-primary-600">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES TAB ── */}
        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">My Favorites</h2>
              {favorites.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { clearFavorites(); toast.success('Favorites cleared'); }}
                >
                  Clear All
                </Button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No favorites yet.</p>
                <Link to="/diamonds"><Button>Browse Diamonds</Button></Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(item => (
                  <div key={item._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                      <ProductImage 
                        src={item.type === 'diamond' ? item.image_url : (item.image_url || item.thumbnail_url)}
                        alt={item.type === 'diamond' ? `${item.carat}ct ${item.shape}` : item.name}
                        type={item.type === 'diamond' ? 'diamond' : 'setting'}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.type === 'diamond'
                            ? `${formatCarat(item.carat)} ${item.shape}`
                            : item.name}
                        </h3>
                        {item.type === 'diamond' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.cut}</span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{item.color}</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{item.clarity}</span>
                          </div>
                        )}
                        {item.type === 'setting' && (
                          <p className="text-xs text-gray-500 mt-1">{item.style_type} · {item.metal_type}</p>
                        )}
                      </div>
                      <p className="text-xl font-bold text-primary-600">{formatPrice(item.base_price)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" fullWidth onClick={() => handleAddToCart(item)}>
                          <ShoppingCart className="h-4 w-4 mr-1" />Add to Cart
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRemoveFavorite(item)}>
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