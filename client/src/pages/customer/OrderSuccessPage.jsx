import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, MapPin, Receipt, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const status = searchParams.get('status') || 'success';
  const txRef = searchParams.get('tx_ref') || searchParams.get('txRef');
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      if (txRef && id) {
        // Double guarantee: trigger verification call if coming back from payment
        try {
          await API.get(`/payments/verify/${txRef}?orderId=${id}&format=json`);
        } catch (e) {
          console.log('Verification check notice:', e.message);
        }
      }
      const res = await API.get('/orders');
      const found = res.data.find((o) => o.id === id);
      if (found) {
        setOrder(found);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = status === 'success' || !status;

  return (
    <div className="app-page min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {isSuccess ? (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                <CheckCircle2 className="w-14 h-14" />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  Payment & Order Confirmed! 🎉
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Thank you! Your order has been placed and sent directly to the kitchen.
                </p>
              </div>

              {txRef && (
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs font-mono text-gray-600">
                  <Receipt className="w-4 h-4 text-orange-500" />
                  <span>Transaction Ref: {txRef}</span>
                </div>
              )}

              {loading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : order ? (
                <div className="bg-orange-50/60 rounded-2xl p-6 text-left border border-orange-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-orange-200/60 pb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Order ID</span>
                      <p className="font-black text-gray-900 text-lg">#{order.id.slice(0, 8)}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                      CONFIRMED & SENT TO CHEF
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Order Type</p>
                      <p className="font-bold text-gray-800">
                        {order.orderType === 'DELIVERY' ? '🚚 Delivery' : '🍽️ Dine-In'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Total Amount</p>
                      <p className="font-black text-orange-600 text-lg">ETB {order.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="pt-2">
                      <p className="text-gray-500 font-medium text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" /> Delivery Address
                      </p>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="pt-3 border-t border-orange-200/60">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Items Ordered</p>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-800 font-medium">
                              {item.quantity}x {item.food?.name}
                            </span>
                            <span className="font-bold text-gray-900">
                              ETB {(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-600/25 transition-all text-base"
                >
                  <Clock className="w-5 h-5" />
                  <span>Track Live Order</span>
                </Link>
                <Link
                  to="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-8 py-4 rounded-2xl transition-all text-base"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order More</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-14 h-14" />
              </div>

              <div>
                <h1 className="text-3xl font-black text-gray-900">Payment Could Not Be Completed</h1>
                <p className="text-gray-600 mt-2">
                  There was an issue processing your payment with Chapa. Please try again or choose cash payment.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all"
                >
                  Return to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
