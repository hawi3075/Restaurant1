import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Import Pages & Portals
import Login from './pages/auth/Login';
import CustomerHome from './pages/customer/CustomerHome';
import CategoriesPage from './pages/customer/CategoriesPage';
import AboutUsPage from './pages/customer/AboutUsPage';
import ContactPage from './pages/customer/ContactPage';
import RestaurantListPage from './pages/customer/RestaurantListPage';
import RestaurantDetailsPage from './pages/customer/RestaurantDetailsPage';
import FoodDetailsPage from './pages/customer/FoodDetailsPage';

// Import New Customer Drawer Pages
import Profile from './pages/customer/Profile';
import Address from './pages/customer/Address';
import OrdersPage from './pages/customer/OrdersPage';
import Language from './pages/customer/Language';
import Chat from './pages/customer/Chat';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';

// Import Admin Dashboard & Staff Portals
import AdminDashboard from './pages/admin/AdminDashboard';
import ChefDashboard from './pages/chef/ChefDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';

// Placeholder Register Screen if needed
const RegisterPlaceholder = () => <div className="p-8 text-2xl font-bold">Register Screen</div>;

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <CartProvider>
                <Router>
                  <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterPlaceholder />} />

              {/* Customer Portal & Pages */}
              <Route path="/" element={<CustomerHome />} />
              <Route path="/restaurants" element={<RestaurantListPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
              <Route path="/food/:id" element={<FoodDetailsPage />} />
              <Route path="/foods/:id" element={<FoodDetailsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:id" element={<CategoriesPage />} />
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

              {/* Staff Portals */}
              <Route path="/chef/*" element={<ChefDashboard />} />
              <Route path="/waiter/*" element={<WaiterDashboard />} />
              <Route path="/driver/*" element={<DriverDashboard />} />

              {/* Admin Portal with Wildcard Nested Routing */}
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          </CartProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;