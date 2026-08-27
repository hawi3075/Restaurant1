import React from 'react';
import { Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChefSidebar from '../../components/ChefSidebar';
import DashboardHeader from '../../components/DashboardHeader';

export default function ChefDashboard() {
  const { user, loading: authLoading } = useAuth();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">Loading Chef Portal...</p>
        </div>
      </div>
    );
  }

  // Check if user is chef
  if (!user || user.role !== 'CHEF') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ChefSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Chef Kitchen Portal" />
        {/* Routed Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}