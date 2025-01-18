import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = useCallback((newNotification) => {
    console.log('Thêm thông báo mới trong useNotifications:', newNotification);
    setNotifications(prevNotifications => {
      const updatedNotifications = [newNotification, ...prevNotifications];
      console.log('Danh sách thông báo sau khi cập nhật:', updatedNotifications);
      return updatedNotifications;
    });
    setUnreadCount(prevCount => prevCount + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  useEffect(() => {
    console.log('Số lượng thông báo chưa đọc:', unreadCount);
  }, [unreadCount]);

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};

