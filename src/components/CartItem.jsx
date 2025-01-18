import React from 'react';

export function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded mr-4"
        />
        <div>
          <h4 className="font-semibold">{item.name}</h4>
          <p className="text-gray-600">
            Phần: {item.selectedSize === 'default' ? 'Vừa' : 'Lớn'}
          </p>
          <p className="text-gray-600">{item.price.toLocaleString()}đ x {item.quantity}</p>
          {item.note && (
            <p className="text-sm text-gray-500 italic mt-1">
              Ghi chú: {item.note}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)}
          className="bg-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-300 h-8 w-8 rounded-l cursor-pointer"
        >
          <span className="m-auto text-2xl font-thin">−</span>
        </button>
        <span className="outline-none focus:outline-none text-center w-12 bg-gray-100 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)}
          className="bg-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-300 h-8 w-8 rounded-r cursor-pointer"
        >
          <span className="m-auto text-2xl font-thin">+</span>
        </button>
        <button
          onClick={() => onRemove(item.id, item.selectedSize)}
          className="ml-2 text-red-500 hover:text-red-600"
        >
          <i className='bx bx-trash text-xl'></i>
        </button>
      </div>
    </div>
  );
}