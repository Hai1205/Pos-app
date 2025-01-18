import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const userRole = localStorage.getItem('userRole');

    if (!userRole) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/permissions/list/?role=${userRole}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin phân quyền');
      }

      const data = await response.json();
      const permissionCodes = data.permissions.map(p => p.permission_details.code);
      
      localStorage.setItem('permissions', JSON.stringify(permissionCodes));
      setPermissions(permissionCodes);
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi lấy thông tin phân quyền:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (permission) => {
    if (!permission) return true;
    return permissions.includes(permission);
  };

  const clearAuth = () => {
    localStorage.removeItem('permissions');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('username');
    setPermissions([]);
  };

  return { 
    permissions,
    loading,
    error,
    hasPermission,
    clearAuth,
    refreshPermissions: fetchPermissions
  };
};