import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useOrder } from '../contexts/OrderContext';

const useOrderStatusUpdate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/ws/orders/status/`;
  const current_customer_phone = localStorage.getItem('userPhone');
  const { fetchOrders } = useOrder();

  useEffect(() => {
    if (!current_customer_phone) return;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.customer_phone === current_customer_phone) {
        toast.info(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }); 
        
        // Cập nhật đơn hàng globally
        fetchOrders();
        
        console.log(data.message);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [wsUrl, current_customer_phone, fetchOrders]);
};

export default useOrderStatusUpdate;