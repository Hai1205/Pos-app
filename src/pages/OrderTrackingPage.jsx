import React, { useState, useEffect, useMemo } from 'react';
import { Package2, Timer, Check, Truck, PackageX, ArrowUpDown } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useOrders } from '../hooks/useOrders';

export default function OrderTrackingPage() {
  const { orders, fetchOrders, setOrders } = useOrder();
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('');

  const userPhone = localStorage.getItem('userPhone');
  const apiUrl = import.meta.env.VITE_API_URL;

  const statusIcons = {
    'Chờ duyệt': <Timer className="w-5 h-5 text-yellow-500" />,
    'Đã duyệt': <Check className="w-5 h-5 text-blue-500" />,
    'Đang giao': <Truck className="w-5 h-5 text-orange-500" />,
    'Đã giao': <Package2 className="w-5 h-5 text-green-500" />,
    'Đã hủy': <PackageX className="w-5 h-5 text-red-600" />
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${apiUrl}/orders/customer/${userPhone}/orders/${orderId}/`);
      if (!response.ok) throw new Error('Không thể tải chi tiết đơn hàng');
      const data = await response.json();
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, order_items: data.order_items } : order
      );
      setOrders(updatedOrders);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (userPhone) {
      fetchOrders();
    }
  }, [userPhone]);

  const sortedAndFilteredOrders = useMemo(() => {
    let processedOrders = [...orders];
    
    if (statusFilter) {
      processedOrders = processedOrders.filter(order => order.status === statusFilter);
    }

    if (sortConfig.key) {
      processedOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return processedOrders;
  }, [orders, sortConfig, statusFilter]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      fetchOrderDetails(orderId);
    }
  };

  const SortButton = ({ label, sortKey }) => (
    <button 
      onClick={() => requestSort(sortKey)}
      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <span>{label}</span>
      <ArrowUpDown 
        size={16} 
        className={`${sortConfig.key === sortKey ? 'text-indigo-600' : 'text-gray-400'}`} 
      />
    </button>
  );

  if (!userPhone) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-yellow-100 border border-yellow-300 p-6 rounded-lg shadow-md">
        <p className="text-yellow-800 text-center font-medium text-lg">Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-red-100 border border-red-300 p-6 rounded-lg shadow-md">
        <p className="text-red-800 text-center font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-xl font-bold text-gray-800 ">Theo Dõi Đơn Hàng</h1>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.keys(statusIcons).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <div className="flex space-x-4">
            <SortButton label="Ngày" sortKey="order_date" />
            <SortButton label="Tổng tiền" sortKey="final_amount" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedAndFilteredOrders.map((order) => (
          <div 
            key={order.id} 
            className={`bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${
              expandedOrderId === order.id ? 'ring-2 ring-indigo-100' : 'hover:shadow-xl'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {statusIcons[order.status]}
                  <span className="font-semibold text-gray-700">{order.status}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {order.final_amount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={() => toggleOrderDetails(order.id)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors font-medium"
                >
                  {expandedOrderId === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
              </div>
            </div>

            {expandedOrderId === order.id && (
               <div className="bg-white rounded-lg shadow-md p-6">
               <h4 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                 Chi tiết đơn hàng
               </h4>
               
               <div className="space-y-4">
                 {order.order_items?.map((item, index) => (
                   <div 
                     key={index} 
                     className="flex items-center border-b last:border-b-0 pb-4 last:pb-0"
                   >
                     <img
                       src={apiUrl + item.product_image}
                       alt={item.product_name}
                       className="w-24 h-24 object-cover rounded-lg mr-6 border"
                     />
                     
                     <div className="flex-grow">
                       <h5 className="text-lg font-semibold text-gray-900 mb-2">
                         {item.product_name}
                       </h5>
                       
                       <div className="text-gray-600 space-x-4">
                         <span className="inline-block">
                           <strong>Size:</strong> {item.size || 'Vừa'}
                         </span>
                         <span className="inline-block">
                           <strong>Số lượng:</strong> {item.quantity}
                         </span>
                       </div>
                     </div>
                     
                     <div className="text-right">
                       <p className="text-lg font-bold text-primary-600">
                         {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-6 pt-4 border-t flex justify-between items-center">
                 <div>
                   <p className="text-gray-600 text-sm">Tổng tiền</p>
                   <p className="text-xl font-bold text-gray-900">
                     {order.total_amount.toLocaleString('vi-VN')}đ
                   </p>
                 </div>
                 
                 <div className="text-right">
                   <p className="text-gray-600 text-sm">Thành tiền (sau giảm giá)</p>
                   <p className="text-2xl font-bold text-primary-700">
                     {order.final_amount.toLocaleString('vi-VN')}đ
                   </p>
                 </div>
               </div>
             </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

