// src/pages/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatPrice, formatCarat } from '../utils/formatters';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart, getTotal } = useCartStore();

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = getTotal();
  const shipping = subtotal > 0 ? 0 : 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Start building your dream ring or browse our collection of diamonds and settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/configurator">
              <Button size="lg">
                <Sparkles className="h-5 w-5" />
                Build Your Ring
              </Button>
            </Link>
            <Link to="/diamonds">
              <Button size="lg" variant="secondary">
                Browse Diamonds
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex gap-6">
                    
                    {/* Image */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-16 w-16 text-primary-400" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold text-gray-900 mb-1">
                            {item.type === 'complete_ring' ? (
                              <>Complete Ring Design</>
                            ) : item.type === 'diamond' ? (
                              <>{formatCarat(item.carat)} {item.shape} Diamond</>
                            ) : (
                              <>{item.name}</>
                            )}
                          </h3>

                          {/* Item Details */}
                          {item.type === 'complete_ring' && (
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Diamond:</span>{' '}
                                {formatCarat(item.diamond?.carat)} {item.diamond?.shape} - {item.diamond?.cut}, {item.diamond?.color}, {item.diamond?.clarity}
                              </div>
                              <div>
                                <span className="font-medium">Setting:</span>{' '}
                                {item.setting?.name} - {item.setting?.metal_type}
                              </div>
                              {item.ring_size && (
                                <div>
                                  <span className="font-medium">Ring Size:</span> {item.ring_size}
                                </div>
                              )}
                            </div>
                          )}

                          {item.type === 'diamond' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {item.cut}
                              </span>
                              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                                {item.color}
                              </span>
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                                {item.clarity}
                              </span>
                            </div>
                          )}

                          {item.type === 'setting' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                                {item.style_type}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {item.metal_type}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/diamonds"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(tax)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t-2 border-gray-200 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-lg font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button size="lg" fullWidth onClick={handleCheckout} className="mb-4">
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Free insured shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Lifetime warranty</span>
                </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;