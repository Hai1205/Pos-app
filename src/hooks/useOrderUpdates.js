import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export const useOrderUpdates = (onOrderUpdate) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/ws/orders/updates/`;
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const permissions = JSON.parse(localStorage.getItem('permissions')) || [];
  
  const getReconnectDelay = () => {
    const baseDelay = 1000;
    return Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
  };

  const connect = () => {
    try {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log('Reset connection do quá số lần thử');
        reconnectAttemptsRef.current = 0;
        setConnectionStatus('disconnected');
      }

      if (socketRef.current) {
        socketRef.current.close();
      }

      console.log(`Đang kết nối lần ${reconnectAttemptsRef.current + 1}...`);
      setConnectionStatus('connecting');
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('Kết nối WebSocket thành công');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return;
          if (permissions.includes('manage_orders')) {
            console.log('Nhận được cập nhật:', data);
            toast.info(data.message, { toastId: 'order-update-toast' + data.id });
          }
          // Call the callback directly with the new order data
          onOrderUpdate(data);
        } catch (error) {
          console.error('Lỗi xử lý data:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        setConnectionStatus('error');
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket đóng:', event);
        setConnectionStatus('disconnected');

        if (event.code !== 1000) {
          reconnectAttemptsRef.current += 1;
          const delay = getReconnectDelay();
          console.log(`Thử kết nối lại sau ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('Lỗi tạo WebSocket:', error);
      setConnectionStatus('error');
      
      reconnectAttemptsRef.current += 1;
      const delay = getReconnectDelay();
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Unmount');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return connectionStatus;
};