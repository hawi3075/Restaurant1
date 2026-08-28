import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Trash2, Plus, UserPlus, 
  LayoutDashboard, ClipboardList, Layers, Truck, RotateCcw, 
  MapPin, Utensils, Store, Settings, User, Bell, ChevronDown, Check
} from 'lucide-react';
import API from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminPOS() {
  const { deliveryFee: defaultDeliveryFee } = useSettings();
  const [zones, setZones] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('take_away');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchZones();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchRestaurants(selectedZone);
    } else {
      setRestaurants([]);
      setSelectedRestaurant('');
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchCategories(selectedRestaurant);
      fetchFoods(selectedRestaurant);
    } else {
      setCategories([]);
      setFoods([]);
    }
  }, [selectedRestaurant]);

  const fetchZones = async () => {
    try {
      const res = await API.get('/zones');
      setZones(res.data);
    } catch (err) {
      console.error('Error fetching zones:', err);
      // Fallback mock data
      setZones([{ id: '1', name: 'Bole Zone' }, { id: '2', name: 'Adama Center Zone' }]);
    }
  };

  const fetchRestaurants = async (zoneId) => {
    try {
      const res = await API.get(`/restaurants?zoneId=${zoneId}`);
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setRestaurants([{ id: '1', name: 'Bole Traditional Restaurant' }]);
    }
  };

  const fetchCategories = async (restaurantId) => {
    try {
      const res = await API.get(`/restaurants/${restaurantId}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([{ id: '1', name: 'Traditional Food' }, { id: '2', name: 'Beverages' }]);
    }
  };

  const fetchFoods = async (restaurantId, categoryId = '', search = '') => {
    try {
      setLoading(true);
      let url = `/foods?restaurantId=${restaurantId}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (search) url += `&search=${search}`;
      const res = await API.get(url);
      setFoods(res.data);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setFoods([
        { id: 1, name: 'Special Enjera Firfir', price: 120, image: '/m1.webp' },
        { id: 2, name: 'Doro Wat', price: 150, image: '/m7.webp' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/users/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([{ id: '1', name: 'Walk-in Customer', phone: '+251900000000' }]);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users/customers', newCustomer);
      setCustomers([...customers, res.data]);
      setSelectedCustomer(res.data.id);
      setIsCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', email: '' });
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const addToCart = (food) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === food.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === food.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...food, qty: 1, addons: [] }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = 0;
  const deliveryFee = orderType === 'home_delivery' ? (defaultDeliveryFee !== undefined ? defaultDeliveryFee : 50) : 0;
  const vat = subtotal * 0.15;
  const serviceCharge = subtotal * 0.05;
  const extraPackaging = cart.length > 0 ? 10 : 0;
  const total = subtotal - discount + deliveryFee + vat + serviceCharge + extraPackaging;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!selectedRestaurant) return alert('Please select a restaurant');
    try {
      const orderData = {
        restaurantId: selectedRestaurant,
        customerId: selectedCustomer || null,
        orderType,
        items: cart.map(i => ({ foodId: i.id, quantity: i.qty, price: i.price })),
        totalAmount: total,
      };
      await API.post('/orders', orderData);
      alert('Order placed successfully!');
      setCart([]);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1E293B] text-gray-300 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="p-5 flex items-center space-x-3 border-b border-gray-800">
            <div className="bg-orange-600 text-white p-2 rounded-xl font-black text-xl">ማ</div>
            <span className="text-white font-black text-xl tracking-wide">ማእድ <span className="text-orange-500 text-xs">Admin</span></span>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <a href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="/admin/pos" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30">
              <ShoppingCart className="w-5 h-5" />
              <span>Point Of Sale</span>
            </a>

            <div className="pt-4 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 px-4">Order Management</div>
            <a href="/admin/orders" className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <div className="flex items-center space-x-3">
                <ClipboardList className="w-4 h-4" />
                <span>Orders</span>
              </div>
            </a>
            <a href="/admin/dispatch" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <Truck className="w-4 h-4" />
              <span>Dispatch Management</span>
            </a>
            <a href="/admin/refunds" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <RotateCcw className="w-4 h-4" />
              <span>Order Refunds</span>
            </a>

            <div className="pt-4 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 px-4">Restaurant Management</div>
            <a href="/admin/zones" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <MapPin className="w-4 h-4" />
              <span>Zone Setup</span>
            </a>
            <a href="/admin/restaurants" className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <Store className="w-4 h-4" />
              <span>Restaurants</span>
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          ማእድ Admin v1.0.0
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Menu..."
                className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedRestaurant) fetchFoods(selectedRestaurant, selectedCategory, e.target.value);
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 relative">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
              <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Admin User</p>
                <p className="text-[10px] text-gray-500">admin@maad.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* POS CONTENT GRID */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* FOOD SECTION (LEFT 7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center space-x-2 text-gray-900 font-extrabold text-base border-b pb-3">
                <Utensils className="w-5 h-5 text-orange-600" />
                <span>Food Section</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Zone <span className="text-red-500">*</span></label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option value="">Select Zone *</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Restaurant <span className="text-red-500">*</span></label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    disabled={!selectedZone}
                  >
                    <option value="">Select Restaurant *</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Categories</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      fetchFoods(selectedRestaurant, e.target.value, searchQuery);
                    }}
                    disabled={!selectedRestaurant}
                  >
                    <option value="">Select Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Search Food</label>
                  <input
                    type="text"
                    placeholder="Ex: Search Food Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedRestaurant) fetchFoods(selectedRestaurant, selectedCategory, e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* FOOD ITEMS DISPLAY */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
              {!selectedRestaurant ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-3">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                    <Store className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">To get accurate search results, first select a zone, then choose a restaurant.</p>
                  <p className="text-xs text-gray-400">You can then browse food by category or search manually within that restaurant.</p>
                </div>
              ) : loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : foods.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-sm font-medium">No foods available in this restaurant.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => addToCart(food)}
                      className="group bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-orange-500 hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div className="h-28 rounded-lg overflow-hidden bg-gray-200 mb-2">
                        <img 
                          src={food.image || '/m1.webp'} 
                          alt={food.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/m1.webp';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 truncate">{food.name}</h4>
                        <p className="text-sm font-extrabold text-orange-600 mt-1">{food.price} ETB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BILLING SECTION (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-extrabold text-gray-900 text-base">Billing Section</span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition flex items-center space-x-1 shrink-0 shadow-md shadow-orange-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Customer</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700">Select Order Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-2 border p-2.5 rounded-xl cursor-pointer text-xs font-bold transition ${orderType === 'take_away' ? 'border-orange-500 bg-orange-50/50 text-orange-600' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'take_away'}
                      onChange={() => setOrderType('take_away')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>Take Away</span>
                  </label>
                  <label className={`flex items-center space-x-2 border p-2.5 rounded-xl cursor-pointer text-xs font-bold transition ${orderType === 'home_delivery' ? 'border-orange-500 bg-orange-50/50 text-orange-600' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'home_delivery'}
                      onChange={() => setOrderType('home_delivery')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>Home Delivery</span>
                  </label>
                </div>
              </div>

              {/* CART TABLE */}
              <div className="pt-2">
                <div className="grid grid-cols-12 text-[11px] font-extrabold uppercase text-gray-500 border-b pb-2">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-3 text-center">Qty</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-1 text-right">Delete</div>
                </div>

                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto min-h-[140px]">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                      <ShoppingCart className="w-8 h-8 opacity-40" />
                      <p className="text-xs font-medium">No Items added yet</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 items-center py-2.5 text-xs font-medium">
                        <div className="col-span-5 truncate font-bold text-gray-900 pr-2">{item.name}</div>
                        <div className="col-span-3 flex items-center justify-center space-x-1.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded font-bold flex items-center justify-center">-</button>
                          <span className="font-bold">{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded font-bold flex items-center justify-center">+</button>
                        </div>
                        <div className="col-span-3 text-right font-bold text-gray-700">{(item.price * item.qty).toFixed(2)}</div>
                        <div className="col-span-1 text-right">
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5 ml-auto" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BILL SUMMARY */}
              <div className="space-y-2 pt-3 border-t text-xs font-medium text-gray-600">
                <div className="flex justify-between"><span>Addon :</span><span>0.00 ETB</span></div>
                <div className="flex justify-between font-bold text-gray-900"><span>Subtotal :</span><span>ETB {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount :</span><span>- ETB {discount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery fee :</span><span>ETB {deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Vat/tax :</span><span>ETB {vat.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Service Charge :</span><span>ETB {serviceCharge.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Extra Packaging Amount :</span><span>ETB {extraPackaging.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t">
                  <span>Total :</span>
                  <span className="text-orange-600">ETB {total.toFixed(2)}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePlaceOrder}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-orange-600/30 text-center"
                >
                  Place Order
                </button>
                <button
                  onClick={() => setCart([])}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition text-center"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-md shadow-orange-600/30"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 