import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bike, UtensilsCrossed, MapPin, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart, getRestaurantId } = useCart();

  const [orderType, setOrderType] = useState('DELIVERY'); // DELIVERY or DINE_IN
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullAddress: '',
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  const subtotal = getCartTotal();
  const deliveryFee = orderType === 'DELIVERY' ? 50 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    fetchUserAddresses();
    fetchRestaurantDetails();
  }, []);

  const fetchUserAddresses = async () => {
    try {
      const response = await API.get('/users/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const restaurantId = getRestaurantId();
      if (restaurantId) {
        const response = await API.get(`/restaurants/${restaurantId}`);
        setRestaurant(response.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.fullAddress) {
      alert('Please fill in all address fields');
      return;
    }

    try {
      const response = await API.post('/users/addresses', newAddress);
      setAddresses([...addresses, response.data.address]);
      setSelectedAddress(response.data.address.id);
      setShowNewAddressForm(false);
      setNewAddress({ title: '', fullAddress: '' });
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'DELIVERY' && !selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        restaurantId: getRestaurantId(),
        orderType,
        items: cart.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
        deliveryFee,
        discount: 0,
        specialInstructions,
      };

      const response = await API.post('/orders', orderData);

      // Create payment record
      await API.post('/payments', {
        orderId: response.data.order.id,
        amount: total,
        method: paymentMethod,
      });

      // Clear cart
      clearCart();

      // Navigate to order tracking/success page
      navigate('/orders', { state: { newOrder: response.data.order } });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Cart</span>
          </Link>
          <h1 className="text-4xl font-black text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-black text-gray-900 mb-4">Ordering From</h2>
                <div className="flex items-center space-x-4">
                  <img
                    src={restaurant.logo || '/m7.jpg'}
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Order Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    orderType === 'DELIVERY'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Bike className={`w-8 h-8 mb-3 mx-auto ${orderType === 'DELIVERY' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-bold ${orderType === 'DELIVERY' ? 'text-orange-600' : 'text-gray-700'}`}>
                    Delivery
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Get it delivered to your door</p>
                </button>

                <button
                  onClick={() => setOrderType('DINE_IN')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    orderType === 'DINE_IN'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <UtensilsCrossed className={`w-8 h-8 mb-3 mx-auto ${orderType === 'DINE_IN' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-bold ${orderType === 'DINE_IN' ? 'text-orange-600' : 'text-gray-700'}`}>
                    Dine-In
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Enjoy at the restaurant</p>
                </button>
              </div>
            </div>

            {/* Delivery Address (only for delivery) */}
            {orderType === 'DELIVERY' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-gray-900">Delivery Address</h2>
                  <button
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors"
                  >
                    {showNewAddressForm ? 'Cancel' : '+ Add New'}
                  </button>
                </div>

                {showNewAddressForm && (
                  <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Address Title (e.g., Home, Office)"
                      value={newAddress.title}
                      onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none"
                    />
                    <textarea
                      placeholder="Full Address"
                      value={newAddress.fullAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none resize-none"
                      rows="3"
                    />
                    <button
                      onClick={handleAddAddress}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {addresses.length === 0 && !showNewAddressForm ? (
                    <p className="text-gray-500 text-center py-4">
                      No saved addresses. Please add one.
                    </p>
                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddress === address.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="mt-1 w-5 h-5 text-orange-600"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{address.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="w-5 h-5 text-orange-600"
                  />
                  <Wallet className="w-6 h-6 text-gray-600" />
                  <span className="font-bold text-gray-900">Cash on Delivery/Dine-In</span>
                </label>

                <label className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CHAPA' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CHAPA'}
                    onChange={() => setPaymentMethod('CHAPA')}
                    className="w-5 h-5 text-orange-600"
                  />
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <span className="font-bold text-gray-900">Chapa Payment</span>
                </label>

                <label className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'TELEBIRR' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'TELEBIRR'}
                    onChange={() => setPaymentMethod('TELEBIRR')}
                    className="w-5 h-5 text-orange-600"
                  />
                  <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <span className="font-bold text-gray-900">TeleBirr</span>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Special Instructions (Optional)</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests for your order?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                rows="4"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.food.name}
                    </span>
                    <span className="font-bold text-gray-900">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>

                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-orange-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || (orderType === 'DELIVERY' && !selectedAddress)}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
