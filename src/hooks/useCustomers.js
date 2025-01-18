import { useState, useEffect } from 'react';

export const useCustomers = (apiUrl) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${apiUrl}/customers/`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Có lỗi xảy ra khi tải dữ liệu khách hàng:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    try {
      const response = await fetch(`${apiUrl}/customers/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }

      const newCustomer = await response.json();
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Lỗi khi tạo khách hàng:', err);
      throw err;
    }
  };

  const updateCustomer = async (phone, customerData) => {
    try {
      const response = await fetch(`${apiUrl}/customers/update/${phone}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }

      const updatedCustomer = await response.json();
      setCustomers(prev =>
        prev.map(customer =>
          customer.phone === phone ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (err) {
      console.error('Lỗi khi cập nhật khách hàng:', err);
      throw err;
    }
  };

  const deleteCustomer = async (phone) => {
    try {
      const response = await fetch(`${apiUrl}/customers/delete/${phone}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }

      setCustomers(prev =>
        prev.filter(customer => customer.phone !== phone)
      );
    } catch (err) {
      console.error('Lỗi khi xóa khách hàng:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [apiUrl]);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers
  };
};