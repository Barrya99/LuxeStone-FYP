// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    // Customer Info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Shipping Address
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'United States',
    
    // Billing Same as Shipping
    billingSameAsShipping: true,
    
    // Payment
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  const subtotal = getTotal();
  const shipping = 0; // Free
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Generate order number
      const generatedOrderNumber = `LUX-${Date.now()}`;

      // Create order (simulated for prototype)
      const orderData = {
        order_number: generatedOrderNumber,
        customer_email: formData.email,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_phone: formData.phone,
        shipping_address_line1: formData.shippingAddress1,
        shipping_address_line2: formData.shippingAddress2,
        shipping_city: formData.shippingCity,
        shipping_state: formData.shippingState,
        shipping_postal_code: formData.shippingZip,
        shipping_country: formData.shippingCountry,
        billing_address_line1: formData.billingSameAsShipping ? formData.shippingAddress1 : formData.shippingAddress1,
        billing_city: formData.shippingCity,
        billing_state: formData.shippingState,
        billing_postal_code: formData.shippingZip,
        billing_country: formData.shippingCountry,
        subtotal: subtotal.toFixed(2),
        tax_amount: tax.toFixed(2),
        shipping_cost: shipping.toFixed(2),
        total_amount: total.toFixed(2),
        payment_method: 'credit_card',
        payment_status: 'completed',
        status: 'confirmed',
        items: items.map(item => ({
          config_id: item.config_id || null,
          diamond_sku: item.diamond?.sku || item.sku,
          setting_sku: item.setting?.sku || '',
          ring_size: item.ring_size || '',
          diamond_price: item.diamond?.base_price || item.base_price || 0,
          setting_price: item.setting?.base_price || 0,
          item_total: item.total_price,
          quantity: 1,
          item_description: `${item.type} - ${item.diamond?.shape || item.shape || ''}`
        }))
      };

      // Submit order
      await orderAPI.create(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success
      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);
      toast.success('Order placed successfully!');

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="text-sm text-gray-600 mb-1">Order Number</div>
              <div className="text-2xl font-bold text-gray-900">{orderNumber}</div>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Order Confirmation Email Sent</div>
                  <div className="text-sm text-gray-600">Check {formData.email} for details</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Estimated Delivery</div>
                  <div className="text-sm text-gray-600">3-5 business days</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" fullWidth onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
              <Button size="lg" variant="secondary" fullWidth onClick={() => navigate('/account')}>
                View Order Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Secure Checkout
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Address Line 1 *</label>
                    <input
                      type="text"
                      name="shippingAddress1"
                      required
                      value={formData.shippingAddress1}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Address Line 2</label>
                    <input
                      type="text"
                      name="shippingAddress2"
                      value={formData.shippingAddress2}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">City *</label>
                      <input
                        type="text"
                        name="shippingCity"
                        required
                        value={formData.shippingCity}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input
                        type="text"
                        name="shippingState"
                        required
                        value={formData.shippingState}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">ZIP Code *</label>
                      <input
                        type="text"
                        name="shippingZip"
                        required
                        value={formData.shippingZip}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-green-600" />
                  <h2 className="font-display text-xl font-bold text-gray-900">
                    Payment Information
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Card Number (Simulated) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="input-field pl-12"
                        placeholder="4242 4242 4242 4242"
                        maxLength="19"
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This is a prototype - no actual payment will be processed
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry Date *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="label">CVV *</label>
                      <input
                        type="text"
                        name="cardCvv"
                        required
                        value={formData.cardCvv}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      required
                      value={formData.cardName}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.type === 'complete_ring' ? 'Complete Ring' : item.shape || item.name}
                        </div>
                        <div className="text-gray-600">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-display text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(total)}</span>
                </div>

                <Button type="submit" size="lg" fullWidth loading={loading}>
                  <Lock className="h-5 w-5" />
                  Place Order
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;