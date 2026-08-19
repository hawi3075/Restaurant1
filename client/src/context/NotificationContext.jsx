import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user) {
      // Listen for new notifications
      socket.on('notification', (notification) => {
        addNotification(notification);
      });

      // Order-related notifications
      socket.on('new_order', (order) => {
        if (user.role === 'CHEF' || user.role === 'WAITER') {
          addNotification({
            type: 'info',
            title: 'New Order',
            message: `New ${order.orderType.toLowerCase()} order #${order.id.slice(0, 8)} received`,
            orderId: order.id,
          });
        }
      });

      socket.on('order_status_updated', (order) => {
        // Notify customer about their order status
        if (user.role === 'CUSTOMER' && order.customerId === user.id) {
          const statusMessages = {
            CONFIRMED: 'Your order has been confirmed',
            PREPARING: 'Your order is being prepared',
            READY: 'Your order is ready for pickup',
            READY_TO_SERVE: 'Your order is ready to be served',
            OUT_FOR_DELIVERY: 'Your order is out for delivery',
            DELIVERED: 'Your order has been delivered',
            SERVED: 'Your order has been served',
          };

          if (statusMessages[order.status]) {
            addNotification({
              type: 'success',
              title: 'Order Update',
              message: statusMessages[order.status],
              orderId: order.id,
            });
          }
        }

        // Notify waiter when food is ready
        if (user.role === 'WAITER' && order.status === 'READY_TO_SERVE') {
          addNotification({
            type: 'success',
            title: 'Order Ready',
            message: `Table ${order.tableNumber || 'Walk-In'} order is ready to serve`,
            orderId: order.id,
          });
        }

        // Notify driver when order is ready for pickup
        if (user.role === 'DRIVER' && order.status === 'READY' && order.orderType === 'DELIVERY') {
          addNotification({
            type: 'info',
            title: 'Delivery Available',
            message: `Order #${order.id.slice(0, 8)} is ready for pickup`,
            orderId: order.id,
          });
        }
      });

      return () => {
        socket.off('notification');
        socket.off('new_order');
        socket.off('order_status_updated');
      };
    }
  }, [socket, user]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
      <NotificationToasts />
    </NotificationContext.Provider>
  );
};

// Toast notifications component
const NotificationToasts = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  // Only show unread notifications as toasts
  const toastNotifications = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      {toastNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => {
            markAsRead(notification.id);
            removeNotification(notification.id);
          }}
        />
      ))}
    </div>
  );
};

const NotificationToast = ({ notification, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`pointer-events-auto w-96 rounded-xl border-2 shadow-lg p-4 ${getBgColor(
        notification.type
      )} animate-slide-in-right`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white rounded-lg transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
