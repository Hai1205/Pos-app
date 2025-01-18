import { useState, useEffect } from 'react';

export const useProducts = (apiUrl) => {
  const [menuItems, setMenuItems] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // lấy all products
  useEffect(() => {
    fetch(`${apiUrl}/products/`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        setMenuItems(data);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu:', error);
      });
  }, [apiUrl]);

   // Toggle product status
   const toggleProductStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/products/toggle-status/${id}/`, {
        method: 'PUT'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật trạng thái sản phẩm');
      }
  
      const updatedProduct = await response.json();
      setMenuItems(prev =>
        prev.map(item => item.id === id ? updatedProduct.data : item)
      );
  
      return { success: true, data: updatedProduct.data };
    } catch (error) {
      console.error('Error updating product status:', error);
      return { success: false, error: error.message };
    }
  };


  // thêm
  const addProduct = async (productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null) {
          formData.append(key, productData[key]);
        }
      });

      const response = await fetch(`${apiUrl}/products/create/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Không thể thêm sản phẩm');
      }

      const newProduct = await response.json();
      setMenuItems(prev => [...prev, newProduct.data]);
      return { success: true, data: newProduct.data };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  };

  // cập nhật
  const updateProduct = async (id, productData) => {
    try {
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'image' && !productData[key]) return;
          formData.append(key, productData[key]);
        }
      });

      const response = await fetch(`${apiUrl}/products/update/${id}/`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật sản phẩm');
      }

      const updatedProduct = await response.json();
      setMenuItems(prev =>
        prev.map(item => item.id === id ? updatedProduct.data : item)
      );
      
      // fetch lại ds mới nhất
      fetch(`${apiUrl}/products/`)
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          setMenuItems(data);
        })
        .catch((error) => {
          console.error('Lỗi khi lấy dữ liệu:', error);
        });

      return { success: true, data: updatedProduct.data };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  };

  // xoá
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/products/delete/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Không thể xóa sản phẩm');
      }

      setMenuItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    menuItems,
    currentCategory,
    setCurrentCategory,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus
  };
};