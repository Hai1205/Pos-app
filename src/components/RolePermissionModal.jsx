import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const RolePermissionModal = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  allPermissions,
  rolePermissions,
  isViewMode,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (rolePermissions?.permissions) {
      const activePermissionIds = rolePermissions.permissions.map(
        (p) => p.permission_details.id
      );
      setSelectedPermissions(activePermissionIds);
    }
  }, [rolePermissions]);

  const handlePermissionChange = (permissionId) => {
    if (isViewMode) return;
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedPermissions);
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isViewMode ? 'Xem chi tiết quyền' : 'Chỉnh sửa quyền'}
            </h2>
            <p className="text-gray-600 mt-1">
              Vai trò: {rolePermissions?.role_display || role.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Quyền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Quyền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  {!isViewMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allPermissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className={
                      isViewMode
                        ? 'cursor-default'
                        : 'cursor-pointer hover:bg-gray-50'
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{permission.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{permission.code}</td>
                    <td className="px-6 py-4">{permission.description}</td>
                    {!isViewMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className={`form-checkbox h-5 w-5 ${
                              isViewMode
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-indigo-600 cursor-pointer'
                            }`}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                          />
                        </label>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Đóng
            </button>

            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <Check className="mr-2" size={16} />
                Lưu Thay Đổi
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolePermissionModal;
