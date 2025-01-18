import { useState, useEffect } from 'react';

export const useOrderItems = (apiUrl, orderId) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const response = await fetch(`${apiUrl}/orders/order/${orderId}/items/`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        setOrderItems(data);
      } catch (err) {
        console.error('Error fetching order items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderItems();
    }
  }, [apiUrl, orderId]);

  return { orderItems, loading, error };
};