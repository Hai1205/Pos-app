import { useState } from 'react';

export const useLogin = (apiUrl) => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({ phone: '', name: '', general: '' });

    const validatePhone = () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            setErrors((prev) => ({ ...prev, phone: 'Số điện thoại phải có 10 chữ số.' }));
            return false;
        }
        setErrors((prev) => ({ ...prev, phone: '' }));
        return true;
    };

    const validateName = () => {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (name.trim() === '') {
            setErrors((prev) => ({ ...prev, name: 'Tên khách hàng không được để trống.' }));
            return false;
        }
        if (!nameRegex.test(name)) {
            setErrors((prev) => ({ ...prev, name: 'Tên khách hàng không được chứa số hoặc ký tự đặc biệt.' }));
            return false;
        }
        setErrors((prev) => ({ ...prev, name: '' }));
        return true;
    };

    const handleLogin = async () => {
        if (!validatePhone() || !validateName()) return false;

        try {
            const response = await fetch(`${apiUrl}/customers/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, name }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Có lỗi xảy ra!');
            }

            const data = await response.json();
            console.log('Đăng nhập thành công hoặc tạo tài khoản:', data);

            localStorage.setItem('userPhone', phone);

            return true;
        } catch (err) {
            setErrors((prev) => ({ ...prev, general: err.message }));
            console.error('Lỗi đăng nhập:', err);
            return false;
        }
    };

    return {
        phone,
        setPhone,
        name,
        setName,
        errors,
        handleLogin,
        validatePhone,
        validateName,
    };
};