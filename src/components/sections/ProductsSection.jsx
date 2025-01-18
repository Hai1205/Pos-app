'use client';

import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from '../../hooks/useCategories';
import DataTable from '../DataTable';
import ProductModal from '../ProductModal';

const ProductsSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {
    menuItems,
    loading: productsLoading,
    error: productsError,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus
  } = useProducts(apiUrl);

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAdd = async (productData) => {
    const result = await addProduct({ ...productData, is_available: true });
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (productData) => {
    const result = await updateProduct(editingProduct.id, productData);
    if (result.success) {
      setIsModalOpen(false);
      setEditingProduct(null);
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const result = await deleteProduct(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const result = await toggleProductStatus(id, !currentStatus);
    if (result.success) {
      console.log('Chuyển trạng thái thành công');
    } else {
      alert(result.error);
    }
  };
  
  const columns = useMemo(() => [
    { key: 'name', label: 'Tên Sản phẩm' },
    {
      key: 'price',
      label: 'Giá',
      render: (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
      key: 'category',
      label: 'Loại sản phẩm',
      render: (value) => {
        if (!value) return 'Chưa phân loại';
        const category = categories.find(cat => cat.id === value);
        return category ? category.name : 'Không tìm thấy';
      }
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value) => (
        <div className="truncate max-w-xs text-gray-500">{value}</div>
      )
    },
    {
      key: 'is_available',
      label: 'Trạng thái',
      render: (value, item) => (
        <button
          onClick={() => handleToggleStatus(item.id, value)}
          className="flex items-center px-3 py-1 rounded-full text-sm font-medium"
        >
          <Eye
            size={20} 
            className={`mr-2 ${value ? 'text-green-500' : 'text-red-500'}`} 
          />
          {value ? 'Đang bật' : 'Đã tắt'}
        </button>
      )
    }
  ], [categories]);

  const actionButtons = (item) => (
    <>
      <button
        className="text-blue-500 hover:text-blue-700 mr-2"
        onClick={() => {
          setEditingProduct(item);
          setIsModalOpen(true);
        }}
      >
        <Edit size={20} />
      </button>
      <button
        className="text-red-500 hover:text-red-700"
        onClick={() => handleDelete(item.id)}
      >
        <Trash2 size={20} />
      </button>
    </>
  );

  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  if (loading) return <div className="text-center p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500 p-4">Lỗi: {error.message}</div>;

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          Thêm sản phẩm
        </button>
      </div>

      <DataTable
        data={menuItems}
        columns={columns}
        title="Quản lý Sản phẩm"
        searchPlaceholder="Tìm kiếm sản phẩm..."
        searchFields={['name', 'description']}
        actionButtons={actionButtons}
        loading={loading}
        error={error}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdate : handleAdd}
        initialData={editingProduct}
      />
    </>
  );
};

export default ProductsSection;
