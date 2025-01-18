import React from 'react';
import { ShoppingBag } from 'lucide-react';

const CartButton = ({ onClick, itemCount, className = '' }) => {
  return (
    <div className="inline-block relative text-center">
      <button
        onClick={onClick}
        className={`text-gray-700 hover:text-blue-600 transition duration-200 ease-in-out flex flex-col items-center justify-center ${className}`}
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">Giỏ hàng</span>
      </button>
    </div>
  );
};

export default CartButton;
