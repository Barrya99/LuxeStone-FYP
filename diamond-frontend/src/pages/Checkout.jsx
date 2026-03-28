// diamond-frontend/src/pages/Checkout.jsx
// Replace your entire existing Checkout.jsx with this file.
// Key change: the order-complete screen now shows an email confirmation notice.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Mail, Package, Clock } from 'lucide-react';
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
  const [orderData, setOrderData] = useState(null);

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

      const payload = {
        order_number:           generatedOrderNumber,
        customer_email:         formData.email,
        customer_first_name:    formData.firstName,
        customer_last_name:     formData.lastName,
        customer_phone:         formData.phone,
        shipping_address_line1: formData.shippingAddress1,
        shipping_address_line2: formData.shippingAddress2,
        shipping_city:          formData.shippingCity,
        shipping_state:         formData.shippingState,
        shipping_postal_code:   formData.shippingZip,
        shipping_country:       formData.shippingCountry,
        billing_address_line1:  formData.shippingAddress1,
        billing_city:           formData.shippingCity,
        billing_state:          formData.shippingState,
        billing_postal_code:    formData.shippingZip,
        billing_country:        formData.shippingCountry,
        subtotal:               subtotal.toFixed(2),
        tax_amount:             tax.toFixed(2),
        shipping_cost:          '0.00',
        total_amount:           total.toFixed(2),
        payment_method:         'credit_card',
        payment_status:         'completed',
        status:                 'confirmed',
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

      const res = await orderAPI.create(payload);
      clearCart();
      setOrderData({
        orderNumber: generatedOrderNumber,
        email: formData.email,
        firstName: formData.firstName,
        total,
        status: 'confirmed',
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
      });
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
  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Success banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-11 w-11 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Order Confirmed!</h1>
              <p className="text-green-100 text-sm">Thank you for your purchase, {orderData.firstName}.</p>
            </div>

            {/* Order details */}
            <div className="px-8 py-6 space-y-4">

              {/* Order number */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Order number</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">{orderData.orderNumber}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                </span>
              </div>

              {/* Email confirmation notice */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-900 text-sm mb-1">
                      Confirmation email sent
                    </p>
                    <p className="text-primary-700 text-xs leading-relaxed">
                      A detailed order confirmation has been sent to{' '}
                      <span className="font-semibold">{orderData.email}</span>.
                      It includes your order summary, shipping address, and a link to track your order.
                    </p>
                    <p className="text-primary-500 text-xs mt-2">
                      Didn't receive it? Check your spam folder or{' '}
                      <a href="mailto:hello@luxestone.com" className="underline">contact us</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Follow-up notice */}
              <div className="flex items-start gap-3 px-2">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  You'll receive a follow-up email in ~24 hours with your order status update.
                </p>
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total charged</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(orderData.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex flex-col gap-3">
              <Button size="lg" fullWidth onClick={() => navigate('/account')}>
                View My Orders
              </Button>
              <Button size="lg" variant="outline" fullWidth onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">What happens next?</h3>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Confirmation email sent to your inbox right now.' },
                { step: '2', text: 'Our team prepares and inspects your ring (1–2 business days).' },
                { step: '3', text: 'Insured shipping dispatched — tracking link emailed to you.' },
                { step: '4', text: '24-hour follow-up email with your status update.' },
              ].map(item => (
                <li key={item.step} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </span>
                  {item.text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form (unchanged from your original) ───────────
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
                    <label className="label">Email * <span className="text-xs text-gray-400 font-normal">(confirmation sent here)</span></label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Address Line 1 *</label>
                    <input type="text" name="shippingAddress1" required value={formData.shippingAddress1} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Address Line 2</label>
                    <input type="text" name="shippingAddress2" value={formData.shippingAddress2} onChange={handleChange} className="input-field" placeholder="Apt, suite… (optional)" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div><label className="label">City *</label><input type="text" name="shippingCity" required value={formData.shippingCity} onChange={handleChange} className="input-field" /></div>
                    <div><label className="label">State *</label><input type="text" name="shippingState" required value={formData.shippingState} onChange={handleChange} className="input-field" /></div>
                    <div><label className="label">ZIP *</label><input type="text" name="shippingZip" required value={formData.shippingZip} onChange={handleChange} className="input-field" /></div>
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
                      <input type="text" name="cardNumber" required value={formData.cardNumber} onChange={handleChange} className="input-field pl-12" placeholder="4242 4242 4242 4242" maxLength="19" />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="label">Expiry *</label><input type="text" name="cardExpiry" required value={formData.cardExpiry} onChange={handleChange} className="input-field" placeholder="MM/YY" maxLength="5" /></div>
                    <div><label className="label">CVV *</label><input type="text" name="cardCvv" required value={formData.cardCvv} onChange={handleChange} className="input-field" placeholder="123" maxLength="4" /></div>
                  </div>
                  <div>
                    <label className="label">Cardholder Name *</label>
                    <input type="text" name="cardName" required value={formData.cardName} onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-medium text-green-600">FREE</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span className="font-medium text-gray-900">{formatPrice(tax)}</span></div>
                </div>
                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-display text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(total)}</span>
                </div>

                {/* Email reminder */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    A confirmation email will be sent to <strong>{formData.email || 'your email'}</strong> after placing your order.
                  </p>
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