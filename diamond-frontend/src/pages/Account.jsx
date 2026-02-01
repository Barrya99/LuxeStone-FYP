// src/pages/Account.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Package, Heart, Settings as SettingsIcon, 
  LogOut, Eye, Trash2, ShoppingCart, Sparkles 
} from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useUserStore } from '../store/useUserStore';
import { useCartStore } from '../store/useCartStore';
import { orderAPI } from '../services/api';
import { formatPrice, formatCarat, formatDate } from '../utils/formatters';
import { ORDER_STATUS } from '../utils/constants';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Account = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const { isAuthenticated, user, logout } = useUserStore();
  const { favorites, removeFavorite, clearFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // For demo purposes - simulate authentication
  const [showLoginForm, setShowLoginForm] = useState(!isAuthenticated);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      // For demo, we'll fetch all orders since we don't have user auth
      const response = await orderAPI.getAll({ ordering: '-created_at' });
      setOrders(response.data.results || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    const { login } = useUserStore.getState();
    login({
      user_id: 1,
      email: loginData.email,
      first_name: 'John',
      last_name: 'Doe',
    });
    setShowLoginForm(false);
    toast.success('Welcome back!');
  };

  const handleLogout = () => {
    logout();
    clearFavorites();
    setShowLoginForm(true);
    toast.success('Logged out successfully');
  };

  const handleRemoveFavorite = (id) => {
    removeFavorite(id);
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (item) => {
    addItem(item);
    toast.success('Added to cart');
  };

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Login Form
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to access your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" size="lg" fullWidth>
                Sign In
              </Button>

              <p className="text-sm text-gray-600 text-center">
                Demo account - use any email/password
              </p>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button className="text-primary-600 hover:underline font-medium">
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Account Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                My Account
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.first_name || 'there'}!
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-xl border border-gray-200 p-2 sticky top-24">
              {[
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'profile', label: 'Profile Settings', icon: SettingsIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                  Order History
                </h2>

                {loadingOrders ? (
                  <Loading />
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Button onClick={() => navigate('/diamonds')}>
                      Browse Diamonds
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Order #{order.order_number}
                              </div>
                              <div className="text-sm text-gray-600">
                                Placed on {formatDate(order.created_at)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'delivered' 
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {ORDER_STATUS[order.status]?.label || order.status}
                              </span>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Total</div>
                                <div className="font-bold text-gray-900">
                                  {formatPrice(order.total_amount)}
                                </div>
                              </div>
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
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                      No Favorites Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Save your favorite items to access them quickly
                    </p>
                    <Button onClick={() => navigate('/diamonds')}>
                      Browse Diamonds
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-blue-100">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-24 w-24 text-primary-400" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-display font-bold text-gray-900 mb-2">
                            {item.type === 'diamond' && `${formatCarat(item.carat)} ${item.shape} Diamond`}
                            {item.type === 'setting' && item.name}
                            {item.type === 'configuration' && 'Complete Ring'}
                          </h3>

                          {item.type === 'diamond' && (
                            <div className="flex flex-wrap gap-2 mb-3 text-xs">
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

                          <div className="text-2xl font-bold text-gray-900 mb-4">
                            {formatPrice(item.base_price || item.total_price)}
                          </div>

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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                  Profile Settings
                </h2>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">First Name</label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user?.first_name}
                        />
                      </div>
                      <div>
                        <label className="label">Last Name</label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user?.last_name}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        defaultValue={user?.email}
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Current Password</label>
                      <input type="password" className="input-field" />
                    </div>
                    <div>
                      <label className="label">New Password</label>
                      <input type="password" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Confirm New Password</label>
                      <input type="password" className="input-field" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;