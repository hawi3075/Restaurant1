import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { cart, cartLoaded, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { deliveryFee: defaultDeliveryFee } = useSettings();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? (defaultDeliveryFee !== undefined ? defaultDeliveryFee : 50) : 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Function to handle checkout for a specific single cart item row
  const handleItemCheckout = (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If you want to checkout only this specific item, you could handle it or navigate to checkout
    navigate('/checkout');
  };

  // Show a loading state while the cart is being hydrated from localStorage
  // to prevent a false "empty cart" flash before items appear.
  if (!cartLoaded) {
    return (
      <div className="app-page">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="app-page">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">{t('cartEmpty')}</h2>
            <p className="text-gray-600 mb-8">
              {t('cartEmptyHint')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300"
            >
              <span>{t('startShopping')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
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
              <span className="font-medium">{t('continueShopping')}</span>
            </Link>
            <h1 className="text-4xl font-black text-gray-900">{t('shoppingCart')}</h1>
            <p className="text-gray-600 mt-2">{cart.length} {t('itemsInCart')}</p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-bold text-sm flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearCart')}</span>
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
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Food Image */}
                  <img
                    src={item.food.image || '/m1.webp'}
                    alt={item.food.name}
                    className="w-full sm:w-32 h-32 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = '/m1.webp'; }}
                  />

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">
                          {item.food.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.food.restaurant?.name || t('restaurant')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title={t('remove') || 'Remove'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Add-ons */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-bold text-gray-700 mb-1">{t('addons')}:</p>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {item.addons.map((addon, idx) => (
                            <li key={idx}>
                              • {addon.name} (+ETB {addon.price.toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div className="mb-3">
                        <p className="text-sm font-bold text-gray-700 mb-1">
                          {t('specialInstructions')}:
                        </p>
                        <p className="text-sm text-gray-600 italic">{item.specialInstructions}</p>
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                      {/* Quantity Control */}
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>

                      {/* Price & Individual Checkout Button */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">ETB {item.itemPrice.toFixed(2)} × {item.quantity}</div>
                          <div className="text-xl font-black text-orange-600">ETB {item.total.toFixed(2)}</div>
                        </div>

                        {/* Individual Line Item Checkout Button */}
                        <button
                          onClick={() => handleItemCheckout(item)}
                          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md hover:scale-105 cursor-pointer"
                          title={t('checkout') || 'Checkout'}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>{t('checkout') || 'Checkout'}</span>
                        </button>
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
              <h2 className="text-2xl font-black text-gray-900 mb-6">{t('orderSummary')}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold">ETB {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                  <span>{t('deliveryFee')}</span>
                  <span className="font-bold">ETB {deliveryFee.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>{t('discount')}</span>
                    <span className="font-bold">-ETB {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                    <span className="text-3xl font-black text-orange-600">ETB {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{t('proceedToCheckout')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Continue Shopping */}
              <Link
                to="/"
                className="block text-center text-orange-600 hover:text-orange-700 font-bold mt-4 transition-colors"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}