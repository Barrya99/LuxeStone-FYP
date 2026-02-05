import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingCart, Heart, User, Search, 
  Gem, Settings, Home, Layers
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useUserStore } from '../../store/useUserStore';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const favorites = useFavoritesStore((state) => state.favorites);
  const { isAuthenticated, user } = useUserStore();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Diamonds', href: '/diamonds', icon: Gem },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Build Your Ring', href: '/configurator', icon: Layers },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Gem className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
              <div className="absolute inset-0 bg-primary-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-gray-900">
                LuxeStone
              </span>
              <span className="text-xs text-gray-500 -mt-1">Lab-Grown Diamonds</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Search Button - Desktop */}
            <button className="hidden md:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Favorites */}
            <Link 
              to="/account?tab=favorites" 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium text-sm">
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
                <span className="font-medium text-sm">Account</span>
              </Link>
            ) : (
              <Link
                to="/account"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="font-medium text-sm">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">My Account</span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600 text-white"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;