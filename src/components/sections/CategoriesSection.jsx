import React, { useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useCategories } from "../../hooks/useCategories";
import DataTable from '../DataTable';
import CategoryModal from '../CategoryModal';

const CategorySection = () => {
  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAdd = async (categoryData) => {
    const result = await addCategory(categoryData);
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (categoryData) => {
    const result = await updateCategory(editingCategory.id, categoryData);
    if (result.success) {
      setIsModalOpen(false);
      setEditingCategory(null);
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại sản phẩm này?')) {
      const result = await deleteCategory(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên loại sản phẩm' },
  ];

  const actionButtons = (item) => (
    <>
      <button
        className="text-blue-500 hover:text-blue-700 mr-2"
        onClick={() => {
          setEditingCategory(item);
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

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          Thêm loại sản phẩm
        </button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        title="Quản lý Loại sản phẩm"
        searchPlaceholder="Tìm kiếm loại sản phẩm..."
        searchFields={['name']}
        actionButtons={actionButtons}
        loading={loading}
        error={error}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdate : handleAdd}
        initialData={editingCategory}
      />
    </>
  );
};

export default CategorySection;