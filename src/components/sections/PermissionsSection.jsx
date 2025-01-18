import React, { useState } from 'react';
import { Edit, Eye } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import DataTable from '../DataTable';
import RolePermissionModal from '../RolePermissionModal';

const PermissionsSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {
    roles,
    allPermissions,
    loading,
    error,
    fetchRolePermissions,
    updateRolePermissions,
  } = usePermissions(apiUrl);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);

  const handleOpenModal = async (role, viewMode = false) => {
    setSelectedRole(role);
    setIsViewMode(viewMode);
    try {
      const permissions = await fetchRolePermissions(role.code);
      setRolePermissions(permissions); 
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Không thể tải danh sách quyền');
    }
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setRolePermissions([]);
    setIsModalOpen(false);
  };

  const handleSubmit = async (updatedPermissions) => {
    try {
      await updateRolePermissions(selectedRole.code, updatedPermissions);
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  const columns = [
    { key: 'code', label: 'Mã Vai Trò' },
    { key: 'name', label: 'Tên Vai Trò' },
  ];

  const actionButtons = (item) => (
    <>
      <button
        onClick={() => handleOpenModal(item, true)}
        className="text-blue-600 hover:text-blue-900 mr-2"
      >
        <Eye className="inline-block mr-1" size={20} />
      </button>
      <button
        onClick={() => handleOpenModal(item, false)}
        className="text-indigo-600 hover:text-indigo-900"
      >
        <Edit className="inline-block mr-1" size={20} />
      </button>
    </>
  );

  return (
    <div className="container mx-auto">
      <DataTable
        data={roles}
        columns={columns}
        title="Quản lý phân quyền"
        searchPlaceholder="Tìm kiếm theo mã hoặc tên vai trò..."
        searchFields={['code', 'name']}
        loading={loading}
        error={error}
        actionButtons={actionButtons}
      />

      <RolePermissionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        role={selectedRole}
        allPermissions={isViewMode ? rolePermissions : allPermissions} 
        rolePermissions={rolePermissions}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default PermissionsSection;
