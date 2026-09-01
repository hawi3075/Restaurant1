import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';

// Import Pages & Portals
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import CustomerHome from './pages/customer/CustomerHome';
import CategoriesPage from './pages/customer/CategoriesPage';
import AboutUsPage from './pages/customer/AboutUsPage';
import ContactPage from './pages/customer/ContactPage';
import RestaurantListPage from './pages/customer/RestaurantListPage';
import RestaurantDetailsPage from './pages/customer/RestaurantDetailsPage';
import FoodDetailsPage from './pages/customer/FoodDetailsPage';
import MenuPage from './pages/customer/MenuPage';

// Import New Customer Drawer Pages
import Profile from './pages/customer/Profile';
import Address from './pages/customer/Address';
import OrdersPage from './pages/customer/OrdersPage';
import Language from './pages/customer/Language';
import Chat from './pages/customer/Chat';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';

// Import Admin Dashboard, POS & Staff Portals
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPOS from './pages/admin/AdminPOS';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ChefDashboard from './pages/chef/ChefDashboard';
import ChefDashboardHome from './pages/chef/ChefDashboardHome';
import ChefOrdersAll from './pages/chef/ChefOrdersAll';
import ChefOrdersNew from './pages/chef/ChefOrdersNew';
import ChefOrdersCooking from './pages/chef/ChefOrdersCooking';
import ChefOrdersDineIn from './pages/chef/ChefOrdersDineIn';
import ChefOrdersDelivery from './pages/chef/ChefOrdersDelivery';
import ChefAddFood from './pages/chef/ChefAddFood';
import ChefProfile from './pages/chef/ChefProfile';
import ChefChat from './pages/chef/ChefChat';
import ChefSupport from './pages/chef/ChefSupport';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import WaiterDashboardHome from './pages/waiter/WaiterDashboardHome';
import WaiterOrdersNew from './pages/waiter/WaiterOrdersNew';
import WaiterOrdersCooking from './pages/waiter/WaiterOrdersCooking';
import WaiterOrdersReady from './pages/waiter/WaiterOrdersReady';
import WaiterNewOrder from './pages/waiter/WaiterNewOrder';
import WaiterProfile from './pages/waiter/WaiterProfile';
import WaiterChat from './pages/waiter/WaiterChat';
import WaiterSupport from './pages/waiter/WaiterSupport';
import WaiterMyOrders from './pages/waiter/WaiterMyOrders';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverDashboardHome from './pages/driver/DriverDashboardHome';
import DriverOrdersNew from './pages/driver/DriverOrdersNew';
import DriverOrdersOnWay from './pages/driver/DriverOrdersOnWay';
import DriverOrdersDelivered from './pages/driver/DriverOrdersDelivered';
import DriverManualOrder from './pages/driver/DriverManualOrder';
import DriverMyDeliveries from './pages/driver/DriverMyDeliveries';
import DriverProfile from './pages/driver/DriverProfile';
import DriverChat from './pages/driver/DriverChat';
import DriverSupport from './pages/driver/DriverSupport';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <CartProvider>
                  <SettingsProvider>
                    <Router>
                      <Routes>
                      {/* Public Authentication Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* Customer Portal & Pages */}
                      <Route path="/" element={<CustomerHome />} />
                      <Route path="/restaurants" element={<RestaurantListPage />} />
                      <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                      <Route path="/food/:id" element={<FoodDetailsPage />} />
                      <Route path="/foods/:id" element={<FoodDetailsPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/categories/:id" element={<CategoriesPage />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/about" element={<AboutUsPage />} />
                      <Route path="/contact" element={<ContactPage />} />

                      {/* Customer Menu Drawer Routes */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/address" element={<Address />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/language" element={<Language />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />

                      {/* Staff Portals */}
                      <Route path="/chef" element={<ChefDashboard />}>
                        <Route index element={<ChefDashboardHome />} />
                        <Route path="orders/all" element={<ChefOrdersAll />} />
                        <Route path="orders/new" element={<ChefOrdersNew />} />
                        <Route path="orders/cooking" element={<ChefOrdersCooking />} />
                        <Route path="orders/dine-in" element={<ChefOrdersDineIn />} />
                        <Route path="orders/delivery" element={<ChefOrdersDelivery />} />
                        <Route path="add-food" element={<ChefAddFood />} />
                        <Route path="profile" element={<ChefProfile />} />
                        <Route path="chat" element={<ChefChat />} />
                        <Route path="support" element={<ChefSupport />} />
                      </Route>
                      <Route path="/waiter" element={<WaiterDashboard />}>
                        <Route index element={<WaiterDashboardHome />} />
                        <Route path="orders/new" element={<WaiterOrdersNew />} />
                        <Route path="orders/cooking" element={<WaiterOrdersCooking />} />
                        <Route path="orders/ready" element={<WaiterOrdersReady />} />
                        <Route path="new-order" element={<WaiterNewOrder />} />
                        <Route path="my-orders" element={<WaiterMyOrders />} />
                        <Route path="profile" element={<WaiterProfile />} />
                        <Route path="chat" element={<WaiterChat />} />
                        <Route path="support" element={<WaiterSupport />} />
                      </Route>
                      <Route path="/driver" element={<DriverDashboard />}>
                        <Route index element={<DriverDashboardHome />} />
                        <Route path="orders/new" element={<DriverOrdersNew />} />
                        <Route path="orders/on-way" element={<DriverOrdersOnWay />} />
                        <Route path="orders/delivered" element={<DriverOrdersDelivered />} />
                        <Route path="manual-order" element={<DriverManualOrder />} />
                        <Route path="my-deliveries" element={<DriverMyDeliveries />} />
                        <Route path="profile" element={<DriverProfile />} />
                        <Route path="chat" element={<DriverChat />} />
                        <Route path="support" element={<DriverSupport />} />
                      </Route>

                      {/* Admin POS & Portal with Wildcard Nested Routing */}
                      <Route path="/admin/pos" element={<AdminPOS />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />

                      {/* Super Admin Portal */}
                      <Route path="/superadmin/*" element={<SuperAdminDashboard />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Router>
                </SettingsProvider>
              </CartProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;