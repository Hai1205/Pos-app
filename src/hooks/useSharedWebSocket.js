import { useState } from 'react';
import { useOrderUpdates } from './useOrderUpdates';

export const useSharedWebSocket = () => {
  const [orders, setOrders] = useState([]);
  const connectionStatus = useOrderUpdates((newOrders) => {
    setOrders(newOrders);
  });

  return { orders, connectionStatus, setOrders };
};