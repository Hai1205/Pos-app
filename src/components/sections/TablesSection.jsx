import React, { useEffect, useState } from 'react';
import { useTables } from '../../hooks/useTables';
import { Plus, Edit, Trash2, Users, RefreshCcw } from 'lucide-react';
import TableModal from '../TableModal';
import { useTableUpdates } from '../../hooks/useTableUpdates';
import { useLocation } from 'react-router-dom';

const TablesSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const {
    tables,
    setTables,
    errors,
    getAllTables,
    createTable,
    updateTable,
    deleteTable,
    removeCustomerFromTable,
    getTableCustomers,
    checkTableAvailability,
    tableInfo
  } = useTables(apiUrl);

  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingCustomer, setRemovingCustomer] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({});
  const [lastPathKey, setLastPathKey] = useState(location.key);

  useEffect(() => {
    if (location.key !== lastPathKey) {
      setLastPathKey(location.key);
      loadTables();
    }
  }, [location.key]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      await getAllTables();
      await checkAllTablesAvailability();
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useTableUpdates(setTables, loadTables);

  const checkAllTablesAvailability = async () => {
    const status = {};
    try {
      const tablesData = await getAllTables() || [];
      for (const table of tablesData) {
        const availability = await checkTableAvailability(table.id);
        status[table.id] = availability;
        if (availability?.is_occupied) {
          const customerInfo = await getTableCustomers(table.id);
          status[table.id].customers = customerInfo?.customers || [];
        }
      }
      setAvailabilityStatus(status);
    } catch (error) {
      console.error('Error checking tables availability:', error);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const result = await createTable({ name: newTableName });
    if (result) {
      setNewTableName('');
      setModalState({ isOpen: false, type: null });
      loadTables();
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!selectedTable || !newTableName.trim()) return;

    const result = await updateTable(selectedTable.id, { name: newTableName });
    if (result) {
      setNewTableName('');
      setModalState({ isOpen: false, type: null });
      setSelectedTable(null);
      loadTables();
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Bạn có chắc muốn xóa bàn này?')) {
      const result = await deleteTable(tableId);
      if (result) {
        loadTables();
      }
    }
  };

  const handleViewCustomers = async (table) => {
    setSelectedTable(table);
    const customerInfo = await getTableCustomers(table.id);
    if (customerInfo) {
      setModalState({ isOpen: true, type: 'customer' });
    }
  };

  const handleRemoveCustomer = async (tableId, customerPhone) => {
    try {
      setRemovingCustomer(true);
      if (window.confirm('Bạn có chắc muốn xóa khách hàng này khỏi bàn?')) {
        const result = await removeCustomerFromTable(tableId, customerPhone);
        if (result) {
          await loadTables();
          if (selectedTable?.id === tableId) {
            await getTableCustomers(tableId);
          }
          const updatedStatus = { ...availabilityStatus };
          if (updatedStatus[tableId]) {
            const customers = updatedStatus[tableId].customers || [];
            updatedStatus[tableId].customers = customers.filter(c => c.phone !== customerPhone);
            updatedStatus[tableId].is_occupied = updatedStatus[tableId].customers.length > 0;
          }
          setAvailabilityStatus(updatedStatus);
        }
      }
    } catch (error) {
      console.error('Error removing customer:', error);
    } finally {
      setRemovingCustomer(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý bàn</h2>
        <div className="flex gap-2">
          {/* <button
            onClick={() => loadTables()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button> */}
          <button
            onClick={() => setModalState({ isOpen: true, type: 'create' })}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Plus size={20} />
            Thêm bàn
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errors && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const status = availabilityStatus[table.id];
          const isOccupied = status?.is_occupied;
          const customerCount = status?.customers?.length || 0;

          return (
            <div
              key={table.id}
              className={`p-4 rounded-lg border ${
                isOccupied ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{table.name}</h3>
                  <p className="text-sm text-gray-600">
                    {customerCount > 0 ? `${customerCount} khách` : 'Không có khách'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setNewTableName(table.name);
                      setModalState({ isOpen: true, type: 'edit' });
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className={`p-1.5 rounded ${
                      isOccupied 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    disabled={isOccupied}
                    title={isOccupied ? 'Không thể xóa bàn đang có khách' : 'Xóa bàn'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${isOccupied ? 'text-orange-600' : 'text-green-600'}`}>
                  {isOccupied ? 'Đang có khách' : 'Trống'}
                </span>
                <button
                  onClick={() => handleViewCustomers(table)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <Users size={16} />
                  Xem khách
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TableModal Component */}
      <TableModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null })}
        type={modalState.type}
        table={selectedTable}
        onSubmit={modalState.type === 'create' ? handleCreateTable : handleUpdateTable}
        newTableName={newTableName}
        setNewTableName={setNewTableName}
        tableInfo={tableInfo}
        onRemoveCustomer={handleRemoveCustomer}
        removingCustomer={removingCustomer}
      />
    </div>
  );
};

export default TablesSection;