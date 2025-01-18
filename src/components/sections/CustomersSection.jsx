import React, { useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import DataTable from '../DataTable';
import CustomerModal from '../CustomerModal';

const CustomersSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers(apiUrl);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const handleOpenModal = (customer = null) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.phone, formData);
      } else {
        await createCustomer(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleDelete = async (phone) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(phone);
      } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi xóa: ' + error.message);
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Tên Khách hàng' },
    { key: 'phone', label: 'Số điện thoại' },
    {
      key: 'total_spent',
      label: 'Tổng chi tiêu',
      render: (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    { key: 'points', label: 'Điểm tích lũy' },
    {
      key: 'date_created',
      label: 'Ngày tạo',
      render: (value) => formatDate(value)
    }
  ];

  const actionButtons = (item) => (
    <>
      <button 
        className="text-blue-500 hover:text-blue-700 mr-2"
        onClick={() => handleOpenModal(item)}
      >
        <Edit size={20} />
      </button>
      <button 
        className="text-red-500 hover:text-red-700"
        onClick={() => handleDelete(item.phone)}
      >
        <Trash2 size={20} />
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <UserPlus size={20} />
          Thêm khách hàng
        </button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        title="Quản lý Khách hàng"
        searchPlaceholder="Tìm kiếm theo tên hoặc số điện thoại..."
        searchFields={['name', 'phone']}
        loading={loading}
        error={error}
        actionButtons={actionButtons}
      />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
      />
    </div>
  );
};

export default CustomersSection;