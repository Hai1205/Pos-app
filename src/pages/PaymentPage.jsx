import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { PayPalButton } from '../components/PayPalButton';

export default function PaymentPage() {
  const { clearCart } = useCart();
  const location = useLocation();
  const { cart, total } = location.state || { cart: [], total: 0 };
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [usePoints, setUsePoints] = useState(false);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isMember, setIsMember] = useState(false); // Trạng thái thành viên
  const [showMemberModal, setShowMemberModal] = useState(false); // Trạng thái hiển thị modal

  const checkMember = async () => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) {
      alert("Không tìm thấy số điện thoại trong localStorage.");
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/check_membership/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userPhone}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.message}`);
        return;
      }
  
      const data = await response.json();
      setIsMember(data.is_member);
    } catch (error) {
      console.error("Lỗi trong quá trình kiểm tra thành viên:", error);
      alert("Có lỗi xảy ra trong quá trình kiểm tra thành viên. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    checkMember();
  }, []);

  const fetchCustomerPoints = useCallback(async () => {
    try {
      const userPhone = localStorage.getItem('userPhone'); 
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/points/`, {
        headers: { 
          'Authorization': `Bearer ${userPhone}`,
          'Content-Type': 'application/json'
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể lấy dữ liệu điểm của khách hàng.');
      }
      
      setCustomerPoints(data.points);
    } catch (err) {
      console.error('Lỗi chi tiết:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('userPhone')) {
      fetchCustomerPoints();
    }
  }, [fetchCustomerPoints]);

  useEffect(() => {
    if (usePoints && customerPoints >= 10) {
      const maxDiscount = Math.min(Math.floor(customerPoints / 10) * 10000, total); 
      setDiscountedTotal(total - maxDiscount);
    } else {
      setDiscountedTotal(total);
    }
  }, [usePoints, customerPoints, total]);

  const sendPaymentRequest = async (paymentDetails = {}) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("Dữ liệu trong cart trước khi gửi:", cart);

    try {
        const response = await fetch(`${apiUrl}/orders/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_phone: localStorage.getItem('userPhone'),
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    size: item.size || 'default',
                    price: item.price,
                    product_note: item.note ?? (item.product.note || ''),

                })),
                payment_method: paymentMethod,
                use_points: usePoints,
                ...paymentDetails
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi gửi yêu cầu thanh toán');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};


  const handlePayment = async (paymentDetails = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendPaymentRequest(paymentDetails);
      clearCart();
      navigate('/payment-success', { 
        state: { 
          orderDetails: result,
          paymentMethod: paymentMethod 
        } 
      });
    } catch (error) {
      console.error('Lỗi thanh toán:', error);
      setError(error.message || 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashPayment = async (e) => {
    e.preventDefault();
    await handlePayment();
  };

  const handlePayPalPayment = async (paymentDetails) => {
    await handlePayment({
      ...paymentDetails,
      amount: discountedTotal
    });
  };

  const handleUsePointsChange = (e) => {
    if (!isMember) {
      setShowMemberModal(true); // Hiển thị modal nếu không phải là thành viên
      setUsePoints(false); // Đảm bảo checkbox không được kích hoạt
    } else {
      setUsePoints(e.target.checked);
    }
  };

  const closeModal = () => {
    setShowMemberModal(false);
  };

  const handleRegisterRedirect = () => {
    // Log the current total amount before saving it
    console.log('Current total before navigating to register:', total);

    // Save cart and total to localStorage before navigating to registration
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total', total);
  
    setShowMemberModal(false);
    navigate('/register', { 
    });
};
return (
  <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Thanh toán</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6" role="alert">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách món ăn đã đặt</h2>
            <ul className="divide-y divide-gray-200">
              {cart.map((item, index) => (
                <li key={index} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity} | Kích thước: {item.size === 'default' ? 'Vừa' : item.size === 'large' ? 'Lớn' : item.size || 'Vừa'}
                    </p>
                    {item.note && <p className="text-sm text-gray-500">Ghi chú: {item.note}</p>}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {(item.price * item.quantity).toLocaleString()} VND
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleCashPayment} className="space-y-6">
            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="cash">Tiền mặt</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Điểm tích lũy: {customerPoints}
                </span>
                {customerPoints >= 10 && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={handleUsePointsChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Sử dụng điểm</span>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">10 điểm = 10,000 VND</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Tổng tiền:</span>
                <span className="text-2xl font-bold text-indigo-600">{discountedTotal.toLocaleString()} VND</span>
              </div>
            </div>

            <div className="mt-8">
              {paymentMethod === 'cash' ? (
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Thanh toán tiền mặt'}
                </button>
              ) : (
                <PayPalButton
                  key={`${discountedTotal}-${usePoints}`}
                  amount={discountedTotal}
                  onSuccess={handlePayPalPayment}
                  currency="VND"
                  disabled={isLoading}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>

    {showMemberModal && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bạn không phải là thành viên</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn cần là thành viên để sử dụng điểm tích lũy. Bạn có muốn đăng ký không?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleRegisterRedirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
