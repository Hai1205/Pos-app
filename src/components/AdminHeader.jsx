import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';
import { useOrderUpdates } from '../hooks/useOrderUpdates';

const AdminHeader = ({ username, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleNewOrder = (order) => {
    if (!order?.id || !order?.message) return;
    
    try {
      const newNotification = {
        id: order.id,
        title: 'Đơn hàng mới',
        message: `Đơn hàng #${order.id} - ${order.status}\nTổng tiền: ${order.final_amount.toLocaleString('vi-VN')} VND`,
        timestamp: new Date(order.order_date),
        read: false,
        data: order
      };
      addNotification(newNotification);
    } catch (error) {
      console.error('Lỗi khi thêm notification:', error);
    }
  };

  useOrderUpdates(handleNewOrder);

  return (
    <header className="bg-white text-gray-900 shadow-md">
      <div className="container mx-auto px-10 py-3">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="text-xl font-semibold">
            <span className="text-blue-500">Admin Dashboard</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 bg-gray-100 px-5 py-1 rounded-full shadow-sm hover:bg-gray-200 transition-colors"
              >
                <User size={18} className="text-blue-500" />
                <span className="text-sm font-medium">{username}</span>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isProfileOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <LogOut size={16} className="text-gray-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

            <div ref={notificationRef} className="relative">
              <NotificationBell
                count={unreadCount}
                onClick={() => setIsOpen(!isOpen)}
              />
              <NotificationPanel
                notifications={notifications}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onRemove={removeNotification}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;