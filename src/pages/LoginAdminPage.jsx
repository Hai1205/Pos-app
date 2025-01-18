import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';

export default function LoginAdminPage({ onLogin }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { refreshPermissions } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // đăng nhập
      const loginResponse = await fetch(`${apiUrl}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || 'Thông tin đăng nhập không chính xác');
      }

      const loginData = await loginResponse.json();
      console.log('Đăng nhập thành công:', loginData);

      // lấy phân quyền
      const permResponse = await fetch(`${apiUrl}/permissions/list/?role=${loginData.account.role}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!permResponse.ok) {
        const permErrorData = await permResponse.json();
        throw new Error(permErrorData.message || 'Không thể lấy thông tin phân quyền');
      }

      const permData = await permResponse.json();
      console.log('Thông tin phân quyền:', permData);

      //thông tin thống kê nếu là owner
      let statisticsData = null;
      if (loginData.account.role === 'owner') {
        const statsResponse = await fetch(`${apiUrl}/permissions/statistics/?role=owner`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (statsResponse.ok) {
          statisticsData = await statsResponse.json();
          console.log('Thông tin thống kê:', statisticsData);
        } else {
          const statsErrorData = await statsResponse.json();
          throw new Error(statsErrorData.message || 'Không thể lấy thông tin thống kê cho owner');
        }
      }

      // Lưu dữ liệu vào localStorage
      localStorage.setItem('userRole', loginData.account.role);
      localStorage.setItem('username', loginData.account.username);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('permissions', JSON.stringify(permData.permissions));
      if (statisticsData) {
        localStorage.setItem('statistics', JSON.stringify(statisticsData));
      }

      // Cập nhật trạng thái ứng dụng
      await refreshPermissions();
      onLogin(loginData.account);
      
      // Chuyển hướng đến trang quản trị
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      console.error('Lỗi đăng nhập:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng Nhập Quản Trị
          </h2>
        </div>

        {error && (
          <Alert title="Lỗi Đăng Nhập" description={error} variant="destructive">
            <p>{error}</p>
          </Alert>
        )}

        <LoginForm
          isAdminLogin={true}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleSubmit={handleLogin}
          isLoading={isLoading}
          errors={{}}
        />
      </div>
    </div>
  );
}
