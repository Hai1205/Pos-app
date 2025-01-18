import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, MapPin } from 'lucide-react';

const CustomerInfoPage = ({ apiUrl }) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const userPhone = localStorage.getItem('userPhone');
        if (!userPhone) {
          throw new Error('Không tìm thấy số điện thoại');
        }

        const response = await fetch(`${apiUrl}/customers/info/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userPhone}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        setCustomerInfo(data);
      } catch (err) {
        console.error('Có lỗi xảy ra khi tải thông tin khách hàng:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl text-red-500 mb-4">Lỗi tải dữ liệu</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6 text-gray-800">Thông Tin Cá Nhân</h1>
      
      {customerInfo ? (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{customerInfo.name}</h2>
              <p className="text-gray-500">{customerInfo.phone}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium">Email:</span>
              <span className="ml-2">{customerInfo.email || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium">Địa chỉ:</span>
              <span className="ml-2">{customerInfo.address || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex items-center text-gray-700">
              <Phone className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium">Số điện thoại:</span>
              <span className="ml-2">{customerInfo.phone}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <CreditCard className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium">Điểm tích lũy:</span>
              <span className="ml-2">{customerInfo.points || 0} điểm</span>
            </div>
            
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Không tìm thấy thông tin khách hàng</div>
      )}
    </div>
  );
};

export default CustomerInfoPage;