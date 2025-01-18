import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import DataTable from '../DataTable';
import OrderItemModal from '../OrderItemModal';
import DateFilter from '../DateFilter';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';

const InvoicesSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { orders, loading, error, setOrders } = useOrders(apiUrl);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateError, setDateError] = useState('');

  const handleNewOrder = (newOrder) => {
    setOrders(prevOrders => {
      const currentOrders = Array.isArray(prevOrders) ? prevOrders : [];
      
      const orderExists = currentOrders.some(order => order.id === newOrder.id);
      
      if (orderExists) {
        return currentOrders.map(order =>
          order.id === newOrder.id ? { ...order, ...newOrder } : order
        );
      } else {

        return [newOrder, ...currentOrders];
      }
    });
  };

  // WebSocket connection
  useOrderUpdates(handleNewOrder);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id 
          ? { ...order, status: updatedOrder.status, final_amount: updatedOrder.final_amount || order.final_amount }
          : order
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã duyệt':
        return 'bg-blue-100 text-blue-800';
      case 'Đang giao':
        return 'bg-orange-100 text-orange-800';
      case 'Đã giao':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Mã hóa đơn',
      render: (value) => `#${value}`
    },
    { key: 'customer', label: 'Khách hàng' },
    {
      key: 'table',
      label: 'Vị trí',
      render: (value) => (
        <span className={`px-2 py-1 rounded ${value?.name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
      >
        {value?.name ? value.name : 'Không'}
      </span>
      )
    },
    {
      key: 'order_date',
      label: 'Ngày đặt hàng',
      render: (value) => formatDate(value)
    },
    {
      key: 'payment_method',
      label: 'Phương thức thanh toán',
      render: (value) => {
        switch(value.toLowerCase()) {
          case 'cash':
            return 'Thanh toán sau';
          case 'paypal':
            return 'Đã thanh toán';
          default:
            return value;
        }
      }
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`px-2 py-1 rounded ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'final_amount',
      label: 'Tổng tiền',
      render: (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    }
  ];

  const actionButtons = (item) => (
    <button
      className="text-blue-500 hover:text-blue-700"
      onClick={() => {
        setSelectedOrderId(item.id);
        setShowModal(true);
      }}
      disabled={item.status === 'Đã hủy'}
    >
      <Eye size={20} className={item.status === 'Đã hủy' ? 'opacity-50' : ''} />
    </button>
  );

  useEffect(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      setFilteredOrders([]);
    } else {
      setDateError('');
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.order_date);
        const isAfterStartDate = startDate ? orderDate >= new Date(startDate) : true;
        const isBeforeEndDate = endDate ? orderDate <= new Date(endDate) : true;
        return isAfterStartDate && isBeforeEndDate;
      });
      setFilteredOrders(filtered);
    }
  }, [orders, startDate, endDate]);

  return (
    <>
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        errorMessage={dateError}
      />
      <DataTable
        data={filteredOrders}
        columns={columns}
        title="Quản lý Hóa đơn"
        searchPlaceholder="Tìm kiếm hóa đơn..."
        searchFields={['customer', 'id']}
        loading={loading}
        error={error}
        actionButtons={actionButtons}
      />
      {showModal && (
        <OrderItemModal
          orderId={selectedOrderId}
          onClose={() => setShowModal(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default InvoicesSection;