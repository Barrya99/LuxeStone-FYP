// diamond-frontend/src/pages/Checkout.jsx
// Orders are created with the authenticated user attached automatically
// by the backend (perform_create sets user=request.user).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'United States',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  const subtotal = getTotal();
  const tax      = subtotal * 0.08;
  const total    = subtotal + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.shippingAddress1) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const generatedOrderNumber = `LUX-${Date.now()}`;

      // The backend attaches request.user automatically (perform_create).
      // We only need to send the order details.
      const orderData = {
        order_number:          generatedOrderNumber,
        customer_email:        formData.email,
        customer_first_name:   formData.firstName,
        customer_last_name:    formData.lastName,
        customer_phone:        formData.phone,
        shipping_address_line1: formData.shippingAddress1,
        shipping_address_line2: formData.shippingAddress2,
        shipping_city:         formData.shippingCity,
        shipping_state:        formData.shippingState,
        shipping_postal_code:  formData.shippingZip,
        shipping_country:      formData.shippingCountry,
        billing_address_line1: formData.shippingAddress1,
        billing_city:          formData.shippingCity,
        billing_state:         formData.shippingState,
        billing_postal_code:   formData.shippingZip,
        billing_country:       formData.shippingCountry,
        subtotal:              subtotal.toFixed(2),
        tax_amount:            tax.toFixed(2),
        shipping_cost:         '0.00',
        total_amount:          total.toFixed(2),
        payment_method:        'credit_card',
        payment_status:        'completed',
        status:                'confirmed',
        items: items.map(item => ({
          config_id:        item.config_id || null,
          diamond_sku:      item.diamond?.sku || item.sku || '',
          setting_sku:      item.setting?.sku || '',
          ring_size:        item.ring_size || '',
          diamond_price:    item.diamond?.base_price || item.base_price || 0,
          setting_price:    item.setting?.base_price || 0,
          item_total:       item.total_price,
          quantity:         1,
          item_description: `${item.type} – ${item.diamond?.shape || item.shape || item.name || ''}`,
        })),
      };

      await orderAPI.create(orderData);
      clearCart();
      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error('Checkout error:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to place an order');
        navigate('/login');
      } else {
        toast.error('Failed to complete order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  // ── Order complete screen ──────────────────────────────────
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-8">Thank you for your purchase.</p>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="text-sm text-gray-600 mb-1">Order Number</div>
              <div className="text-2xl font-bold text-gray-900">{orderNumber}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" fullWidth onClick={() => navigate('/')}>Continue Shopping</Button>
              <Button size="lg" variant="secondary" fullWidth onClick={() => navigate('/account')}>
                View My Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-display text-3xl font-bold text-gray-900">Secure Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left: form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" name="email" required value={formData.email}
                      onChange={handleChange} className="input-field" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input type="text" name="firstName" required value={formData.firstName}
                        onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName}
                        onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Address Line 1 *</label>
                    <input type="text" name="shippingAddress1" required value={formData.shippingAddress1}
                      onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Address Line 2</label>
                    <input type="text" name="shippingAddress2" value={formData.shippingAddress2}
                      onChange={handleChange} className="input-field" placeholder="Apt, suite… (optional)" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">City *</label>
                      <input type="text" name="shippingCity" required value={formData.shippingCity}
                        onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input type="text" name="shippingState" required value={formData.shippingState}
                        onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">ZIP *</label>
                      <input type="text" name="shippingZip" required value={formData.shippingZip}
                        onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-green-600" />
                  <h2 className="font-display text-xl font-bold text-gray-900">Payment (Simulated)</h2>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                  This is a prototype. No real payment is processed.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Card Number *</label>
                    <div className="relative">
                      <input type="text" name="cardNumber" required value={formData.cardNumber}
                        onChange={handleChange} className="input-field pl-12"
                        placeholder="4242 4242 4242 4242" maxLength="19" />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry *</label>
                      <input type="text" name="cardExpiry" required value={formData.cardExpiry}
                        onChange={handleChange} className="input-field" placeholder="MM/YY" maxLength="5" />
                    </div>
                    <div>
                      <label className="label">CVV *</label>
                      <input type="text" name="cardCvv" required value={formData.cardCvv}
                        onChange={handleChange} className="input-field" placeholder="123" maxLength="4" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Cardholder Name *</label>
                    <input type="text" name="cardName" required value={formData.cardName}
                      onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span><span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span><span className="font-medium text-gray-900">{formatPrice(tax)}</span>
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
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;