import React from 'react';
import { ShoppingCart, Award } from 'lucide-react';

export function MenuItem({ item, onAddToCart, onShowDetails, isTopProduct }) {
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className={`
      relative rounded-lg 
      bg-white shadow-md 
      overflow-hidden
      ${isTopProduct ? 'ring-2 ring-blue-50' : ''}
    `}>
      {isTopProduct && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
            <Award className="mr-1" size={14} />
            Bán Chạy
          </div>
        </div>
      )}

      <div className="relative">
        <img
          src={apiUrl + item.image}
          alt={item.name}
          className={`
            w-full h-56 object-cover 
            ${isTopProduct ? 'brightness-90' : ''}
          `}
        />

        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100">
          <button 
            onClick={() => onShowDetails(item)}
            className="bg-white px-4 py-2 rounded-full text-blue-600"
          >
            Xem Chi Tiết
          </button>
        </div>
      </div>

      <div className={`p-3 ${isTopProduct ? 'bg-blue-50/30' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`
            text-base font-semibold truncate 
            ${isTopProduct ? 'text-blue-900' : 'text-gray-800'}
          `}>
            {item.name}
          </h3>
          
          {isTopProduct && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Hot
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-900">
            {item.price.toLocaleString()}đ
          </span>

          <button
            onClick={() => onAddToCart({ ...item, selectedSize: 'default' })}
            className={`
              flex items-center gap-2 
              px-4 py-2 rounded-full 
              bg-blue-500 text-white 
              hover:bg-blue-600 
              transition-colors
            `}
          >
            <ShoppingCart size={16} />
            Thêm 
          </button>
        </div>
      </div>
    </div>
  );
}