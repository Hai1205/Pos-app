import React, { useState, useEffect } from 'react';

export function PriceSlider({ items, onPriceChange }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [currentMinPrice, setCurrentMinPrice] = useState(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(0);

  useEffect(() => {
    if (items?.length) {
      const prices = items.map(item => item.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      setMinPrice(lowestPrice);
      setMaxPrice(highestPrice);
      setCurrentMinPrice(lowestPrice);
      setCurrentMaxPrice(highestPrice);
    }
  }, [items]);

  const getPercent = (value) => 
    Math.round(((value - minPrice) / (maxPrice - minPrice)) * 100);

  const handleMinPriceChange = (event) => {
    const value = Math.min(Number(event.target.value), currentMaxPrice - 1);
    setCurrentMinPrice(value);
    onPriceChange(value, currentMaxPrice);
  };

  const handleMaxPriceChange = (event) => {
    const value = Math.max(Number(event.target.value), currentMinPrice + 1);
    setCurrentMaxPrice(value);
    onPriceChange(currentMinPrice, value);
  };

  return (
    <div className="w-full max-w-md mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lọc theo giá: {currentMinPrice.toLocaleString()}đ - {currentMaxPrice.toLocaleString()}đ
      </label>
      
      <div className="relative pt-1">
        <div className="h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute h-1 bg-white rounded-full"
          style={{
            left: '0',
            width: `${getPercent(currentMinPrice)}%`,
          }}
        />
        <div
          className="absolute h-1 bg-blue-400 rounded-full"
          style={{
            left: `${getPercent(currentMinPrice)}%`,
            width: `${getPercent(currentMaxPrice) - getPercent(currentMinPrice)}%`,
          }}
        />
        <div
          className="absolute h-1 bg-white rounded-full"
          style={{
            left: `${getPercent(currentMaxPrice)}%`,
            right: '0',
          }}
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={currentMinPrice}
          onChange={handleMinPriceChange}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer "
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={currentMaxPrice}
          onChange={handleMaxPriceChange}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}

export default PriceSlider;