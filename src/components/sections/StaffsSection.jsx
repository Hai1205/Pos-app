import React, { useState, useMemo } from 'react';
import { Edit, Key, Plus } from 'lucide-react';
import { useStaffs } from "../../hooks/useStaffs";
import DataTable from '../DataTable';
import StaffModal from '../StaffModal';
import PasswordChangeModal from '../PasswordChangeModal';

const StaffsSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {
    staffs,
    loading: staffsLoading,
    error: staffsError,
    addStaff,
    updateStaff,
    deleteStaff
  } = useStaffs(apiUrl);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleAdd = async (staffData) => {
    const result = await addStaff(staffData);
    if (result.success) {
      setIsStaffModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (staffData) => {
    const result = await updateStaff(staffData);
    if (result.success) {
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      const result = await deleteStaff(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const columns = useMemo(() => [
    { key: 'account', label: 'Tên đăng nhập', render: (account) => account.username},
    { key: 'full_name', label: 'Họ và tên' },
    { key: 'phone_number', label: 'Số điện thoại' },
    {
      key: 'is_active',
      label: 'Kích hoạt',
      render: (value) => value ? 'Có' : 'Không'
    }
  ], []);

  const actionButtons = (item) => (
    <>
      <button
        className="text-blue-500 hover:text-blue-700 mr-2"
        onClick={() => {
          setEditingStaff(item);
          setIsStaffModalOpen(true);
        }}
      >
        <Edit size={20} />
      </button>
      <button
        className="text-green-500 hover:text-green-700 mr-2"
        onClick={() => {
          setEditingStaff(item);
          setIsPasswordModalOpen(true);
        }}
      >
        <Key size={20} />
      </button>
    </>
  );

  const loading = staffsLoading;
  const error = staffsError;

  if (loading) return <div className="text-center p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500 p-4">Lỗi: {error.message}</div>;

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingStaff(null);
            setIsStaffModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          Thêm nhân viên
        </button>
      </div>

      <DataTable
        data={staffs}
        columns={columns}
        title="Quản lý Nhân viên"
        searchPlaceholder="Tìm kiếm nhân viên..."
        searchFields={['username', 'full_name', 'phone_number']}
        actionButtons={actionButtons}
        loading={loading}
        error={error}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={editingStaff ? handleUpdate : handleAdd}
        initialData={editingStaff}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setEditingStaff(null);
        }}
        staffId={editingStaff?.id}
      />
    </>
  );
};

export default StaffsSection;

