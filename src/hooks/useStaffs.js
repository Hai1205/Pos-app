import { useState, useEffect } from 'react';

export const useStaffs = (apiUrl) => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách staffs
  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/accounts/staff/`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        setStaffs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching staffs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, [apiUrl]);

  // Hàm fetch riêng để tái sử dụng
  const fetchData = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    return await response.json();
  };

  // Thêm nhân viên
  const addStaff = async (staffData) => {
    try {
      const formData = new FormData();
      Object.keys(staffData).forEach(key => {
        if (staffData[key] !== null) {
          formData.append(key, staffData[key]);
        }
      });

      const newStaff = await fetchData(`${apiUrl}/accounts/staff/create/`, {
        method: 'POST',
        body: formData,
      });

      setStaffs(prev => [...prev, newStaff]);
      return { success: true, data: newStaff };
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, error: error.message };
    }
  };

  // Cập nhật thông tin nhân viên
  const updateStaff = async (staffData) => {
    try {
      const { id, ...data } = staffData; 
      if (!id) {
        throw new Error('ID is required for updating staff');
      }

      const formData = new FormData();
      Object.keys(staffData).forEach(key => {
        if (staffData[key] !== null && staffData[key] !== undefined) {
          formData.append(key, staffData[key]);
        }
      });

      const updatedStaff = await fetchData(`${apiUrl}/accounts/staff/update/`, {
        method: 'PUT',
        body: formData,
      });

      console.log(updatedStaff)
  
      setStaffs(prev =>
        prev.map(item => item.id === id ? updatedStaff: item)
      );
  
      return { success: true, data: updatedStaff };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  };

  // Xóa nhân viên (not used)
  const deleteStaff = async (id) => {
    try {
      await fetchData(`${apiUrl}/accounts/staff/delete/${id}/`, {
        method: 'DELETE',
      });

      setStaffs(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting staff:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset passowrd
  const resetPassword = async (staffId) => {
    try {
      const response = await fetch(`${apiUrl}/accounts/staff/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: staffId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      console.log('New password:', result.new_password);
      return { success: true, newPassword: result.new_password };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    staffs,
    loading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
    resetPassword,
  };
};
