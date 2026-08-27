import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChefHat, ShoppingBag, Clock, Flame, CheckCircle, Truck, 
  PlusCircle, MessageSquare, HelpCircle, User, ChevronDown, ChevronRight,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ChefSidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [ordersExpanded, setOrdersExpanded] = useState(true);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  const menuItems = [
    {
      title: t('dashboard') || 'Dashboard',
      icon: Home,
      path: '/chef',
      exact: true
    },
    {
      title: t('orders') || 'Orders',
      icon: ShoppingBag,
      expandable: true,
      expanded: ordersExpanded,
      onToggle: () => setOrdersExpanded(!ordersExpanded),
      subItems: [
        { title: t('allOrders') || 'All Orders', path: '/chef/orders/all', icon: ShoppingBag },
        { title: t('newComing') || 'New Coming', path: '/chef/orders/new', icon: Clock, badge: 'new' },
        { title: t('cooking') || 'Cooking', path: '/chef/orders/cooking', icon: Flame, badge: 'active' },
        { title: t('readyDineIn') || 'Ready for Dine-in', path: '/chef/orders/dine-in', icon: CheckCircle },
        { title: t('readyDelivery') || 'Ready for Delivery', path: '/chef/orders/delivery', icon: Truck },
      ]
    },
    {
      title: t('addNewFood') || 'Add New Food',
      icon: PlusCircle,
      path: '/chef/add-food'
    },
    {
      title: t('liveChat') || 'Live Chat',
      icon: MessageSquare,
      path: '/chef/chat',
      badge: 'chat'
    },
    {
      title: t('helpSupport') || 'Support',
      icon: HelpCircle,
      path: '/chef/support'
    },
    {
      title: t('profile') || 'Profile',
      icon: User,
      path: '/chef/profile'
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-2xl shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Chef Portal</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kitchen Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.expandable ? (
                <>
                  {/* Expandable Parent */}
                  <button
                    onClick={item.onToggle}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isParentActive(item.subItems.map(sub => sub.path))
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Sub Items */}
                  {item.expanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive(subItem.path)
                              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.title}</span>
                          </div>
                          {subItem.badge === 'new' && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                          {subItem.badge === 'active' && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              LIVE
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Regular Menu Item */
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge === 'chat' && (
                    <span className="bg-green-500 text-white w-2 h-2 rounded-full animate-pulse"></span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <p className="text-xs font-bold text-gray-700">ማእድ Chef Portal</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Kitchen Excellence</p>
        </div>
      </div>
    </aside>
  );
}
