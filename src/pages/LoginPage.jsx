import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useTables } from '../hooks/useTables';
import LoginForm from '../components/LoginForm';

const LoginPage = ({ setIsAuthenticated, setUsername }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const { assignCustomerToTable, getTableCustomers } = useTables();
  const [isAssigning, setIsAssigning] = useState(false);
  
  const query = new URLSearchParams(location.search);
  const tableId = query.get('table_id');
  
  const {
    phone,
    setPhone,
    name,
    setName,
    errors,
    handleLogin,
    validatePhone,
    validateName,
  } = useLogin(apiUrl);

  useEffect(() => {
    const checkTableAvailability = async () => {
      if (tableId) {
        try {
          const tableInfo = await getTableCustomers(tableId);
          console.log("Table customers:", tableInfo);
        } catch (error) {
          console.error("Error checking table:", error);
        }
      }
    };
    
    checkTableAvailability();
  }, [tableId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAssigning(true);
  
    try {
      // kt bàn có khách chưa
      if (tableId) {
        try {
          const tableInfo = await getTableCustomers(tableId);
          
          // nếu có khách không cho login
          if (tableInfo.customers && tableInfo.customers.length > 0) {
            setErrors('Bàn này đã có khách. Vui lòng chọn bàn khác.');
            setIsAssigning(false);
            return;
          }
        } catch (error) {
          console.error("Error checking table:", error);
          setErrors('Không thể kiểm tra tình trạng bàn');
          setIsAssigning(false);
          return;
        }
      }
  
      // Phần login như cũ
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userName');
  
      const loginSuccess = await handleLogin();
  
      if (loginSuccess) {
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userName', name);
  
        setIsAuthenticated(true);
        setUsername(name);
  
        if (tableId) {
          const assignSuccess = await assignCustomerToTable(tableId);
  
          if (assignSuccess) {
            console.log("Successfully assigned customer to table:", tableId);
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.error("Failed to assign customer to table");
          }
        }
  
        navigate('/');
      }
    } catch (error) {
      console.error("Error during login/assign process:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {tableId ? 'Đăng nhập để vào bàn' : 'Đăng Nhập'}
        </h2>
        <LoginForm
          phone={phone}
          setPhone={setPhone}
          name={name}
          setName={setName}
          errors={errors}
          handleSubmit={handleSubmit}
          validatePhoneOnBlur={validatePhone}
          validateNameOnBlur={validateName}
          isSubmitting={isAssigning}
        />
      </div>
    </div>
  );
};

export default LoginPage;