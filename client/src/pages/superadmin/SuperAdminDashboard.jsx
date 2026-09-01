import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Store, UtensilsCrossed, 
  MapPin, Users, Settings, MessageSquare, 
  ShieldCheck, ChevronDown, ChevronRight, Bike, LogOut, Bell, Headphones, Star, Menu, X, Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';

// Import admin pages (reuse)
import AdminDashboardHome from '../admin/AdminDashboardHome';
import AdminCustomersPage from '../admin/AdminCustomersPage';
import AdminRestaurantsPage from '../admin/AdminRestaurantsPage';
import AdminFoodsPage from '../admin/AdminFoodsPage';
import AdminMainCategoriesPage from '../admin/AdminMainCategoriesPage';
import AdminOrdersPage from '../admin/AdminOrdersPage';
import AdminZonesPage from '../admin/AdminZonesPage';
import AdminCuisinePage from '../admin/AdminCuisinePage';
import AdminAddRestaurantPage from '../admin/AdminAddRestaurantPage';
import AdminDeliverymanPage from '../admin/AdminDeliverymanPage';
import AdminEmployeeRolePage from '../admin/AdminEmployeeRolePage';
import AdminEmployeesPage from '../admin/AdminEmployeesPage';
import AdminSupportPage from '../admin/AdminSupportPage';
import AdminSettingsPage from '../admin/AdminSettingsPage';
import AdminReviewsPage from '../admin/AdminReviewsPage';
import AdminContactMessagesPage from '../admin/AdminContactMessagesPage';
import AdminAiChatPage from '../admin/AdminAiChatPage';
import AdminProfile from '../admin/AdminProfile';

// Import super admin specific pages
import SuperAdminManageAdmins from './SuperAdminManageAdmins';
import SuperAdminSystemSettings from './SuperAdminSystemSettings';

function SuperAdminSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    orders: false,
    restaurants: false,
    food: false,
    delivery: false,
    employees: false,
    superadmin: false
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => {
    if (path === '/superadmin') {
      return location.pathname === '/superadmin' || location.pathname === '/superadmin/';
    }
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 bg-gradient-to-r from-purple-900 to-purple-800 border-b border-purple-700 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white p-2.5 rounded-xl shadow-lg">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">ማእድ <span className="text-amber-400 text-xs">Super Admin</span></span>
            <p className="text-[10px] text-purple-200 font-medium">System Control Panel</p>
          </div>
        </div>
      </div>

      {/* Search Menu Input */}
      <div className="p-4 shrink-0">
        <input 
          type="text" 
          placeholder="Search Menu..." 
          className="w-full px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 space-y-1.5 pb-6 text-xs font-medium overflow-y-auto">
        
        {/* Dashboard */}
        <Link 
          to="/superadmin" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin') ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold shadow-lg' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* SUPER ADMIN MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400">
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Super Admin</span>
          </div>
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('superadmin')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer text-gray-300"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4" />
              <span>System Management</span>
            </div>
            {openMenus.superadmin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openMenus.superadmin && (
            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
              <Link 
                to="/superadmin/manage-admins" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  isActive('/superadmin/manage-admins') ? 'bg-purple-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Admins</span>
              </Link>
              <Link 
                to="/superadmin/system-settings" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  isActive('/superadmin/system-settings') ? 'bg-purple-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>System Settings</span>
              </Link>
            </div>
          )}
        </div>

        {/* ORDER MANAGEMENT */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Order Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('orders')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer text-gray-300"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Control</span>
            </div>
            {openMenus.orders ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openMenus.orders && (
            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
              <Link 
                to="/superadmin/orders/all" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/orders/all' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>All Orders</span>
              </Link>
              <Link 
                to="/superadmin/orders/pending" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/orders/pending' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>Pending Orders</span>
              </Link>
            </div>
          )}
        </div>

        {/* RESTAURANT MANAGEMENT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Restaurant Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('restaurants')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer text-gray-300"
          >
            <div className="flex items-center space-x-3">
              <Store className="w-4 h-4" />
              <span>Restaurants</span>
            </div>
            {openMenus.restaurants ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openMenus.restaurants && (
            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
              <Link 
                to="/superadmin/zones" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  isActive('/superadmin/zones') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Zone Setup</span>
              </Link>
              <Link 
                to="/superadmin/cuisine" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  isActive('/superadmin/cuisine') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>Cuisine Types</span>
              </Link>
              <Link 
                to="/superadmin/restaurants/list" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/restaurants/list' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>All Restaurants</span>
              </Link>
            </div>
          )}
        </div>

        {/* FOOD MANAGEMENT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Food Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('food')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer text-gray-300"
          >
            <div className="flex items-center space-x-3">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Food Catalog</span>
            </div>
            {openMenus.food ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openMenus.food && (
            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
              <Link 
                to="/superadmin/food/categories" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/food/categories' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>Main Categories</span>
              </Link>
              <Link 
                to="/superadmin/food/items" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/food/items' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>Food Items</span>
              </Link>
            </div>
          )}
        </div>

        {/* DELIVERYMAN MANAGEMENT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Deliveryman Management
        </div>

        <Link 
          to="/superadmin/delivery/list" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            location.pathname === '/superadmin/delivery/list' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Delivery Staff</span>
        </Link>

        {/* EMPLOYEE MANAGEMENT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Employee Management
        </div>

        <div>
          <button 
            onClick={() => toggleMenu('employees')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer text-gray-300"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </div>
            {openMenus.employees ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openMenus.employees && (
            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
              <Link 
                to="/superadmin/employees/roles" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/employees/roles' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>Employee Roles</span>
              </Link>
              <Link 
                to="/superadmin/employees/list" 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                  location.pathname === '/superadmin/employees/list' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>All Employees</span>
              </Link>
            </div>
          )}
        </div>

        {/* CUSTOMER MANAGEMENT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Customer Management
        </div>

        <Link 
          to="/superadmin/customers" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin/customers') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers</span>
        </Link>

        <Link 
          to="/superadmin/reviews" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin/reviews') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews</span>
        </Link>

        {/* HELP & SUPPORT */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Help & Support
        </div>

        <Link 
          to="/superadmin/support" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin/support') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Center</span>
        </Link>

        <Link 
          to="/superadmin/chat" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin/chat') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant</span>
        </Link>

        {/* SYSTEM SETUP */}
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          System Setup
        </div>

        <Link 
          to="/superadmin/settings" 
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/superadmin/settings') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 border-r border-gray-800 select-none overflow-y-auto lg:flex hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-5 left-4 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2.5 rounded-xl shadow-lg hover:shadow-xl transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="relative w-72 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800 select-none overflow-y-auto animate-slideInLeft">
            {/* Close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-6 right-4 z-10 bg-gray-800 text-gray-300 p-2 rounded-xl hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  // Check if user is SUPER_ADMIN
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Super Admin Dashboard" />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />

            {/* Super Admin Specific */}
            <Route path="/manage-admins" element={<SuperAdminManageAdmins />} />
            <Route path="/system-settings" element={<SuperAdminSystemSettings />} />

            {/* Order Management */}
            <Route path="/orders/all" element={<AdminOrdersPage filter="all" />} />
            <Route path="/orders/pending" element={<AdminOrdersPage filter="pending" />} />

            {/* Restaurant Management */}
            <Route path="/zones" element={<AdminZonesPage />} />
            <Route path="/cuisine" element={<AdminCuisinePage />} />
            <Route path="/restaurants/add" element={<AdminAddRestaurantPage />} />
            <Route path="/restaurants/edit/:id" element={<AdminAddRestaurantPage />} />
            <Route path="/restaurants/list" element={<AdminRestaurantsPage />} />

            {/* Food Management */}
            <Route path="/food/categories" element={<AdminMainCategoriesPage />} />
            <Route path="/food/items" element={<AdminFoodsPage />} />

            {/* Deliveryman Management */}
            <Route path="/delivery/list" element={<AdminDeliverymanPage />} />

            {/* Employee Management */}
            <Route path="/employees/roles" element={<AdminEmployeeRolePage />} />
            <Route path="/employees/list" element={<AdminEmployeesPage />} />

            {/* Customer Management */}
            <Route path="/customers" element={<AdminCustomersPage />} />
            <Route path="/reviews" element={<AdminReviewsPage />} />

            {/* Help & Support */}
            <Route path="/support/messages" element={<AdminContactMessagesPage />} />
            <Route path="/support/chat" element={<AdminAiChatPage />} />
            <Route path="/support" element={<AdminContactMessagesPage />} />
            <Route path="/chat" element={<AdminAiChatPage />} />

            {/* System Setup */}
            <Route path="/settings" element={<AdminSettingsPage />} />
            <Route path="/profile" element={<AdminProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/superadmin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
