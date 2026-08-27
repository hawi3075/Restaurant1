import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Store, UtensilsCrossed, 
  MapPin, Users, Settings, MessageSquare, 
  ShieldCheck, ChevronDown, ChevronRight, Bike, Headphones, Star
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    orders: false,
    restaurants: false,
    food: false,
    delivery: false,
    employees: false
  });

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  return (
    <aside className="w-72 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 border-r border-gray-800 select-none overflow-y-auto shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 bg-gray-950 border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">ማእድ <span className="text-orange-500 text-xs">Admin</span></span>
            <p className="text-[10px] text-gray-400 font-medium">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Search Menu Input */}
      <div className="p-4 shrink-0">
        <input 
          type="text" 
          placeholder="Search Menu..." 
          className="w-full px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
        />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 space-y-1.5 pb-6 text-xs font-medium">
        
        {/* Dashboard */}
        <Link 
          to="/admin" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin') ? 'bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/20' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* Point Of Sale (Direct Link) */}
        <Link 
          to="/admin/pos" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/pos') ? 'bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/20' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          <span>Point Of Sale</span>
        </Link>

        {/* ORDER MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Order Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('orders')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Orders Control</span>
            </div>
            {openMenus.orders ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {openMenus.orders && (
            <div className="pl-9 pr-2 py-1 space-y-1 bg-gray-950/40 rounded-xl my-1">
              <Link to="/admin/orders/all" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">All Orders</Link>
              <Link to="/admin/orders/pending" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">Pending Orders</Link>
            </div>
          )}
        </div>

        {/* RESTAURANT MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Restaurant Management
        </div>

        <Link 
          to="/admin/zones" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/zones') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>Zone Setup</span>
        </Link>

        <Link 
          to="/admin/cuisine" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/cuisine') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          <span>Cuisine</span>
        </Link>

        <div>
          <button 
            onClick={() => toggleMenu('restaurants')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Store className="w-4 h-4 text-orange-500" />
              <span>Restaurants</span>
            </div>
            {openMenus.restaurants ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {openMenus.restaurants && (
            <div className="pl-9 pr-2 py-1 space-y-1 bg-gray-950/40 rounded-xl my-1">
              <Link to="/admin/restaurants/add" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">Add Restaurant</Link>
              <Link to="/admin/restaurants/list" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">Restaurants List</Link>
            </div>
          )}
        </div>

        {/* FOOD MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Food Management
        </div>

        <Link 
          to="/admin/food/categories" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/food/categories') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 text-orange-500" />
          <span>Main Categories</span>
        </Link>

        <Link 
          to="/admin/food/items" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/food/items') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          <span>Foods</span>
        </Link>

        {/* DELIVERYMAN MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Deliveryman Management
        </div>

        <Link 
          to="/admin/delivery/list" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/delivery/list') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4 text-orange-500" />
          <span>Deliveryman</span>
        </Link>

        {/* EMPLOYEE MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Employee Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('employees')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Employees</span>
            </div>
            {openMenus.employees ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {openMenus.employees && (
            <div className="pl-9 pr-2 py-1 space-y-1 bg-gray-950/40 rounded-xl my-1">
              <Link to="/admin/employees/roles" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">Employee Role</Link>
              <Link to="/admin/employees/list" className="block py-1.5 px-2 rounded-lg hover:text-orange-400 transition">Employees List</Link>
            </div>
          )}
        </div>

        {/* CUSTOMER MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Customer Management
        </div>

        <Link 
          to="/admin/customers" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/customers') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-orange-500" />
          <span>Customers</span>
        </Link>

        {/* REVIEW MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Review Management
        </div>

        <Link 
          to="/admin/reviews" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/reviews') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-orange-500" />
          <span>Reviews & Ratings</span>
        </Link>

        {/* HELP & SUPPORT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Help & Support
        </div>

        <Link 
          to="/admin/support/messages" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/support/messages') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Contact Messages</span>
        </Link>

        <Link 
          to="/admin/support/chat" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/support/chat') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4 text-orange-500" />
          <span>Live Support Chat</span>
        </Link>

        {/* SYSTEM SETUP */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          System Setup
        </div>

        <Link 
          to="/admin/settings" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/settings') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-orange-500" />
          <span>Business Setup</span>
        </Link>

      </div>
    </aside>
  );
}