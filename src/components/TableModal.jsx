import React, { useEffect } from 'react';
import { X, LogOut, Users } from 'lucide-react';
import TableQRCode from './QRCode/TableQRCode';

const TableModal = ({
  isOpen,
  onClose,
  type,
  table,
  onSubmit,
  newTableName,
  setNewTableName,
  tableInfo,
  onRemoveCustomer,
  removingCustomer
}) => {
  useEffect(() => {
    if ((type === 'create' || type === 'edit') && isOpen) {
      if (type === 'edit' && table) {
        setNewTableName(table.name || '');
      } else {
        setNewTableName('');
      }
    }
  }, [type, isOpen, table, setNewTableName]);

  if (!isOpen) return null;

  const renderCustomerList = () => {
    if (!tableInfo?.customers?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Users size={48} className="mb-3 opacity-50" />
          <p className="text-center">Chưa có khách hàng nào tại bàn này</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
        {tableInfo.customers.map((customer, index) => (
          <div
            key={customer.phone}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{customer.name}</span>
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Khách {index + 1}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>
            </div>
            <button
              onClick={() => onRemoveCustomer(table.id, customer.phone)}
              disabled={removingCustomer}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={16} />
              <span className="text-sm whitespace-nowrap">
                {removingCustomer ? 'Đang xử lý...' : 'Rời bàn'}
              </span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTableForm = () => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
          Tên bàn
        </label>
        <input
          id="tableName"
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Nhập tên bàn..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          autoFocus
        />
      </div>
      {type === 'edit' && (
        <div>
          <label htmlFor="tableQR" className="block text-sm font-medium text-gray-700 mb-1">
            QR Code
          </label>
          <TableQRCode table={table} />
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            !newTableName.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : type === 'create'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={!newTableName.trim()}
        >
          {type === 'create' ? 'Thêm bàn' : 'Cập nhật'}
        </button>
      </div>
    </form>
  );

  const modalContent = () => {
    switch (type) {
      case 'create':
      case 'edit':
        return renderTableForm();
      case 'customer':
        return (
          <>
            {renderCustomerList()}
            <div className="flex justify-end mt-4 pt-3 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {type === 'create'
              ? 'Thêm bàn mới'
              : type === 'edit'
              ? 'Chỉnh sửa bàn'
              : `Khách hàng tại ${table?.name}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {modalContent()}
      </div>
    </div>
  );
};

export default TableModal;