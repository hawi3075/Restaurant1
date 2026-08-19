import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 50 : 0; // $50 delivery fee
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <h1 className="text-4xl font-black text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cart.length} item(s) in your cart</p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-bold text-sm flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Food Image */}
                  <img
                    src={item.food.image || '/m1.jpg'}
                    alt={item.food.name}
                    className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                  />

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">
                          {item.food.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.food.restaurant?.name || 'Restaurant'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Add-ons */}
                    {item.addons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-bold text-gray-700 mb-1">Add-ons:</p>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {item.addons.map((addon, idx) => (
                            <li key={idx}>
                              • {addon.name} (+${addon.price.toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div className="mb-3">
                        <p className="text-sm font-bold text-gray-700 mb-1">
                          Special Instructions:
                        </p>
                        <p className="text-sm text-gray-600 italic">{item.specialInstructions}</p>
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      {/* Quantity Control */}
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          ${item.itemPrice.toFixed(2)} × {item.quantity}
                        </div>
                        <div className="text-2xl font-black text-orange-600">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-orange-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {!user && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  You'll need to login to complete your order
                </p>
              )}

              {/* Continue Shopping */}
              <Link
                to="/"
                className="block text-center text-orange-600 hover:text-orange-700 font-bold mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
