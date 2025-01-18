import { useState } from 'react';

export const useAdminLogin = (apiUrl) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateUsername = () => {
    if (username.trim() === '') {
      setErrors((prev) => ({ ...prev, username: 'Tên đăng nhập không được để trống' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, username: '' }));
    return true;
  };

  const validatePassword = () => {
    if (password.trim() === '') {
      setErrors((prev) => ({ ...prev, password: 'Mật khẩu không được để trống' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: '' }));
    return true;
  };

  const handleLogin = async () => {
    if (!validateUsername() || !validatePassword()) {
      return false;
    }

    try {
      const response = await fetch(`${apiUrl}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Thông tin đăng nhập không chính xác');
      }

      const data = await response.json();
      
      // Lưu thông tin role và username vào localStorage
      localStorage.setItem('userRole', data.account.role);
      localStorage.setItem('username', data.account.username);
      localStorage.setItem('isAdminAuthenticated', 'true');

      return {
        success: true,
        data: data.account,
      };
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
      console.error('Lỗi đăng nhập:', err);
      return { success: false };
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    errors,
    handleLogin,
    validateUsername,
    validatePassword,
  };
};
