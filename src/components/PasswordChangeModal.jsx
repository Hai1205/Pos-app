import React, { useState } from 'react';

const PasswordChangeModal = ({ isOpen, onClose, staffId }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const resetForm = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accounts/change_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: staffId,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Cập nhật mật khẩu thành công !');
        resetForm(); 
        onClose();
      } else {
        alert(data.error || 'Error occurred while changing password');
      }
    } catch (error) {
      alert('Error occurred while changing password');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Đổi mật khẩu</h2>
          <button 
            onClick={() => {
              resetForm(); // Reset form when closing
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors text-2xl font-semibold"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
            <input
              id="oldPassword"
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm(); 
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;