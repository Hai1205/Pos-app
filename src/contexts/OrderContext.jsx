import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const userPhone = localStorage.getItem('userPhone');

  const fetchOrders = async () => {
    if (!userPhone) return;
    
    try {
      const response = await fetch(`${apiUrl}/orders/customer/${userPhone}/orders/`);
      if (!response.ok) throw new Error('Không thể tải đơn hàng');
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, fetchOrders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}