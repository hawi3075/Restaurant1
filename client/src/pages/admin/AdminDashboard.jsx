import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Store, UtensilsCrossed, 
  MapPin, Users, Settings, MessageSquare, 
  ShieldCheck, ChevronDown, ChevronRight, Bike, LogOut, Bell, Headphones, Star, Moon, Sun, Globe, Check, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AdminDashboardHome from './AdminDashboardHome';

// Import admin pages
import AdminCustomersPage from './AdminCustomersPage';
import AdminRestaurantsPage from './AdminRestaurantsPage';
import AdminFoodsPage from './AdminFoodsPage';
import AdminMainCategoriesPage from './AdminMainCategoriesPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminZonesPage from './AdminZonesPage';
import AdminCuisinePage from './AdminCuisinePage';
import AdminAddRestaurantPage from './AdminAddRestaurantPage';
import AdminDeliverymanPage from './AdminDeliverymanPage';
import AdminEmployeeRolePage from './AdminEmployeeRolePage';
import AdminEmployeesPage from './AdminEmployeesPage';
import AdminSupportPage from './AdminSupportPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminReviewsPage from './AdminReviewsPage';
import AdminContactMessagesPage from './AdminContactMessagesPage';
import AdminAiChatPage from './AdminAiChatPage';

function AdminSidebar() {
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
    <aside className="w-72 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 border-r border-gray-800 select-none overflow-y-auto lg:flex hidden">
      
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

        <Link 
          to="/admin/reviews" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
            isActive('/admin/reviews') ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-orange-500" />
          <span>Review Management</span>
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

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800 select-none overflow-y-auto z-50 transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Sidebar Content - Same as Desktop */}
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 bg-gray-950 border-b border-gray-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">ማእድ <span className="text-orange-500 text-xs">Admin</span></span>
              <p className="text-[10px] text-gray-400 font-medium">Management Dashboard</p>
            </div>
          </div>
          {/* Close Button for Mobile */}
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-gray-800 rounded-lg transition lg:hidden"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Mobile Sidebar Navigation - Copy from AdminSidebar */}
        <div className="p-4 shrink-0">
          <input 
            type="text" 
            placeholder="Search Menu..." 
            className="w-full px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex-1 px-3 space-y-1.5 pb-6 text-xs font-medium">
          <Link 
            to="/admin" 
            onClick={closeSidebar}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
              location.pathname === '/admin' ? 'bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/20' : 'hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/admin/pos" 
            onClick={closeSidebar}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition"
          >
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            <span>Point Of Sale</span>
          </Link>
          
          {/* Add more mobile menu items here - copy from AdminSidebar component */}
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 lg:px-8 shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-xl transition lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-black text-gray-900">{t('adminDashboard')}</h2>
            <p className="text-sm text-gray-600">{t('manageRestaurantPlatform')}</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition" title={t('notifications')}>
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-xl transition"
                title="Change Language"
              >
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700 uppercase">{language}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center justify-between ${
                      language === 'en' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇬🇧</span>
                      <span>English</span>
                    </div>
                    {language === 'en' && (
                      <div className="bg-orange-600 text-white p-1 rounded-lg">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('am');
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center justify-between ${
                      language === 'am' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇪🇹</span>
                      <span>አማርኛ</span>
                    </div>
                    {language === 'am' && (
                      <div className="bg-orange-600 text-white p-1 rounded-lg">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('om');
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center justify-between ${
                      language === 'om' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇪🇹</span>
                      <span>Afaan Oromoo</span>
                    </div>
                    {language === 'om' && (
                      <div className="bg-orange-600 text-white p-1 rounded-lg">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                {user.name.charAt(0)}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}