import React, { useState, useEffect } from 'react';

export function ProductDetailModal({ isOpen, closeModal, item, onAddToCart }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('default');
  const [totalPrice, setTotalPrice] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedSize('default');
      setTotalPrice(item.price);
      setNote('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
    updateTotalPrice(newQuantity, selectedSize);
  };

  const handleSizeChange = (newSize) => {
    setSelectedSize(newSize);
    updateTotalPrice(quantity, newSize);
  };

  const updateTotalPrice = (qty, size) => {
    const pricePerUnit = size === 'large' ? item.large_size_price : item.price;
    setTotalPrice(pricePerUnit * qty);
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      quantity,
      size: selectedSize,
      price: selectedSize === 'large' ? item.large_size_price : item.price,
      selectedSize,
      note,
    };
    onAddToCart(cartItem);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4" onClick={closeModal}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto" onClick={e => e.stopPropagation()}>
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6 sm:p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.name}</h3>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <img src={apiUrl + item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg shadow-md" />
              <p className="mt-4 text-gray-600">{item.description}</p>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phần</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSizeChange('default')} 
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${selectedSize === 'default' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Vừa - {item.price.toLocaleString()}đ
                  </button>
                  {item.has_large_size && (
                    <button 
                      onClick={() => handleSizeChange('large')} 
                      className={`flex-1 py-2 px-4 rounded-md transition-colors ${selectedSize === 'large' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Lớn - {item.large_size_price.toLocaleString()}đ
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                <div className="flex items-center">
                  <button onClick={() => handleQuantityChange(-1)} className="bg-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-300 h-10 w-10 rounded-l-md transition-colors">
                    <span className="m-auto text-2xl font-thin">−</span>
                  </button>
                  <input type="number" className="outline-none focus:outline-none text-center w-16 bg-gray-100 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default h-10" name="quantity" value={quantity} readOnly />
                  <button onClick={() => handleQuantityChange(1)} className="bg-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-300 h-10 w-10 rounded-r-md transition-colors">
                    <span className="m-auto text-2xl font-thin">+</span>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  id="note"
                  rows="3"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Thêm ghi chú của bạn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                Tổng: {totalPrice.toLocaleString()}đ
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-blue-900 text-white text-lg font-semibold rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}