import { useState, useEffect } from 'react';

export const usePermissions = (apiUrl) => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${apiUrl}/permissions/roles/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRoles(data);
    } catch (e) {
      console.error('Error fetching roles:', e);
      setError('Không thể tải danh sách vai trò');
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await fetch(`${apiUrl}/permissions/all/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllPermissions(data);
    } catch (e) {
      console.error('Error fetching all permissions:', e);
      setError('Không thể tải danh sách tất cả quyền');
    }
  };

  const fetchRolePermissions = async (role) => {
    try {
      const response = await fetch(`${apiUrl}/permissions/list/?role=${role}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Chỉ lấy chi tiết quyền
      return data.permissions.map((p) => p.permission_details);
    } catch (e) {
      console.error('Error fetching role permissions:', e);
      throw new Error('Không thể tải danh sách quyền của vai trò này');
    }
  };
  

  const updateRolePermissions = async (role, permissions) => {
    try {
      const response = await fetch(`${apiUrl}/permissions/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, permissions }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (e) {
      console.error('Error updating role permissions:', e);
      throw new Error('Không thể cập nhật quyền');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchAllPermissions()]);
      setLoading(false);
    };

    fetchData();
  }, [apiUrl]);

  return {
    roles,
    allPermissions,
    loading,
    error,
    fetchRolePermissions,
    updateRolePermissions
  };
};