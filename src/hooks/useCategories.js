import { useState, useEffect } from 'react';

export const useCategories = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // danh sách categories
  const fetchCategories = async () => {
    try {
      setLoading(true); // Set loading khi bắt đầu fetch
      const response = await fetch(`${apiUrl}/categories/`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCategories(data);
      setError(null); // Reset error nếu fetch thành công
    } catch (error) {
      setError(error);
      setCategories([]); // Reset categories nếu có lỗi
    } finally {
      setLoading(false); // Set loading false trong mọi trường hợp
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [apiUrl])

  // thêm
  const addCategory = async (categoryData) => {
    try {
      const response = await fetch(`${apiUrl}/categories/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Không thể thêm loại sản phẩm');
      }

      const result = await response.json();
      setCategories(prev => [...prev, result.data]);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // update 
  const updateCategory = async (id, categoryData) => {
    try {
      const response = await fetch(`${apiUrl}/categories/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật loại sản phẩm');
      }

      const result = await response.json();
      setCategories(prev => 
        prev.map(cat => cat.id === id ? result.data : cat)
      );
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // xoá
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/categories/delete/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Không thể xóa loại sản phẩm');
      }

      // fetch lại sau khi xoá
      await fetchCategories();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    fetchCategories,
    deleteCategory,
  };
};