import { useState } from 'react';

export const useTables = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [errors, setErrors] = useState('');
  const [tableInfo, setTableInfo] = useState([]);
  const [tables, setTables] = useState([]);

  const getCurrentUserPhone = () => {
    return localStorage.getItem('userPhone');
  };

  const getAllTables = async () => {
    try {
      const response = await fetch(`${apiUrl}/tables/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách bàn');
      }

      const data = await response.json();
      setTables(data);
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const getTable = async (tableId) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin bàn');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const createTable = async (tableData) => {
    try {
      const response = await fetch(`${apiUrl}/tables/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo bàn mới');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const updateTable = async (tableId, tableData) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin bàn');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const deleteTable = async (tableId) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa bàn');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const assignCustomerToTable = async (tableId) => {
    try {
      const currentPhone = getCurrentUserPhone();
      
      if (!currentPhone) {
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      const response = await fetch(`${apiUrl}/tables/${tableId}/assign-customer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: currentPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể đăng ký bàn');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const removeCustomerFromTable = async (tableId, customerPhone) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/remove-customer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: customerPhone }), 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể rời bàn');
      }
  
      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const getTableCustomers = async (tableId) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/customers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin khách hàng tại bàn');
      }

      const data = await response.json();
      setTableInfo(data);
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  const checkTableAvailability = async (tableId) => {
    try {
      const response = await fetch(`${apiUrl}/tables/${tableId}/availability/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể kiểm tra trạng thái bàn');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setErrors(err.message);
      return null;
    }
  };

  return {
    tables,
    tableInfo,
    setTables,
    errors,
    getAllTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    assignCustomerToTable,
    removeCustomerFromTable,
    getTableCustomers,
    checkTableAvailability,
  };
};