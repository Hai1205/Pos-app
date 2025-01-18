import React from 'react';
import { X, Check } from 'lucide-react';

const NotificationPanel = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove
}) => {
  if (!isOpen) return null;

  const formatTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatMessage = (message) => {
    return message.split('\n').map((line, index) => (
      <p key={index} className="text-sm text-gray-600">
        {line.trim()}
      </p>
    ));
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Thông báo</h3>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Đánh dấu tất cả đã đọc
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Không có thông báo nào
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 
              ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  {formatMessage(notification.message)}
                  <span className="text-xs text-gray-500 mt-1 block">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Xóa thông báo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;