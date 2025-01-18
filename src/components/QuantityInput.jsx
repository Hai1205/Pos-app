import React from 'react';

export function QuantityInput({ value, onChange, min = 1, max }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md">
      <button
        onClick={handleDecrease}
        className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          if (!isNaN(newValue) && newValue >= min && (max === undefined || newValue <= max)) {
            onChange(newValue);
          }
        }}
        className="w-12 text-center border-none focus:outline-none"
        min={min}
        max={max}
      />
      <button
        onClick={handleIncrease}
        className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none"
      >
        +
      </button>
    </div>
  );
}