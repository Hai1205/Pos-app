import { useState, useEffect } from 'react';

export const useOrders = (apiUrl) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/orders/`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP Error ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        setOrders(data);
      })
      .catch(err => {
        console.error('Error loading order data:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiUrl]);

  return { orders, loading, error, setOrders };
};