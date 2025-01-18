import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '../hooks/useCategories.js';

export function CategoryList({ currentCategory, onSelectCategory, searchTerm }) {
  const { categories, loading, error } = useCategories();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentCategory !== null && 
        categories.length > 0 && 
        !categories.some(cat => cat.id === currentCategory)) {
      onSelectCategory(null);// đưa về all nếu category bị xoá
    }
  }, [categories, currentCategory, onSelectCategory]);

  if (loading) {
    return <p className="text-gray-600 italic">Đang tải danh mục...</p>;
  }

  if (error) {
    return <p className="text-red-500">Lỗi: {error.message}</p>;
  }

  const currentCategoryName = currentCategory 
    ? categories.find(cat => cat.id === currentCategory)?.name 
    : 'Tất cả danh mục';

  return (
    <div className="relative mb-6">
      {/* mobile*/}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className="flex items-center justify-between">
            <span>{currentCategoryName}</span>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
          </span>
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <button
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${currentCategory === null ? 'bg-blue-100' : ''}`}
              onClick={() => {
                onSelectCategory(null);
                setIsOpen(false);
              }}
            >
              Tất cả danh mục
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${currentCategory === category.id ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  onSelectCategory(category.id);
                  setIsOpen(false);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* desktop */}
      <div className="hidden md:flex md:flex-wrap md:gap-2">
        <button
          className={`px-4 py-2 rounded-full transition duration-200 ease-in-out ${
            currentCategory === null
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-400'
          }`}
          onClick={() => onSelectCategory(null)}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full transition duration-200 ease-in-out ${
              currentCategory === category.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-400'
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

