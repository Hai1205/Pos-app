import React, { useState, useEffect } from 'react';
import RoleSelect from './dropdwons/RoleSelect';

export default function StaffModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
    role: '',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        username: initialData.account.username || '',
        full_name: initialData.full_name || '',
        phone_number: initialData.phone_number || '',
        email: initialData.email || '',
        address: initialData.address || '',
        role: initialData.account.role || '',
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        username: '',
        full_name: '',
        phone_number: '',
        email: '',
        address: '',
        role: '',
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const actionData = initialData ? { ...formData, id: initialData.id } : formData;
      await onSubmit(actionData);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            {initialData ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors text-2xl font-semibold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              disabled={!!initialData}
              required
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              id="phone_number"
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <RoleSelect value={formData.role} onChange={handleChange} />
          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">Kích hoạt</label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {initialData ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

