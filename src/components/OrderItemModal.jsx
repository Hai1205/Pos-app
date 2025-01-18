import React, { useEffect, useState } from 'react';
import { useOrderItems } from '../hooks/useOrderItems';
import { X, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

export default function OrderItemModal({ orderId, onClose, onStatusUpdate }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { orderItems, loading, error } = useOrderItems(apiUrl, orderId);
  const [products, setProducts] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('Chờ duyệt');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const productMap = {};
        data.forEach(product => {
          productMap[product.id] = product.name;
        });
        setProducts(productMap);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProcessingError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      }
    };
    
    fetchProducts();
  }, [apiUrl]);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/orders/order/${orderId}/status/view/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCurrentStatus(data.status);
        setFinalAmount(data.final_amount || 0);
      } catch (error) {
        console.error('Error fetching order status:', error);
        setProcessingError('Không thể tải trạng thái đơn hàng. Vui lòng thử lại sau.');
      }
    };

    fetchOrderStatus();
  }, [apiUrl, orderId]);
  
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Chờ duyệt':
        return 'Đã duyệt';
      case 'Đã duyệt':
        return 'Đang giao';
      case 'Đang giao':
        return 'Đã giao';
      default:
        return currentStatus;
    }
  };

  const handleProcessOrder = async (newStatus = null) => {
    setIsProcessing(true);
    setProcessingError(null);
    
    const statusToUpdate = newStatus || getNextStatus(currentStatus);

    try {
      const response = await fetch(`${apiUrl}/orders/order/${orderId}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusToUpdate })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedOrder = await response.json();
      
      const processedOrder = {
        id: orderId,
        status: updatedOrder.new_status || statusToUpdate,
        customer: updatedOrder.customer_name || '',
        order_date: updatedOrder.update_time || new Date().toISOString(),
        final_amount: updatedOrder.final_amount || finalAmount
      };

      setCurrentStatus(processedOrder.status);
      setFinalAmount(processedOrder.final_amount);
      onStatusUpdate(processedOrder);
      
      if (processedOrder.status === 'Đã giao' || processedOrder.status === 'Đã hủy') {
        onClose();
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setProcessingError(error.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
      setShowCancelConfirm(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const getButtonText = (status) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'Duyệt đơn hàng';
      case 'Đã duyệt':
        return 'Bắt đầu giao hàng';
      case 'Đang giao':
        return 'Xác nhận đã giao';
      default:
        return 'Xử lý đơn hàng';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Chờ duyệt':
        return <Package className="w-5 h-5 text-yellow-500" />;
      case 'Đã duyệt':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'Đang giao':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Đã giao':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Đã hủy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const CancelConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Xác nhận hủy đơn hàng</h3>
        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn hủy đơn hàng này ? Đây là quyết định không thể thay đổi.</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            onClick={() => setShowCancelConfirm(false)}
          >
            Không
          </button>
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            onClick={() => handleProcessOrder('Đã hủy')}
          >
            Có, hủy đơn hàng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
        <div className="flex justify-between items-center bg-gray-100 px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">Chi tiết đơn hàng #{orderId}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg flex items-center">
              Trạng thái hiện tại: 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold flex items-center
                ${currentStatus === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                  currentStatus === 'Đã duyệt' ? 'bg-blue-100 text-blue-800' :
                  currentStatus === 'Đang giao' ? 'bg-orange-100 text-orange-800' :
                  currentStatus === 'Đã giao' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}>
                {getStatusIcon(currentStatus)}
                <span className="ml-1">{currentStatus}</span>
              </span>
            </p>
          </div>

          {loading && <p className="text-center py-4">Đang tải...</p>}
          {error && <p className="text-red-500 text-center py-4">Lỗi: {error}</p>}
          
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border-b">Sản phẩm</th>
                    <th className="text-left p-3 border-b">Size</th>
                    <th className="text-right p-3 border-b">Số lượng</th>
                    <th className="text-right p-3 border-b">Giá</th>
                    <th className="text-right p-3 border-b">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-b">
                        <div className="flex flex-col">
                          <span className="font-medium">{products[item.product] || 'Đang tải...'}</span>
                          {item.product_note && (
                            <span className="text-xs text-gray-500 italic mt-1">
                              Ghi chú: {item.product_note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border-b">{item.size_display}</td>
                      <td className="p-3 border-b text-right">{item.quantity}</td>
                      <td className="p-3 border-b text-right">
                        {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td className="p-3 border-b text-right">
                        {(item.quantity * item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="p-3 text-right">Tổng cộng:</td>
                    <td className="p-3 text-right">
                      {orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0)
                        .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="p-3 text-right font-semibold text-green-700">Thành tiền (sau giảm giá):</td>
                    <td className="p-3 text-right font-semibold text-green-700">
                      {finalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {processingError && (
          <div className="px-6 py-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{processingError}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-2">
          {currentStatus !== 'Đã giao' && currentStatus !== 'Đã hủy' && (
            <>
              <button
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors flex items-center
                  ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={() => handleProcessOrder()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {getStatusIcon(getNextStatus(currentStatus))}
                    <span className="ml-2">{getButtonText(currentStatus)}</span>
                  </>
                )}
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors flex items-center"
                onClick={handleCancelOrder}
                disabled={isProcessing}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Hủy đơn hàng
              </button>
            </>
          )}
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors flex items-center"
            onClick={onClose}
          >
            <X className="w-5 h-5 mr-2" />
            Đóng
          </button>
        </div>
      </div>
      {showCancelConfirm && <CancelConfirmationDialog />}
    </div>
  );
}