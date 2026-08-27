import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DriverSidebar from '../../components/DriverSidebar';
import DashboardHeader from '../../components/DashboardHeader'; // Import your top header

export default function DriverDashboard() {
  const { user, loading: authLoading } = useAuth();

  // Show loading while checking auth (Orange theme)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-orange-700 font-bold">Loading Driver Portal...</p>
        </div>
      </div>
    );
  }

  // Check if user is driver
  if (!user || user.role !== 'DRIVER') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50/40">
      {/* Sidebar */}
      <DriverSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar Header */}
        <DashboardHeader title="Today's Deliveries" />

        {/* Dynamic Nested Page Content via Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}