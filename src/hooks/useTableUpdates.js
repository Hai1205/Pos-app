import { useEffect, useRef, useState } from 'react';

export const useTableUpdates = (setTables, loadTables) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/ws/tables/updates/`;
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Hàm tính toán thời gian chờ retry với exponential backoff
  const getReconnectDelay = () => {
    const baseDelay = 1000; // 1 giây
    return Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 giây
  };

  const connect = () => {
    // Kiểm tra nếu đã vượt quá số lần thử kết nối
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Đã vượt quá số lần thử kết nối tối đa');
      setConnectionStatus('failed');
      return;
    }

    try {
      // Đóng kết nối cũ nếu còn tồn tại
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }

      console.log(`Đang thử kết nối lần ${reconnectAttemptsRef.current + 1}...`);
      setConnectionStatus('connecting');

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('Kết nối WebSocket thành công');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        const pingInterval = setInterval(() => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        socketRef.current.addEventListener('close', () => {
          clearInterval(pingInterval);
        });
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return;
      
          console.log('Nhận được cập nhật bàn:', data);
          const { table_id, action, customer } = data;
      
          setTables((prevTables) => {
            const updatedTables = [...prevTables];  // Sao chép mảng trước đó
      
            // Tìm bàn theo table_id
            const tableIndex = updatedTables.findIndex((table) => table.id === table_id);
            if (tableIndex === -1) return updatedTables; // Nếu không tìm thấy bàn, trả về mảng cũ
      
            const table = updatedTables[tableIndex];
      
            // Cập nhật mảng customer của bàn
            if (action === 'customer_assigned') {
              // Thêm khách hàng vào mảng customer nếu chưa có
              if (!table.customer.includes(customer.phone)) {
                table.customer.push(customer.phone);
              }
            } else if (action === 'customer_removed') {
              // Xóa khách hàng khỏi mảng customer
              table.customer = table.customer.filter((phone) => phone !== customer.phone);
            }

            loadTables();
      
            // Trả về mảng đã cập nhật
            return updatedTables;
          });
      
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu WebSocket:', error);
        }
      };          

      socketRef.current.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        setConnectionStatus('error');
      };

      socketRef.current.onclose = (event) => {
        console.log('Kết nối WebSocket đã đóng:', event);
        setConnectionStatus('disconnected');

        if (event.code !== 1000) {
          reconnectAttemptsRef.current += 1;
          const delay = getReconnectDelay();
          console.log(`Sẽ thử kết nối lại sau ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Lỗi khi tạo kết nối WebSocket:', error);
      setConnectionStatus('error');
      reconnectAttemptsRef.current += 1;
      const delay = getReconnectDelay();
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      // Cleanup khi component unmount
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setTables]);

  return connectionStatus;
};
