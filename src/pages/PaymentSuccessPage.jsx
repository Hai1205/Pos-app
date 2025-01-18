import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};

  if (!orderDetails) {
    navigate('/');
    return null;
  }
  const userPhone = localStorage.getItem('userPhone'); // Get the user's phone number

  // Function to update point history in localStorage
  const updatePointHistory = () => {
    // Retrieve the existing history or initialize an empty array for the specific user
    const pointHistory = JSON.parse(localStorage.getItem(`${userPhone}_pointHistory`)) || [];

    // Create a new history entry from orderDetails
    const newEntry = {
      date: new Date().toISOString(),
      points_added: orderDetails.points_earned,
      points_deducted: orderDetails.points_used,
      current_points: orderDetails.customer_points,
      orderId: orderDetails.order_id,  // Add unique order ID to avoid duplicates
    };

    // Check if the entry with the same orderId already exists to prevent duplicate entries
    const isDuplicate = pointHistory.some(entry => entry.orderId === newEntry.orderId);
    if (isDuplicate) {
      console.log("Duplicate entry found, skipping update.");
      return;
    }

    // Append the new entry and update localStorage for the user
    const updatedHistory = [...pointHistory, newEntry];
    localStorage.setItem(`${userPhone}_pointHistory`, JSON.stringify(updatedHistory));
    localStorage.setItem(`${userPhone}_currentPoints`, orderDetails.customer_points);
  };

  // Call the function on component mount to save the history
  useEffect(() => {
    updatePointHistory();
  }, []);


  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
        Thanh toán thành công!
      </h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-3">Chi tiết đơn hàng:</h2>
        
        <div className="space-y-2">
          <p className="flex justify-between">
            <span>Tổng tiền:</span>
            <span>{orderDetails.total_amount?.toLocaleString()}đ</span>
          </p>
          
          <p className="flex justify-between">
            <span>Giảm giá từ điểm:</span>
            <span>{orderDetails.points_discount?.toLocaleString()}đ</span>
          </p>
          
          <p className="flex justify-between font-semibold">
            <span>Số tiền thanh toán:</span>
            <span>{orderDetails.final_amount?.toLocaleString()}đ</span>
          </p>
          
          <p className="flex justify-between">
            <span>Phương thức thanh toán:</span>
            <span>{orderDetails.payment_method === 'paypal' ? 'PayPal' : 'Tiền mặt'}</span>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h2 className="text-xl font-semibold mb-3">Thông tin tích điểm:</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Điểm tích lũy mới:</span>
              <span>{orderDetails.points_earned}</span>
            </p>
            
            <p className="flex justify-between">
              <span>Số điểm đã dùng:</span>
              <span>{orderDetails.points_used}</span>
            </p>
            
            <p className="flex justify-between font-semibold">
              <span>Tổng điểm hiện tại:</span>
              <span>{orderDetails.customer_points}</span>
            </p>
            
            <p className="flex justify-between">
              <span>Tổng chi tiêu của bạn:</span>
              <span>{orderDetails.customer_total_spent?.toLocaleString()}đ</span>
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleBackHome}
        className="w-full mt-8 bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition duration-300"
      >
        Quay lại trang chủ
      </button>
    </div>
  );
}
