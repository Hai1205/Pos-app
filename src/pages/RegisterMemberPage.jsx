import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterMemberPage({ updateMemberStatus }) {
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [returnTo] = useState(location.state?.returnTo || '/home');
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const storedTotal = parseFloat(localStorage.getItem('total') || '0');
    setCart(storedCart);
    setTotal(storedTotal);
  }, []);

  const registerAsVIPMember = useCallback(async () => {
    try {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        throw new Error('Số điện thoại không tìm thấy.');
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/register_member/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userPhone}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          address: address,
          is_member: true,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Cập nhật thông tin thất bại.');
      }
  
      // update lập tức
      updateMemberStatus(true);
      setSuccessMessage('Đăng ký thành công! Bạn đã trở thành thành viên VIP.');
      
      // duy trì tt khi refresh
      localStorage.setItem('isMember', 'true');
      
    } catch (error) {
      setError(error.message);
    }
  }, [email, address, updateMemberStatus]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registerAsVIPMember();
    } catch (error) {
      console.error('Lỗi khi đăng ký thành viên:', error);
      setError(error.message || 'Có lỗi xảy ra khi xử lý đăng ký. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToPayment = () => {
    console.log('Tổng tiền trước khi chuyển đến trang thanh toán:', total);
    navigate('/payment', { 
      state: { 
        fromRegistration: true,
        cart: cart,
        total: total
      } 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng Ký Thành Viên VIP</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-600 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        {successMessage && (
          <button
            onClick={handleReturnToPayment}
            className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
          >
            Trở về trang thanh toán
          </button>
        )}
      </div>
    </div>
  );
}